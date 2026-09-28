import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../styles/theme';

type Props = {
  icon: string;
  titulo: string;
  onPress?: () => void;
  style?: ViewStyle;
  ativo?: boolean;
  tamanho?: number;
  badge?: number;
};

/** Botão circular de ação (usado no "+" dos cards e no carrinho do header). */
export default function CircleActionButton({ icon, titulo, onPress, style, ativo, tamanho = 40, badge = 0 }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.base,
        { width: tamanho, height: tamanho, borderRadius: tamanho / 2 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      <Text style={[styles.icone, { fontSize: tamanho * 0.45 }]}>{icon}</Text>
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeTexto}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  icone: {
    color: colors.white,
    fontWeight: '700',
    lineHeight: undefined,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeTexto: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '900',
  },
});
