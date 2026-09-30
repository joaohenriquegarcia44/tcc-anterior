import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../database/database';

/** Tempo que o lanche fica preso no carrinho antes de voltar ao estoque. */
export const TEMPO_RESERVA_MS = 5 * 60 * 1000;

/** Depois que o pedido é criado, o cliente tem esta janela para pagar. */
export const JANELA_PAGAMENTO_MS = 15 * 60 * 1000;

export type ResultadoReserva = {
  ok: boolean;
  /** Epoch ms em que a reserva vence. */
  expiraEm: number;
  /** true quando o lanche não tem controle de estoque (campo ausente). */
  semEstoque: boolean;
};

function chave(usuarioId: string, lancheId: string) {
  return `${usuarioId}_${lancheId}`;
}

/** Lanches criados antes do controle de estoque não têm o campo. */
function temControleDeEstoque(produto: any): boolean {
  if (produto?.quantidadeDisponivel === undefined || produto?.quantidadeDisponivel === null) return false;
  return Number.isFinite(Number(produto.quantidadeDisponivel));
}

function refReserva(usuarioId: string, lancheId: string) {
  return doc(db, 'reservas', chave(usuarioId, lancheId));
}

function agora() {
  return Timestamp.fromMillis(Date.now());
}

/**
 * Reserva `quantidade` unidades: o estoque do vendedor já sai do cardápio no
 * mesmo instante (transação), e a reserva vale por TEMPO_RESERVA_MS.
 * `ok: false` com estoque insuficiente impede a entrada no carrinho.
 */
export async function reservar(produto: any, quantidade: number): Promise<ResultadoReserva> {
  const uid = auth.currentUser?.uid;
  const expiraEm = Date.now() + TEMPO_RESERVA_MS;

  if (quantidade <= 0) return { ok: false, expiraEm, semEstoque: false };
  // Sem sessão (ou lanche sem controle de estoque) a reserva não existe: o
  // item entra no carrinho mesmo assim, só sem garantia de estoque.
  if (!uid) return { ok: true, expiraEm, semEstoque: true };
  if (!temControleDeEstoque(produto)) return { ok: true, expiraEm, semEstoque: true };

  const refLanche = doc(db, 'lanches', produto.id);
  const reserva = refReserva(uid, produto.id);

  try {
    await runTransaction(db, async (tx) => {
      const [snapLanche, snapReserva] = await Promise.all([tx.get(refLanche), tx.get(reserva)]);

      const estoque = Number(snapLanche.data()?.quantidadeDisponivel ?? 0);
      // O estoque já vem líquido das reservas ativas: não subtrai a reserva
      // do próprio usuário de novo.
      if (estoque < quantidade) throw new Error('sem-estoque');

      const jaReservado = snapReserva.exists() ? Number(snapReserva.data()?.quantidade || 0) : 0;

      tx.update(refLanche, { quantidadeDisponivel: estoque - quantidade });
      tx.set(reserva, {
        usuarioId: uid,
        lancheId: produto.id,
        lancheNome: produto.nome || null,
        vendedorId: produto.userId || null,
        quantidade: jaReservado + quantidade,
        expiraEm: Timestamp.fromMillis(expiraEm),
        atualizadoEm: agora(),
      });
    });
  } catch (error: any) {
    if (error?.message === 'sem-estoque') return { ok: false, expiraEm, semEstoque: false };
    // Regras do Firestore ou rede podem impedir a reserva: nesse caso o item
    // entra no carrinho mesmo assim, só sem garantia de estoque.
    console.log('Não foi possível reservar estoque:', error?.message || error);
    return { ok: false, expiraEm, semEstoque: false };
  }

  return { ok: true, expiraEm, semEstoque: false };
}

