import { useContext, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { CartContext } from '../services/CartContext';
import { auth } from '../database/database';

/** Regras do combo: 10% de desconto, com teto para não pesar demais no vendedor. */
export const DESCONTO_COMBO = 0.1;
export const TETO_DESCONTO_COMBO = 5;

export const PASSOS_COMBO = [
  { id: 'lanche', rotulo: 'Lanche', emoji: '🍔' },
  { id: 'bebida', rotulo: 'Bebida', emoji: '🥤' },
  { id: 'doce', rotulo: 'Doce', emoji: '🍰' },
] as const;

function estaDisponivel(lanche: any) {
  if (!lanche) return false;
  if (lanche.disponivel === false) return false;
  if (lanche.quantidadeDisponivel !== undefined && lanche.quantidadeDisponivel !== null) {
    return Number(lanche.quantidadeDisponivel) > 0;
  }
  return true;
}

function categoriasDe(lanche: any): string[] {
  if (Array.isArray(lanche?.categorias)) return lanche.categorias;
  if (lanche?.categoria) return [lanche.categoria];
  return [];
}

/**
 * "Monte seu combo": lanche + bebida + doce em três toques, do mesmo
 * vendedor (para gerar um único pedido) e com o desconto já aplicado
 * no carrinho.
 */
export function useComboLogic(lanches: any[], onFechar: () => void) {
  const { adicionarComboAoCarrinho } = useContext(CartContext);
  const [passo, setPasso] = useState(0);
  const [escolha, setEscolha] = useState<Record<string, any>>({});
  const [salvando, setSalvando] = useState(false);

  const uid = auth.currentUser?.uid;

  const disponiveis = useMemo(
    () =>
      (lanches || []).filter(
        (l) => estaDisponivel(l) && (!l?.userId || l.userId !== uid)
      ),
    [lanches, uid]
  );

  const passoAtual = PASSOS_COMBO[passo];

  /** Opções do passo atual — travadas no mesmo vendedor depois do lanche. */
  const opcoes = useMemo(() => {
    const vendedorFixo = escolha.lanche?.userId;
    return disponiveis.filter((l) => {
      if (!categoriasDe(l).includes(passoAtual.id)) return false;
      if (vendedorFixo && l.userId !== vendedorFixo) return false;
      return true;
    });
  }, [disponiveis, escolha.lanche, passoAtual.id]);

  const itensEscolhidos = useMemo(
    () => PASSOS_COMBO.map((p) => escolha[p.id]).filter(Boolean),
    [escolha]
  );

  const subtotal = useMemo(
    () => itensEscolhidos.reduce((soma, item) => soma + (Number(item.preco) || 0), 0),
    [itensEscolhidos]
  );

  const desconto = useMemo(
    () => Math.min(subtotal * DESCONTO_COMBO, TETO_DESCONTO_COMBO),
    [subtotal]
  );

  const total = Math.max(0, subtotal - desconto);

  const completo = !!escolha.lanche && !!escolha.bebida && !!escolha.doce;

  function selecionar(item: any) {
    setEscolha((atual) => {
      // se trocar o lanche depois, as outras escolhas de outro vendedor caem
      const novo = { ...atual, [passoAtual.id]: item };
      if (passoAtual.id === 'lanche' && atual.lanche?.userId !== item.userId) {
        delete novo.bebida;
        delete novo.doce;
      }
      return novo;
    });

    // já era o último passo possível? vai pro próximo que tiver opções
    const proximo = PASSOS_COMBO[passo + 1];
    if (proximo) {
      const temProximo = disponiveis.some(
        (l) => categoriasDe(l).includes(proximo.id) && l.userId === item.userId
      );
      if (temProximo) setPasso(passo + 1);
      else if (passo + 2 < PASSOS_COMBO.length) setPasso(passo + 2);
    }
  }

  function voltarPasso() {
    if (passo === 0) {
      setEscolha({});
    } else {
      setPasso(passo - 1);
    }
  }

  /** Volta para um passo já preenchido para trocar a escolha. */
  function irParaPasso(indice: number) {
    if (indice === passo) return;
    if (PASSOS_COMBO.slice(0, indice).every((p) => escolha[p.id])) setPasso(indice);
  }

  function pularPasso() {
    if (passo + 1 < PASSOS_COMBO.length) setPasso(passo + 1);
  }

  function reiniciar() {
    setPasso(0);
    setEscolha({});
  }

  async function adicionar() {
    if (!escolha.lanche) {
      Alert.alert('Escolha um lanche', 'O combo começa pelo lanche.');
      return;
    }
    if (itensEscolhidos.length < 2) {
      Alert.alert('Combo incompleto', 'Escolha pelo menos mais um item.');
      return;
    }

    setSalvando(true);
    const ok = adicionarComboAoCarrinho(itensEscolhidos, desconto);
    setSalvando(false);

    if (ok) {
      reiniciar();
      onFechar();
      Alert.alert(
        'Combo no carrinho! 🎉',
        completo
          ? `Você economizou R$ ${desconto.toFixed(2)} no combo.`
          : `Desconto de R$ ${desconto.toFixed(2)} aplicado.`
      );
    }
  }

  return {
    passo,
    passoAtual,
    opcoes,
    escolha,
    itensEscolhidos,
    subtotal,
    desconto,
    total,
    completo,
    salvando,
    temProximo: passo + 1 < PASSOS_COMBO.length,
    selecionar,
    voltarPasso,
    irParaPasso,
    pularPasso,
    adicionar,
  };
}
