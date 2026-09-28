import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/theme';

type Props = {
  mensagem?: string;
  sub?: string;
  cor?: string;
};

/** Estado de carregamento com a identidade do app (regra 19). */
export default function LoadingState({ mensagem = 'Carregando delícias...', sub, cor = colors.primary }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={cor} />
      <Text style={styles.mensagem}>{mensagem}</Text>
      {!!sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.md,
  },
  mensagem: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  sub: {
    color: colors.textLight,
    fontSize: 12,
  },
});
