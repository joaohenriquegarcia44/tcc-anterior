import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, hitSize } from '../styles/theme';

type Props = {
  quantidade: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove?: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
};

/** Controle [-] quantidade [+] com alvos de toque grandes. */
export default function QuantitySelector({
  quantidade,
  onDecrease,
  onIncrease,
  onRemove,
  min = 1,
  max = 999,
  size = 'md',
}: Props) {
  const compacto = size === 'sm';
  const lado = compacto ? 34 : hitSize.min;

  return (
    <View style={[styles.container, compacto && styles.containerCompacto]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onDecrease}
        style={[styles.botao, { width: lado, height: lado }]}
        accessibilityLabel="Diminuir quantidade"
      >
        <Text style={styles.botaoTexto}>−</Text>
      </TouchableOpacity>

      <Text style={[styles.quantidade, compacto && styles.quantidadeCompacta]}>{quantidade}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onIncrease}
        disabled={quantidade >= max}
        style={[styles.botao, { width: lado, height: lado }, quantidade >= max && styles.botaoDesativado]}
        accessibilityLabel="Aumentar quantidade"
      >
        <Text style={styles.botaoTexto}>+</Text>
      </TouchableOpacity>

      {!!onRemove && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRemove}
          style={[styles.botao, { width: lado, height: lado }, compacto && styles.remover]}
          accessibilityLabel="Remover item"
        >
          <Text style={styles.removerTexto}>🗑</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  containerCompacto: {
    padding: 3,
    gap: 2,
  },
  botao: {
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDesativado: {
    opacity: 0.4,
  },
  botaoTexto: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  remover: {
    backgroundColor: 'transparent',
  },
  removerTexto: {
    fontSize: 14,
  },
  quantidade: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  quantidadeCompacta: {
    fontSize: 13,
    minWidth: 16,
  },
});
