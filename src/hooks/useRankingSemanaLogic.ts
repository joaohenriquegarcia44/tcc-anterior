import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../database/database';

const DIAS_SEMANA = 7;
const STATUS_IGNORADOS = ['cancelado', 'recusado'];

export type ItemRanking = {
  id: string;
  nome: string;
  imagem?: string;
  preco: number;
  quantidade: number;
  pedidos: number;
  /** true quando o ranking veio só dos pedidos do próprio usuário. */
  parcial: boolean;
};

type Contagem = { quantidade: number; pedidos: number };

function paraData(valor: any): Date | null {
  if (!valor) return null;
  if (typeof valor.toDate === 'function') return valor.toDate();
  if (valor instanceof Date) return valor;
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}

function categoriasDe(lanche: any): string[] {
  if (Array.isArray(lanche?.categorias)) return lanche.categorias;
  if (lanche?.categoria) return [lanche.categoria];
  return [];
}

/**
 * Top 5 da semana: agrupa os pedidos dos últimos 7 dias por lanches[].id.
 * A contagem é feita no cliente (sem criar collection nova no Firestore).
 * Se a leitura de todos os pedidos for bloqueada pelas regras, cai para
 * os pedidos do próprio usuário em vez de deixar a tela vazia.
 */
export function useRankingSemanaLogic(lanches: any[]) {
  const [contagem, setContagem] = useState<Record<string, Contagem>>({});
  const [parcial, setParcial] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    let encerrado = false;
    let cancelarParcial: (() => void) | null = null;

    function agregar(pedidos: any[], ehParcial: boolean) {
      if (encerrado) return;
      const limite = Date.now() - DIAS_SEMANA * 24 * 60 * 60 * 1000;
      const mapa: Record<string, Contagem> = {};

      pedidos.forEach((pedido) => {
        if (STATUS_IGNORADOS.includes(pedido?.status)) return;
        const criado = paraData(pedido?.criadoEm);
        if (criado && criado.getTime() < limite) return;

        const itens = Array.isArray(pedido?.lanches) ? pedido.lanches : [];
        itens.forEach((item: any) => {
          if (!item?.id) return;
          const qtd = Number(item.quantidade) || 1;
          const atual = mapa[item.id] || { quantidade: 0, pedidos: 0 };
          atual.quantidade += qtd;
          atual.pedidos += 1;
          mapa[item.id] = atual;
        });
      });

      setContagem(mapa);
      setParcial(ehParcial);
    }

    const inscricao = onSnapshot(
      query(collection(db, 'pedidos')),
      (snapshot) => agregar(snapshot.docs.map((d) => d.data()), false),
      () => {
        // Leitura ampla negada pelas regras: usa apenas os pedidos do usuário.
        if (encerrado) return;
        cancelarParcial = onSnapshot(
          query(collection(db, 'pedidos'), where('compradorId', '==', uid)),
          (snap) => agregar(snap.docs.map((d) => d.data()), true),
          () => {
            if (encerrado) return;
            setContagem({});
            setParcial(true);
          }
        );
      }
    );

    return () => {
      encerrado = true;
      inscricao();
      cancelarParcial?.();
    };
  }, []);

  const top5 = useMemo<ItemRanking[]>(() => {
    const ids = Object.keys(contagem);
    if (!ids.length) return [];

    return ids
      .map((id) => {
        const lanche = lanches.find((l) => l.id === id);
        return {
          id,
          nome: lanche?.nome || 'Lanche',
          imagem: lanche?.imagem,
          preco: Number(lanche?.preco) || 0,
          quantidade: contagem[id].quantidade,
          pedidos: contagem[id].pedidos,
          parcial,
        };
      })
      .sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome))
      .slice(0, 5);
  }, [contagem, lanches, parcial]);

  /** Top 1 da semana (usado no selo do card). */
  const campeao = top5[0] || null;

  return { top5, campeao, rankingParcial: parcial };
}
