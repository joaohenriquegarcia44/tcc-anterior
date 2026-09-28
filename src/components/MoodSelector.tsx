import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, hitSize } from '../styles/theme';

export type Humor = {
  id: string;
  emoji: string;
  titulo: string;
  descricao: string;
};

/** Categorias do Firestore — os ids não podem mudar. */
export const HUMORES: Humor[] = [
  { id: 'lanche', emoji: '🍔', titulo: 'Tô com fome', descricao: 'Salgados' },
  { id: 'bebida', emoji: '🥤', titulo: 'Tô com sede', descricao: 'Bebidas' },
  { id: 'doce', emoji: '🍰', titulo: 'Quero doce', descricao: 'Doces' },
];

type Props = {
  onSelect: (categoriaId: string) => void;
  selecionada?: string;
};

/** Atalho de um toque: escolhe o humor e já filtra o cardápio. */
export default function MoodSelector({ onSelect, selecionada }: Props) {
  return (
    <View>
      <Text style={styles.titulo}>Como tá seu dia?</Text>

      <View style={styles.linha}>
        {HUMORES.map((h) => {
          const ativa = selecionada === h.id;
          return (
            <TouchableOpacity
              key={h.id}
              activeOpacity={0.85}
              onPress={() => onSelect(h.id)}
              style={[styles.botao, ativa && styles.botaoAtivo]}
              accessibilityRole="button"
              accessibilityLabel={h.titulo}
            >
              <Text style={styles.emoji}>{h.emoji}</Text>
              <Text style={[styles.tituloBotao, ativa && styles.tituloBotaoAtivo]} numberOfLines={1}>
                {h.titulo}
              </Text>
              <Text style={[styles.descricao, ativa && styles.descricaoAtiva]} numberOfLines={1}>
                {h.descricao}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  linha: { flexDirection: 'row', gap: spacing.sm },
  botao: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    minHeight: hitSize.comfortable + 18,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  botaoAtivo: {
    backgroundColor: colors.glowSoft,
    borderColor: colors.primary,
  },
  emoji: { fontSize: 26, marginBottom: 2 },
  tituloBotao: { color: colors.text, fontSize: 12, fontWeight: '700' },
  tituloBotaoAtivo: { color: colors.primaryText },
  descricao: { color: colors.textLight, fontSize: 10 },
  descricaoAtiva: { color: colors.primaryText },
});
