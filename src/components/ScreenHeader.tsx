import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, hitSize, borderRadius } from '../styles/theme';

type Props = {
  titulo: string;
  subtitulo?: string;
  onBack?: () => void;
  direita?: React.ReactNode;
  corTitulo?: string;
};

/** Cabeçalho das telas internas: voltar, título e ações à direita. */
export default function ScreenHeader({ titulo, subtitulo, onBack, direita, corTitulo }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {!!onBack && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBack}
          hitSlop={10}
          style={styles.botaoVoltar}
          accessibilityLabel="Voltar"
        >
          <Text style={styles.seta}>←</Text>
        </TouchableOpacity>
      )}

      <View style={styles.titulos}>
        <Text style={[styles.titulo, !!corTitulo && { color: corTitulo }]} numberOfLines={1}>
          {titulo}
        </Text>
        {!!subtitulo && (
          <Text style={styles.subtitulo} numberOfLines={1}>
            {subtitulo}
          </Text>
        )}
      </View>

      <View style={styles.direita}>{direita}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  botaoVoltar: {
    width: hitSize.min,
    height: hitSize.min,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  seta: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginTop: -2,
  },
  titulos: {
    flex: 1,
  },
  titulo: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitulo: {
    color: colors.textLight,
    fontSize: 12,
    marginTop: 1,
  },
  direita: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
