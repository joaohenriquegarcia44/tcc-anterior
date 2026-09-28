import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../styles/theme';

type Props = {
  /** Quantidade de lanches realmente disponíveis no Firestore. */
  disponiveis: number;
  /** Menor tempo de preparo informado nos lanches disponíveis (minutos). */
  preparoMin?: number | null;
  style?: any;
};

/**
 * Card "Aberto agora": status derivado dos dados reais do cardápio,
 * sem nenhum valor fictício.
 */
export default function StatusCard({ disponiveis, preparoMin, style }: Props) {
  const aberto = disponiveis > 0;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.topo}>
        <View style={[styles.ponto, aberto ? styles.pontoAberto : styles.pontoFechado]} />
        <Text style={[styles.status, aberto ? styles.textoAberto : styles.textoFechado]}>
          {aberto ? 'ABERTO AGORA' : 'FECHADO'}
        </Text>
      </View>

      <Text style={styles.total} numberOfLines={1}>
        {disponiveis} {disponiveis === 1 ? 'lanche' : 'lanches'}
      </Text>

      <Text style={styles.legenda} numberOfLines={1}>
        {aberto && preparoMin ? `≈ ${preparoMin} min de preparo` : aberto ? 'Retirada no IF' : 'Sem itens no momento'}
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
  topo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ponto: { width: 8, height: 8, borderRadius: 4 },
  pontoAberto: { backgroundColor: colors.success },
  pontoFechado: { backgroundColor: colors.danger },
  status: { fontSize: 9, fontWeight: '800', letterSpacing: 1, flex: 1 },
  textoAberto: { color: colors.success },
  textoFechado: { color: colors.danger },
  total: { ...typography.h2, fontSize: 20, marginTop: 2 },
  legenda: { color: colors.textLight, fontSize: 10 },
});
