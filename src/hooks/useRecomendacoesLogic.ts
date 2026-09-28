import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../database/database';

const MAX_SUGESTOES = 3;

function categoriasDe(lanche: any): string[] {
  if (Array.isArray(lanche?.categorias)) return lanche.categorias;
  if (lanche?.categoria) return [lanche.categoria];
  return [];
}

function estaDisponivel(lanche: any): boolean {
  if (!lanche) return false;
  if (lanche.disponivel === false) return false;
  if (lanche.quantidadeDisponivel !== undefined && lanche.quantidadeDisponivel !== null) {
    return Number(lanche.quantidadeDisponivel) > 0;
  }
  return true;
}

const NOMES_CATEGORIA: Record<string, string> = {
  lanche: 'salgados',
  bebida: 'bebidas',
  doce: 'doces',
  promocao: 'promoções',
};

/**
 * "Quase nos seus favoritos": olha o histórico de pedidos do próprio aluno e
 * sugere itens parecidos — mesma categoria do que ele mais compra, que ainda
 * não estão nos favoritos e que ele não pode comprar (lanche próprio).
 */
export function useRecomendacoesLogic(lanches: any[], idsFavoritos: string[] = []) {
  const [idsPedidos, setIdsPedidos] = useState<Record<string, number>>({});
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    let encerrado = false;

    const inscricao = onSnapshot(
      query(collection(db, 'pedidos'), where('compradorId', '==', uid)),
      (snapshot) => {
        if (encerrado) return;
        const mapa: Record<string, number> = {};
        snapshot.docs.forEach((doc) => {
          const itens = Array.isArray(doc.data()?.lanches) ? doc.data().lanches : [];
          itens.forEach((item: any) => {
            if (!item?.id) return;
            mapa[item.id] = (mapa[item.id] || 0) + (Number(item.quantidade) || 1);
          });
        });
        setIdsPedidos(mapa);
        setCarregado(true);
      },
      () => {
        if (encerrado) return;
        setIdsPedidos({});
        setCarregado(true);
      }
    );

    return () => {
      encerrado = true;
      inscricao();
    };
  }, []);

  const sugestoes = useMemo(() => {
    if (!carregado || !Object.keys(idsPedidos).length) return { itens: [] as any[], motivo: '' };

    const uid = auth.currentUser?.uid;

    // categorias mais compradas pelo aluno
    const pesoPorCategoria: Record<string, number> = {};
    Object.entries(idsPedidos).forEach(([id, vezes]) => {
      const lanche = lanches.find((l) => l.id === id);
      categoriasDe(lanche).forEach((cat) => {
        pesoPorCategoria[cat] = (pesoPorCategoria[cat] || 0) + vezes;
      });
    });

    const categorias = Object.entries(pesoPorCategoria).sort((a, b) => b[1] - a[1]);
    if (!categorias.length) return { itens: [] as any[], motivo: '' };

    const jaPedidos = new Set(Object.keys(idsPedidos));
    const favoritos = new Set(idsFavoritos);
    const primeiraCategoria = categorias[0][0];

    const candidatos = lanches.filter((l) => {
      if (l?.userId && l.userId === uid) return false; // não vende para si mesmo
      if (!estaDisponivel(l)) return false;
      if (favoritos.has(l.id)) return false; // já aparece em "Seus favoritos"
      return categoriasDe(l).some((cat) => pesoPorCategoria[cat] > 0);
    });

    // prioriza a categoria mais pedida e evita repetir item já pedido
    const ordenar = (a: any, b: any) => {
      const pa = Math.max(...categoriasDe(a).map((c) => pesoPorCategoria[c] || 0));
      const pb = Math.max(...categoriasDe(b).map((c) => pesoPorCategoria[c] || 0));
      if (pa !== pb) return pb - pa;
      return Number(b.mediaAvaliacao || 0) - Number(a.mediaAvaliacao || 0);
    };

    let itens = candidatos.sort(ordenar);

    // se sobraram candidatos que ele nunca pediu, prefere esses
    const novos = itens.filter((l) => !jaPedidos.has(l.id));
    if (novos.length >= MAX_SUGESTOES) itens = novos;

    return {
      itens: itens.slice(0, MAX_SUGESTOES),
      motivo: NOMES_CATEGORIA[primeiraCategoria] || primeiraCategoria,
    };
  }, [carregado, idsPedidos, lanches, idsFavoritos]);

  return sugestoes;
}
