import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, typography } from '../styles/theme';

type Props = {
  pontos: number;
  /** Valor em reais do saldo de crédito já existente no Firestore. */
  creditoDisponivel?: number;
  progresso?: number;
  onPress?: () => void;
};

/** Cartão do programa de fidelidade com barra de progresso. */
export default function LoyaltyCard({ pontos, creditoDisponivel, progresso, onPress }: Props) {
  const meta = Math.max(10, Math.ceil((pontos || 0) / 10) * 10);
  const pct = progresso ?? Math.min(1, (pontos || 0) / meta);
  const cheias = Math.round(pct * 10);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={!onPress}>
      <LinearGradient
        colors={['#2A0B0E', '#140506', '#0A0A0A']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.brilho} pointerEvents="none" />

        <View style={styles.topo}>
          <View>
            <Text style={styles.kicker}>PROGRAMA DE FIDELIDADE</Text>
            <Text style={styles.pontosValor}>{pontos || 0}</Text>
            <Text style={styles.pontosRotulo}>pontos acumulados</Text>
          </View>
          <Text style={styles.coroa}>👑</Text>
        </View>

        <View style={styles.barra}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={[styles.celula, i < cheias && styles.celulaCheia]} />
          ))}
        </View>

        <View style={styles.progressoTexto}>
          <Text style={styles.progressoNum}>{Math.round(pct * 100)}%</Text>
          <Text style={styles.progressoRotulo}>
            {creditoDisponivel !== undefined
              ? `R$ ${(creditoDisponivel || 0).toFixed(2)} de crédito disponível`
              : 'Quanto mais você pede, mais sabor você ganha!'}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  brilho: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.glow,
    opacity: 0.35,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  kicker: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  pontosValor: {
    ...typography.h1,
    fontSize: 40,
    lineHeight: 46,
    marginTop: 4,
  },
  pontosRotulo: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  coroa: {
    fontSize: 30,
  },
  barra: {
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.xl,
  },
  celula: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
  },
  celulaCheia: {
    backgroundColor: colors.secondary,
  },
  progressoTexto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  progressoNum: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '800',
  },
  progressoRotulo: {
    color: colors.textLight,
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
  },
});
