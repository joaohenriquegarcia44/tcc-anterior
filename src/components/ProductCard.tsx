import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FoodImage from './FoodImage';
import CircleActionButton from './CircleActionButton';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';

type Produto = {
  id: string;
  nome: string;
  preco: number;
  imagem?: string;
  descricao?: string;
  promocao?: boolean;
  precoPromocional?: number;
  mediaAvaliacao?: number;
  tempoPreparo?: string;
  categorias?: string[];
};

type Props = {
  produto: Produto;
  onPress?: () => void;
  onAdd?: () => void;
  /** Ícone/texto do botão flutuante. Padrão: "Adicionar ao carrinho". */
  botao?: { icone: string; titulo: string };
  /** "grid" = card grande com foto; "row" = lista com foto à esquerda. */
  variant?: 'grid' | 'row';
  largura?: number;
  emoji?: string;
};

/** Card de produto. Mantém o contrato antigo (produto + onPress) e ganha variações. */
export default function ProductCard({
  produto,
  onPress,
  onAdd,
  botao,
  variant = 'grid',
  largura,
  emoji = '🍔',
}: Props) {
  const acao = { icone: '+', titulo: `Adicionar ${produto.nome}`, ...botao };

  const precoFinal = produto.promocao
    ? produto.precoPromocional || produto.preco
    : produto.preco;

  if (variant === 'row') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.row}
        accessibilityRole="button"
      >
        <View style={styles.rowImagemCaixa}>
          <FoodImage uri={produto.imagem} style={styles.rowImagem} radius={borderRadius.md} fallbackIcon={emoji} />
          {!!produto.promocao && (
            <View style={styles.tagPromo}>
              <Text style={styles.tagPromoTexto}>OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.rowInfo}>
          <Text style={styles.rowNome} numberOfLines={1}>{produto.nome}</Text>
          {!!produto.descricao && (
            <Text style={styles.rowDescricao} numberOfLines={2}>{produto.descricao}</Text>
          )}
          <View style={styles.rowRodape}>
            <View style={styles.rowPrecoCaixa}>
              {!!produto.promocao && produto.precoPromocional ? (
                <Text style={styles.precoAntigo}>R$ {Number(produto.preco).toFixed(2)}</Text>
              ) : null}
              <Text style={styles.preco}>R$ {Number(precoFinal).toFixed(2)}</Text>
            </View>

            {!!onAdd && (
              <CircleActionButton icon={acao.icone} titulo={acao.titulo} onPress={onAdd} tamanho={38} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.grid, !!largura && { width: largura }]}
      accessibilityRole="button"
    >
      <View style={styles.gridFotoCaixa}>
        <FoodImage
          uri={produto.imagem}
          style={styles.gridFoto}
          radius={borderRadius.lg}
          fallbackIcon={emoji}
        />

        {!!produto.promocao && (
          <View style={styles.tagPromo}>
            <Text style={styles.tagPromoTexto}>🔥 OFF</Text>
          </View>
        )}

        {typeof produto.mediaAvaliacao === 'number' && produto.mediaAvaliacao > 0 && (
          <View style={styles.tagNota}>
            <Text style={styles.tagNotaTexto}>⭐ {produto.mediaAvaliacao.toFixed(1)}</Text>
          </View>
        )}

        {!!onAdd && (
          <View style={styles.gridAdd}>
            <CircleActionButton icon={acao.icone} titulo={acao.titulo} onPress={onAdd} tamanho={42} />
          </View>
        )}
      </View>

      <View style={styles.gridInfo}>
        <Text style={styles.gridNome} numberOfLines={1}>{produto.nome}</Text>
        {!!produto.descricao && (
          <Text style={styles.gridDescricao} numberOfLines={2}>{produto.descricao}</Text>
        )}
        <View style={styles.gridPrecoRow}>
          {!!produto.promocao && produto.precoPromocional ? (
            <Text style={styles.precoAntigo}>R$ {Number(produto.preco).toFixed(2)}</Text>
          ) : null}
          <Text style={styles.preco}>R$ {Number(precoFinal).toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // grid
  grid: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.small,
  },
  gridFotoCaixa: {
    width: '100%',
    height: 150,
  },
  gridFoto: {
    width: '100%',
    height: '100%',
  },
  gridInfo: {
    padding: spacing.md,
    gap: 3,
  },
  gridNome: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  gridDescricao: {
    color: colors.textLight,
    fontSize: 12,
    lineHeight: 17,
  },
  gridPrecoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  gridAdd: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },

  // row
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rowImagemCaixa: {
    width: 96,
    height: 96,
  },
  rowImagem: {
    width: '100%',
    height: '100%',
  },
  rowInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rowNome: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  rowDescricao: {
    color: colors.textLight,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  rowRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  rowPrecoCaixa: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },

  // compartilhado
  preco: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  precoAntigo: {
    color: colors.textLight,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  tagPromo: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.round,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tagPromoTexto: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '900',
  },
  tagNota: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: borderRadius.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagNotaTexto: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '800',
  },
});
