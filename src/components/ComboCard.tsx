import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';
import { DESCONTO_COMBO } from '../hooks/useComboLogic';

type Props = {
  onPress: () => void;
  compacto?: boolean;
};

/** Card que abre o "Monte seu combo" na Home. */
export default function ComboCard({ onPress, compacto }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, compacto && styles.cardCompacto]}
      accessibilityRole="button"
      accessibilityLabel="Montar combo"
    >
      <View style={styles.textos}>
        <Text style={styles.titulo}>🎁 Monte seu combo</Text>
        <Text style={styles.subtitulo} numberOfLines={2}>
          Lanche + bebida + doce em 3 toques
        </Text>
        {!compacto && (
          <Text style={styles.selo}>
            {Math.round(DESCONTO_COMBO * 100)}% de desconto já aplicado
          </Text>
        )}
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaTexto}>Montar</Text>
        <Text style={styles.ctaSeta}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: 76,
    ...shadows.small,
  },
  cardCompacto: { minHeight: 64 },
  textos: { flex: 1, gap: 2 },
  titulo: { color: colors.text, fontSize: 15, fontWeight: '800' },
  subtitulo: { color: colors.textLight, fontSize: 12 },
  selo: { color: colors.secondary, fontSize: 11, fontWeight: '800', marginTop: 2 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
  },
  ctaTexto: { color: colors.white, fontSize: 14, fontWeight: '800' },
  ctaSeta: { color: colors.white, fontSize: 18, fontWeight: '800' },
});
