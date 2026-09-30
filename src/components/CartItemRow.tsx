import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FoodImage from './FoodImage';
import QuantitySelector from './QuantitySelector';
import { colors, borderRadius, spacing } from '../styles/theme';

export type ItemCarrinho = {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
  localRetirada?: string;
  quantidadeDisponivel?: number;
  /** Epoch ms: quando a linha perde o estoque reservado. */
  expiraEm?: number;
  /** true quando o pedido já foi criado: não há mais prazo. */
  pedidoCriado?: boolean;
};

type Props = {
  item: ItemCarrinho;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  onPress?: () => void;
};

/** "3:47" no formato mm:ss, ou null quando já venceu / não há prazo. */
function tempoRestante(expiraEm: number | undefined, agora: number): string | null {
  if (!expiraEm) return null;
  const restante = Math.max(0, Math.floor((expiraEm - agora) / 1000));
  if (restante === 0) return null;

  const min = Math.floor(restante / 60);
  const seg = restante % 60;
  return `${min}:${String(seg).padStart(2, '0')}`;
}

/** Linha do carrinho: miniatura, nome, preço e controle de quantidade. */
export default function CartItemRow({ item, onIncrease, onDecrease, onRemove, onPress }: Props) {
  const total = (Number(item.preco) || 0) * (item.quantidade || 0);
  const [agora, setAgora] = useState(() => Date.now());

  // Só há relógio quando existe prazo: depois do pedido o item não expira.
  const temPrazo = !item.pedidoCriado && !!item.expiraEm;
  useEffect(() => {
    if (!temPrazo) return;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [temPrazo]);

  const restante = tempoRestante(item.expiraEm, agora);
  const urgente = !!restante && Number(restante.split(':')[0]) < 1;

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={!onPress}>
        <FoodImage uri={item.imagem} style={styles.thumb} radius={borderRadius.md} fallbackIcon="🍔" />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={2}>{item.nome}</Text>
        <Text style={styles.precoUnitario}>R$ {(Number(item.preco) || 0).toFixed(2)}</Text>

        {item.pedidoCriado ? (
          <Text style={styles.prazo}>✅ Pedido criado, aguardando pagamento</Text>
        ) : restante ? (
          <Text style={[styles.prazo, urgente && styles.prazoUrgente]}>
            ⏱ Sai do carrinho em {restante}
          </Text>
        ) : null}

        <View style={styles.rodape}>
          <QuantitySelector
            quantidade={item.quantidade}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            onRemove={onRemove}
            size="sm"
          />
          <Text style={styles.total}>R$ {total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  thumb: {
    width: 78,
    height: 78,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nome: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  precoUnitario: {
    color: colors.textLight,
    fontSize: 12,
    marginTop: 2,
  },
  prazo: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  prazoUrgente: {
    color: colors.danger,
  },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  total: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
});