import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../styles/theme';

type Props = {
  icon?: string;
  titulo: string;
  descricao?: string;
  children?: React.ReactNode;
};

/** Estado vazio amigável (regra 19). */
export default function EmptyState({ icon = '🍔', titulo, descricao, children }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconeCaixa}>
        <Text style={styles.icone}>{icon}</Text>
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      {!!descricao && <Text style={styles.descricao}>{descricao}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  iconeCaixa: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icone: {
    fontSize: 34,
  },
  titulo: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  descricao: {
    color: colors.textLight,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
