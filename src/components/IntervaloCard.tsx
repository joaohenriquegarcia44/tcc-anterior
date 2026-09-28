import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../styles/theme';
import { useIntervaloLogic } from '../hooks/useIntervaloLogic';

/** Card "Próximo intervalo no IF" com contagem regressiva. */
export default function IntervaloCard({ style }: { style?: any }) {
  const { emIntervalo, minutosRestantes, rotulo, hora, horaFim } = useIntervaloLogic();

  const tempo =
    minutosRestantes >= 60
      ? `${Math.floor(minutosRestantes / 60)}h${minutosRestantes % 60 ? ` ${minutosRestantes % 60}min` : ''}`
      : `${minutosRestantes} min`;

  return (
    <View style={[styles.container, emIntervalo && styles.containerAtivo, style]}>
      <View style={styles.topo}>
        <Text style={styles.icone}>{emIntervalo ? '🔔' : '⏰'}</Text>
        <Text style={styles.rotulo}>{rotulo.toUpperCase()}</Text>
      </View>

      <Text style={[styles.tempo, emIntervalo && styles.tempoAtivo]}>
        {emIntervalo ? 'AGORA!' : tempo}
      </Text>

      <Text style={styles.legenda} numberOfLines={1}>
        {emIntervalo ? `Aberto até ${horaFim}` : `Começa às ${hora}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 2,
  },
  containerAtivo: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(255,196,0,0.08)',
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icone: { fontSize: 14 },
  rotulo: {
    color: colors.textLight,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    flex: 1,
  },
  tempo: {
    ...typography.h2,
    fontSize: 20,
    marginTop: 2,
  },
  tempoAtivo: { color: colors.secondary },
  legenda: { color: colors.textLight, fontSize: 10 },
});
