import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing } from '../styles/theme';

export type Categoria = {
  id: string;
  nome: string;
  icon: string;
  cor: string;
};

type Props = {
  categorias: Categoria[];
  selecionada: string;
  onSelect: (id: string) => void;
  contentContainerStyle?: any;
};

/** Trilho horizontal de categorias com ícone e nome. */
export default function CategoryButton({ categorias, selecionada, onSelect, contentContainerStyle }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.trilho, contentContainerStyle]}
    >
      {categorias.map((cat) => {
        const ativa = cat.id === selecionada;
        return (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.8}
            onPress={() => onSelect(cat.id)}
            style={[
              styles.item,
              ativa && { backgroundColor: cat.cor, borderColor: cat.cor },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: ativa }}
          >
            <Text style={styles.icone}>{cat.icon}</Text>
            <Text style={[styles.rotulo, ativa && styles.rotuloAtivo]} numberOfLines={1}>
              {cat.nome.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  trilho: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icone: {
    fontSize: 15,
  },
  rotulo: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  rotuloAtivo: {
    color: colors.white,
  },
});
