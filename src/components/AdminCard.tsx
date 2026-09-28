import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, hitSize } from '../styles/theme';

type Props = {
  icon: string;
  titulo: string;
  subtitulo?: string;
  onPress?: () => void;
  style?: ViewStyle;
  destaque?: boolean;
  badge?: string;
};

/** Card de ação do painel administrativo. */
export default function AdminCard({ icon, titulo, subtitulo, onPress, style, destaque, badge }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.container, style]}
      accessibilityRole="button"
    >
      <View style={[styles.iconeCaixa, destaque && styles.iconeCaixaDestaque]}>
        <Text style={styles.icone}>{icon}</Text>
      </View>

      <View style={styles.textos}>
        <Text style={styles.titulo} numberOfLines={1}>{titulo}</Text>
        {!!subtitulo && <Text style={styles.subtitulo} numberOfLines={2}>{subtitulo}</Text>}
      </View>

      {!!badge && (
        <View style={[styles.badge, destaque && styles.badgeDestaque]}>
          <Text style={styles.badgeTexto}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: hitSize.comfortable + 12,
  },
  iconeCaixa: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeCaixaDestaque: {
    backgroundColor: colors.glowSoft,
  },
  icone: {
    fontSize: 21,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  subtitulo: {
    color: colors.textLight,
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surfaceAlt,
  },
  badgeDestaque: {
    backgroundColor: colors.primary,
  },
  badgeTexto: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
});
