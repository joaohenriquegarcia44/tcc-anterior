import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import FoodImage from './FoodImage';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';
import type { ItemRanking } from '../hooks/useRankingSemanaLogic';

const MEDALHAS = ['🥇', '🥈', '🥉'];

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
            <View key={item.id} style={styles.item}>
              {/* O 1º colocado ganha a medalha pendurada fora do card. */}
              {posicao === 1 && (
                <View style={styles.medalha}>
                  <View style={styles.fita} />
                  <Text style={styles.medalhaEmoji}>🥇</Text>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onPressItem?.(item)}
                style={styles.card}
                accessibilityRole="button"
                accessibilityLabel={`${posicao}º lugar: ${item.nome}`}
              >
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

                {posicao > 1 && (
                  <Text style={styles.colocacao}>{MEDALHAS[indice] || `${posicao}º`}</Text>
                )}
              </TouchableOpacity>
            </View>
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

  linha: { gap: spacing.md, paddingTop: spacing.xl, paddingRight: spacing.xl },
  item: { width: 138 },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 2,
    ...shadows.small,
  },
  medalha: {
    position: 'absolute',
    top: -4,
    right: 8,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC400',
    borderWidth: 3,
    borderColor: colors.card,
    ...shadows.medium,
  },
  // Alça da medalha: é ela que faz parecer que a medalha está pendurada.
  fita: {
    position: 'absolute',
    top: -7,
    width: 8,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#C2703B',
  },
  medalhaEmoji: { fontSize: 20 },
  colocacao: { color: colors.textLight, fontSize: 10, fontWeight: '900', marginTop: 2 },
  fotoCaixa: { width: '100%', height: 76, marginBottom: spacing.sm },
  foto: { width: '100%', height: '100%' },
  nome: { color: colors.text, fontSize: 13, fontWeight: '800' },
  preco: { color: colors.primary, fontSize: 14, fontWeight: '900' },
  vendidos: { color: colors.textLight, fontSize: 11 },
});
