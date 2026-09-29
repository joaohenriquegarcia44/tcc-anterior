import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../database/database';

/**
 * Apenas pedidos que realmente viraram venda entram na conta:
 * aguardando_pagamento -> pago -> homologada -> retirado.
 * Cancelados, recusados e incompletos ficam de fora por definição.
 */
export const STATUS_VALIDOS = ['homologada', 'retirado'];

/** Janelas oferecidas no seletor de período. */
export const PERIODOS = [
  { dias: 7, rotulo: 'Últimos 7 dias' },
  { dias: 30, rotulo: 'Últimos 30 dias' },
  { dias: 90, rotulo: 'Últimos 90 dias' },
];

export type PontoVenda = {
  data: Date;
  label: string;
  valor: number;
  pedidos: number;
};

export type ProdutoVendido = {
  id: string;
  nome: string;
  imagem?: string;
  quantidade: number;
  variacao: number;
};

/** Pedido já normalizado: dia em string + itens agregados por produto. */
type VendaBruta = {
  chave: string;
  total: number;
  itens: Record<string, { nome: string; imagem?: string; qtd: number }>;
};

/** Aceita Timestamp do Firestore, Date ou string. */
function paraData(valor: any): Date | null {
  if (!valor) return null;
  if (typeof valor.toDate === 'function') return valor.toDate();
  if (valor instanceof Date) return valor;
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}

