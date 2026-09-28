import React from 'react';
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
};

type Props = {
  item: ItemCarrinho;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  onPress?: () => void;
};

/** Linha do carrinho: miniatura, nome, preço e controle de quantidade. */
export default function CartItemRow({ item, onIncrease, onDecrease, onRemove, onPress }: Props) {
  const total = (Number(item.preco) || 0) * (item.quantidade || 0);

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={!onPress}>
        <FoodImage uri={item.imagem} style={styles.thumb} radius={borderRadius.md} fallbackIcon="🍔" />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={2}>{item.nome}</Text>
        <Text style={styles.precoUnitario}>R$ {(Number(item.preco) || 0).toFixed(2)}</Text>

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
