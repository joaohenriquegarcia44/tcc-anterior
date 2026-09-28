import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import FoodImage from './FoodImage';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';
import type { ItemRanking } from '../hooks/useRankingSemanaLogic';

const MEDALHAS = ['🥇', '🥈', '🥉'];

const CORES_POSICAO = ['#FFC400', '#C9CED6', '#C2703B'];

type Props = {
  itens: ItemRanking[];
  parcial?: boolean;
  onPressItem?: (item: ItemRanking) => void;
  onVerTodos?: () => void;
};

/** Top 5 da semana: os lanches mais pedidos nos últimos 7 dias. */
export default function Top5Semana({ itens, parcial, onPressItem, onVerTodos }: Props) {
  if (!itens.length) return null;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.titulos}>
          <Text style={styles.titulo}>🏆 Top 5 da semana</Text>
          <Text style={styles.subtitulo} numberOfLines={1}>
            {parcial ? 'Seus lanches mais pedidos' : 'O que os alunos mais pediram'}
          </Text>
        </View>

        {!!onVerTodos && (
          <TouchableOpacity onPress={onVerTodos} hitSlop={10} accessibilityRole="button">
            <Text style={styles.verTodos}>Ver cardápio</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.linha}
      >
        {itens.map((item, indice) => {
          const posicao = indice + 1;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => onPressItem?.(item)}
              style={styles.card}
              accessibilityRole="button"
              accessibilityLabel={`${posicao}º lugar: ${item.nome}`}
            >
              <View style={[styles.badge, { borderColor: CORES_POSICAO[indice] || colors.border }]}>
                <Text style={styles.badgeTexto}>{MEDALHAS[indice] || `${posicao}º`}</Text>
              </View>

              <View style={styles.fotoCaixa}>
                <FoodImage
                  uri={item.imagem}
                  style={styles.foto}
                  radius={borderRadius.md}
                  fallbackIcon="🍔"
                />
              </View>

              <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
              <Text style={styles.vendidos}>
                {item.quantidade} {item.quantidade === 1 ? 'pedido' : 'pedidos'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  titulos: { flex: 1 },
  titulo: { color: colors.text, fontSize: 17, fontWeight: '800' },
  subtitulo: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  verTodos: { color: colors.primary, fontSize: 12, fontWeight: '800' },

  linha: { gap: spacing.md, paddingRight: spacing.xl },
  card: {
    width: 138,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    paddingTop: spacing.lg,
    gap: 2,
    ...shadows.small,
  },
  badge: {
    position: 'absolute',
    top: -10,
    left: spacing.md,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: borderRadius.round,
    borderWidth: 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTexto: { fontSize: 13, fontWeight: '900', color: colors.text },
  fotoCaixa: { width: '100%', height: 76, marginBottom: spacing.sm },
  foto: { width: '100%', height: '100%' },
  nome: { color: colors.text, fontSize: 13, fontWeight: '800' },
  preco: { color: colors.primary, fontSize: 14, fontWeight: '900' },
  vendidos: { color: colors.textLight, fontSize: 11 },
});
