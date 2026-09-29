import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FoodImage from './FoodImage';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';

type Props = {
  titulo?: string;
  subtitulo?: string;
  cta?: string;
  onCta?: () => void;
  /** URL remota (string) ou imagem local via require() (number). */
  imagem?: string | number | null;
  altura?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
};

/** Banner promocional grande, com foto de comida em destaque. */
export default function Banner({
  titulo = 'LANCHES DE VERDADE\nPARA O SEU DIA!',
  subtitulo,
  cta = 'Confira agora',
  onCta,
  imagem,
  altura = 220,
  style,
  children,
}: Props) {
  return (
    <View style={[styles.container, { height: altura }, style]}>
      <FoodImage
        uri={imagem}
        style={StyleSheet.absoluteFill}
        radius={borderRadius.xxl}
        fallbackIcon="🍔"
      />
      <LinearGradient
        colors={['rgba(5,5,5,0.15)', 'rgba(5,5,5,0.70)', 'rgba(181,0,18,0.85)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.xxl }]}
        pointerEvents="none"
      />

      <View style={styles.conteudo}>
        <Text style={styles.titulo}>{titulo}</Text>
        {!!subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
        {children}
        {!!cta && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onCta}
            style={styles.cta}
            accessibilityRole="button"
          >
            <Text style={styles.ctaTexto}>{cta}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    ...shadows.medium,
  },
  conteudo: {
    padding: spacing.xl,
  },
  titulo: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  subtitulo: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.xl,
    paddingVertical: 11,
  },
  ctaTexto: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});
