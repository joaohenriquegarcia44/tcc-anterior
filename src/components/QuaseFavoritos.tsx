import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ProductCard from './ProductCard';
import { colors, spacing } from '../styles/theme';

type Props = {
  itens: any[];
  motivo?: string;
  largura?: number;
  onPressItem?: (item: any) => void;
  /** Botão do card: coloca a sugestão direto nos favoritos. */
  onFavoritar?: (item: any) => void;
};

/** "Quase nos seus favoritos": sugestões parecidas com o histórico do aluno. */
export default function QuaseFavoritos({ itens, motivo, largura = 150, onPressItem, onFavoritar }: Props) {
  if (!itens.length) return null;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.titulo}>💜 Quase nos seus favoritos</Text>
        <Text style={styles.subtitulo} numberOfLines={1}>
          {motivo
            ? `Parecidos com os ${motivo} que você pede — toque no ♥ para guardar`
            : 'Sugestões do seu gosto — toque no ♥ para guardar'}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.linha}>
        {itens.map((item) => (
          <ProductCard
            key={item.id}
            produto={item}
            largura={largura}
            onPress={() => onPressItem?.(item)}
            onAdd={onFavoritar ? () => onFavoritar(item) : undefined}
            botao={{ icone: '❤️', titulo: `Favoritar ${item.nome}` }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  titulo: { color: colors.text, fontSize: 17, fontWeight: '800' },
  subtitulo: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  linha: { gap: spacing.md, paddingRight: spacing.xl },
});
