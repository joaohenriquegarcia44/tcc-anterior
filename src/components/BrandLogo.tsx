import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, fonts, spacing } from '../styles/theme';

type Props = {
  tamanho?: number;
  mostrarSlogan?: boolean;
  alinhado?: 'center' | 'left';
};

/** Logo "Al-lanches" com ícone de hambúrguer e o slogan "Sabor no IF". */
export default function BrandLogo({ tamanho = 34, mostrarSlogan = true, alinhado = 'center' }: Props) {
  const alinhar: any = alinhado === 'center' ? { alignItems: 'center' } : { alignItems: 'flex-start' };

  return (
    <View style={[styles.container, alinhar]}>
      <View style={styles.marca}>
        <LinearGradient
          colors={['#FF5A63', '#FF1E2D', '#B50012']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconeCaixa}
        >
          <Text style={styles.icone}>🍔</Text>
        </LinearGradient>
        <Text style={[styles.nome, { fontSize: tamanho }]}>
          IF<Text style={styles.nomeDestaque}>aminto</Text>
        </Text>
      </View>

      {mostrarSlogan && (
        <View style={styles.sloganCaixa}>
          <Text style={styles.slogan}>SABOR NO IF</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconeCaixa: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icone: {
    fontSize: 24,
  },
  nome: {
    color: colors.white,
    fontFamily: fonts.logo,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  nomeDestaque: {
    color: colors.primary,
  },
  sloganCaixa: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  slogan: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