/** Devolve ao estoque do vendedor o que ainda estava reservado. */
export async function devolver(lancheId: string, quantidade: number, usuarioId?: string | null) {
  const uid = usuarioId || auth.currentUser?.uid;
  if (!uid || quantidade <= 0) return;

  const refLanche = doc(db, 'lanches', lancheId);
  const reserva = refReserva(uid, lancheId);

  try {
    await runTransaction(db, async (tx) => {
      const snapReserva = await tx.get(reserva);
      if (!snapReserva.exists()) return;

      const reservada = Number(snapReserva.data()?.quantidade || 0);
      const aDevolver = Math.min(quantidade, reservada);
      if (aDevolver <= 0) return;

      const snapLanche = await tx.get(refLanche);
      const estoque = Number(snapLanche.data()?.quantidadeDisponivel ?? 0);
      tx.update(refLanche, { quantidadeDisponivel: estoque + aDevolver });

      const restante = reservada - aDevolver;
      if (restante > 0) tx.update(reserva, { quantidade: restante });
      else tx.delete(reserva);
    });
  } catch (error: any) {
    console.log('Não foi possível devolver o estoque:', error?.message || error);
  }
}

/** Estica a reserva quando o pedido é criado: o cliente ainda precisa pagar. */
export async function estenderParaPagamento(lancheIds: string[], pedidoId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const expiraEm = Timestamp.fromMillis(Date.now() + JANELA_PAGAMENTO_MS);

  await Promise.all(
    lancheIds.map(async (id) => {
      const reserva = refReserva(uid, id);
      try {
        const snapshot = await getDoc(reserva);
        // Só existe reserva de quem realmente segurou estoque.
        if (!snapshot.exists()) return;
        await updateDoc(reserva, { pedidoId, expiraEm, atualizadoEm: agora() });
      } catch (error: any) {
        console.log('Não foi possível estender a reserva:', error?.message || error);
      }
    })
  );
}

/** Pedido pago: a reserva some do Firestore e o estoque fica consumido. */
export async function consumir(lancheIds: string[]) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  await Promise.all(
    lancheIds.map((id) =>
      deleteDoc(refReserva(uid, id)).catch((error: any) =>
        console.log('Não foi possível consumir a reserva:', error?.message || error)
      )
    )
  );
}

/** Reservas vencidas do usuário: pedido abandonado ou app fechado no meio. */
export async function liberarExpiradas(): Promise<number> {
  const uid = auth.currentUser?.uid;
  if (!uid) return 0;

  let liberadas = 0;
  try {
    const snapshot = await getDocs(query(collection(db, 'reservas'), where('usuarioId', '==', uid)));

    for (const docReserva of snapshot.docs) {
      const dados = docReserva.data();
      const expiraEm = dados?.expiraEm?.toMillis?.();
      if (!expiraEm || expiraEm > Date.now()) continue;

      const lancheId = dados?.lancheId;
      const quantidade = Number(dados?.quantidade || 0);

      if (lancheId && quantidade > 0) await devolver(lancheId, quantidade);
      else await deleteDoc(docReserva.ref);

      liberadas++;
    }
  } catch (error: any) {
    console.log('Não foi possível liberar as reservas vencidas:', error?.message || error);
  }

  return liberadas;
}

/** Logout/troca de conta: o carrinho em memória morre, então o estoque volta. */
export async function soltarTodas(usuarioId?: string | null): Promise<number> {
  const uid = usuarioId || auth.currentUser?.uid;
  if (!uid) return 0;

  let liberadas = 0;
  try {
    const snapshot = await getDocs(query(collection(db, 'reservas'), where('usuarioId', '==', uid)));

    for (const docReserva of snapshot.docs) {
      const dados = docReserva.data();
      const quantidade = Number(dados?.quantidade || 0);
      if (dados?.lancheId && quantidade > 0) await devolver(dados.lancheId, quantidade, uid);
      else await deleteDoc(docReserva.ref);
      liberadas++;
    }
  } catch (error: any) {
    console.log('Não foi possível soltar as reservas:', error?.message || error);
  }

  return liberadas;
}