/** Dia local em "AAAA-MM-JJ" — comparável como string e estável por fuso. */
function chaveDia(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function rotuloDia(d: Date): string {
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
}

export function formatarMoeda(valor: number): string {
  return (Number(valor) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatarPercentual(valor: number): string {
  const v = Math.round(Number(valor) || 0);
  return `${v > 0 ? '+' : ''}${v}%`;
}

/**
 * Dashboard de vendas do vendedor/administrador.
 *
 * Traz os pedidos do próprio usuário (`vendedorId` == uid), agrupa por dia e
 * compara o período escolhido com a janela imediatamente anterior, do mesmo
 * tamanho. A média é sempre total ÷ dias do período — dias sem venda contam
 * como zero, que é o que o dono da lancheria espera ver.
 */
export function useVendasLogic(navigation: any) {
  const [dias, setDias] = useState(30);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [permitido, setPermitido] = useState(false);
  const [vendas, setVendas] = useState<VendaBruta[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  // 1 · Permissão: só quem tem usuarios/{uid}.papel === 'admin' entra aqui.
  useEffect(() => {
    let vivo = true;

    async function verificarPermissao() {
      const user = auth.currentUser;
      if (!user) {
        navigation.replace('Login');
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'usuarios', user.uid));
        if (!vivo) return;
        if (snap.data()?.papel !== 'admin') {
          Alert.alert('Acesso negado', 'Você não tem permissão para acessar esta área.');
          navigation.goBack();
          return;
        }
        setPermitido(true);
      } catch {
        if (!vivo) return;
        Alert.alert('Acesso negado', 'Não foi possível validar seu acesso.');
        navigation.goBack();
      }
    }

    verificarPermissao();
    return () => {
      vivo = false;
    };
  }, [navigation]);

  const carregar = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setErro(null);

      // Precisamos do período atual e do anterior para comparar: 2x a janela.
      const limite = new Date();
      limite.setHours(0, 0, 0, 0);
      limite.setDate(limite.getDate() - dias * 2);

      const q = query(
        collection(db, 'pedidos'),
        where('vendedorId', '==', user.uid),
        where('status', 'in', STATUS_VALIDOS),
        where('criadoEm', '>=', limite)
      );
      const snapshot = await getDocs(q);

      const brutas: VendaBruta[] = [];
      snapshot.docs.forEach((doc) => {
        const pedido: any = doc.data();
        const data = paraData(pedido.criadoEm);
        if (!data) return;

        // Os itens vêm desnormalizados no pedido (nome e imagem inclusos),
        // então não precisamos buscar na coleção lanches.
        const itens: VendaBruta['itens'] = {};
        (Array.isArray(pedido.lanches) ? pedido.lanches : []).forEach((item: any) => {
          const qtd = Number(item?.quantidade) || 0;
          if (!item?.id || qtd <= 0) return;
          itens[item.id] = {
            nome: item.nome || 'Lanche',
            imagem: item.imagem || undefined,
            qtd: (itens[item.id]?.qtd || 0) + qtd,
          };
        });

        brutas.push({
          chave: chaveDia(data),
          total: Number(pedido.total) || 0,
          itens,
        });
      });

      setVendas(brutas);
    } catch (e) {
      console.log('Erro ao carregar vendas:', e);
      setErro('Não foi possível carregar suas vendas agora.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [dias]);

  useEffect(() => {
    if (!permitido) return;
    setCarregando(true);
    carregar();
  }, [permitido, carregar]);

  // 2 · Séries diárias — um bucket por dia do período, zerados quando não houve venda.
  const serie = useMemo<PontoVenda[]>(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicio = new Date(hoje);
    inicio.setDate(inicio.getDate() - (dias - 1));

    const porDia = new Map<string, { data: Date; valor: number; pedidos: number }>();
    for (let i = 0; i < dias; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      porDia.set(chaveDia(d), { data: d, valor: 0, pedidos: 0 });
    }

    vendas.forEach((venda) => {
      const bucket = porDia.get(venda.chave);
      if (!bucket) return;
      bucket.valor += venda.total;
      bucket.pedidos += 1;
    });

    return Array.from(porDia.values()).map((b) => ({
      data: b.data,
      label: rotuloDia(b.data),
      valor: b.valor,
      pedidos: b.pedidos,
    }));
  }, [vendas, dias]);

  // 3 · Totais do período e da janela anterior de mesmo tamanho.
  const resumo = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicio = new Date(hoje);
    inicio.setDate(inicio.getDate() - (dias - 1));
    const anterior = new Date(hoje);
    anterior.setDate(anterior.getDate() - (dias * 2 - 1));

    const chaveInicio = chaveDia(inicio);
    const chaveAnterior = chaveDia(anterior);

    let total = 0;
    let pedidos = 0;
    let totalAnterior = 0;
    let pedidosAnterior = 0;

    vendas.forEach((venda) => {
      if (venda.chave >= chaveInicio) {
        total += venda.total;
        pedidos += 1;
      } else if (venda.chave >= chaveAnterior) {
        totalAnterior += venda.total;
        pedidosAnterior += 1;
      }
    });

    const media = total / dias;
    const mediaAnterior = totalAnterior / dias;

    return {
      total,
      pedidos,
      totalAnterior,
      pedidosAnterior,
      media,
      mediaAnterior,
      variacao:
        mediaAnterior > 0
          ? ((media - mediaAnterior) / mediaAnterior) * 100
          : total > 0
            ? 100
            : 0,
    };
  }, [vendas, dias]);

  // 4 · Produtos mais vendidos no período, com o mesmo comparativo.
  const topProdutos = useMemo<ProdutoVendido[]>(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicio = new Date(hoje);
    inicio.setDate(inicio.getDate() - (dias - 1));
    const chaveInicio = chaveDia(inicio);

    const mapa = new Map<string, { nome: string; imagem?: string; atual: number; anterior: number }>();

    vendas.forEach((venda) => {
      const dentroDoPeriodo = venda.chave >= chaveInicio;
      Object.entries(venda.itens).forEach(([id, item]) => {
        const registro = mapa.get(id) || {
          nome: item.nome,
          imagem: item.imagem,
          atual: 0,
          anterior: 0,
        };
        if (dentroDoPeriodo) registro.atual += item.qtd;
        else registro.anterior += item.qtd;
        mapa.set(id, registro);
      });
    });

    return Array.from(mapa.entries())
      .map(([id, r]) => ({
        id,
        nome: r.nome,
        imagem: r.imagem,
        quantidade: r.atual,
        variacao:
          r.anterior > 0 ? ((r.atual - r.anterior) / r.anterior) * 100 : r.atual > 0 ? 100 : 0,
      }))
      .filter((p) => p.quantidade > 0)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 6);
  }, [vendas, dias]);

  const periodo = useMemo(
    () => PERIODOS.find((p) => p.dias === dias) || PERIODOS[1],
    [dias]
  );

  function trocarPeriodo(novoDias: number) {
    if (novoDias !== dias) setDias(novoDias);
  }

  const atualizar = useCallback(async () => {
    setAtualizando(true);
    await carregar();
  }, [carregar]);

  return {
    carregando,
    atualizando,
    permitido,
    erro,
    dias,
    periodo,
    trocarPeriodo,
    atualizar,
    resumo,
    serie,
    topProdutos,
  };
}
