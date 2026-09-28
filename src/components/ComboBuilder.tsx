import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FoodImage from './FoodImage';
import PrimaryButton from './PrimaryButton';
import { colors, borderRadius, spacing, hitSize, shadows } from '../styles/theme';
import { useComboLogic, PASSOS_COMBO } from '../hooks/useComboLogic';

type Props = {
  visivel: boolean;
  onFechar: () => void;
  lanches: any[];
};

/** Modal "Monte seu combo": 3 toques (lanche → bebida → doce). */
export default function ComboBuilder({ visivel, onFechar, lanches }: Props) {
  const insets = useSafeAreaInsets();
  const {
    passo,
    passoAtual,
    opcoes,
    escolha,
    itensEscolhidos,
    subtotal,
    desconto,
    total,
    salvando,
    temProximo,
    selecionar,
    voltarPasso,
    irParaPasso,
    pularPasso,
    adicionar,
  } = useComboLogic(lanches, onFechar);

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar}>
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onFechar}
              hitSlop={10}
              style={styles.fechar}
              accessibilityLabel="Fechar"
            >
              <Text style={styles.fecharTexto}>✕</Text>
            </TouchableOpacity>

            <View style={styles.headerTextos}>
              <Text style={styles.titulo}>Monte seu combo</Text>
              <Text style={styles.subtitulo}>
                {PASSOS_COMBO.length - passo} {PASSOS_COMBO.length - passo === 1 ? 'falta' : 'faltam'}
              </Text>
            </View>

            <View style={styles.selo}>
              <Text style={styles.seloTexto}>-{Math.round(desconto > 0 ? (desconto / (subtotal || 1)) * 100 : 0)}%</Text>
            </View>
          </View>

          {/* PASSOS */}
          <View style={styles.passos}>
            {PASSOS_COMBO.map((p, indice) => {
              const feito = !!escolha[p.id];
              const atual = indice === passo;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.8}
                  onPress={() => irParaPasso(indice)}
                  disabled={!feito && indice !== passo}
                  style={[
                    styles.passo,
                    atual && styles.passoAtivo,
                    feito && styles.passoFeito,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={styles.passoEmoji}>{p.emoji}</Text>
                  <Text style={[styles.passoRotulo, feito && styles.passoRotuloFeito]}>
                    {feito ? (escolha[p.id]?.nome?.split(' ')[0] ?? p.rotulo) : p.rotulo}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.pergunta}>
            Passo {passo + 1} de {PASSOS_COMBO.length}: escolha o {passoAtual.rotulo.toLowerCase()}
          </Text>

          {/* LISTA DE OPÇÕES */}
          {opcoes.length === 0 ? (
            <View style={styles.vazio}>
              <Text style={styles.vazioEmoji}>🚫</Text>
              <Text style={styles.vazioTexto}>
                Nenhum {passoAtual.rotulo.toLowerCase()} disponível
                {escolha.lanche ? ' deste vendedor' : ''}.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.lista}
            >
              {opcoes.map((item) => {
                const escolhido = escolha[passoAtual.id]?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => selecionar(item)}
                    style={[styles.opcao, escolhido && styles.opcaoEscolhida]}
                    accessibilityRole="button"
                    accessibilityLabel={item.nome}
                  >
                    <FoodImage
                      uri={item.imagem}
                      style={styles.opcaoFoto}
                      radius={borderRadius.md}
                      fallbackIcon={passoAtual.emoji}
                    />
                    <Text style={styles.opcaoNome} numberOfLines={2}>{item.nome}</Text>
                    <Text style={styles.opcaoPreco}>R$ {Number(item.preco).toFixed(2)}</Text>
                    {escolhido && (
                      <View style={styles.check}>
                        <Text style={styles.checkTexto}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* RODAPÉ */}
          <View style={styles.rodape}>
            <View style={styles.resumo}>
              <Text style={styles.resumoRotulo}>
                {itensEscolhidos.length} {itensEscolhidos.length === 1 ? 'item' : 'itens'}
              </Text>
              {desconto > 0 ? (
                <View style={styles.resumoLinha}>
                  <Text style={styles.resumoDesconto}>- R$ {desconto.toFixed(2)} de desconto</Text>
                  <Text style={styles.resumoTotal}>R$ {total.toFixed(2)}</Text>
                </View>
              ) : (
                <Text style={styles.resumoDica}>Escolha 2 ou 3 itens para ganhar o desconto</Text>
              )}
            </View>

            <View style={styles.acoes}>
              {passo > 0 && (
                <TouchableOpacity
                  onPress={voltarPasso}
                  style={styles.secundario}
                  accessibilityRole="button"
                >
                  <Text style={styles.secundarioTexto}>Voltar</Text>
                </TouchableOpacity>
              )}

              {temProximo && (
                <TouchableOpacity
                  onPress={pularPasso}
                  style={styles.pular}
                  accessibilityRole="button"
                >
                  <Text style={styles.pularTexto}>Pular</Text>
                </TouchableOpacity>
              )}

              <PrimaryButton
                title={salvando ? 'Salvando...' : 'Adicionar combo'}
                onPress={adicionar}
                loading={salvando}
                disabled={!escolha.lanche || itensEscolhidos.length < 2}
                style={styles.adicionar}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
    ...shadows.large,
  },

  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  fechar: {
    width: hitSize.min,
    height: hitSize.min,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fecharTexto: { color: colors.text, fontSize: 16, fontWeight: '800' },
  headerTextos: { flex: 1 },
  titulo: { color: colors.text, fontSize: 19, fontWeight: '800' },
  subtitulo: { color: colors.textLight, fontSize: 12, marginTop: 1 },
  selo: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    backgroundColor: colors.secondary,
  },
  seloTexto: { color: colors.background, fontSize: 12, fontWeight: '900' },

  passos: { flexDirection: 'row', gap: spacing.sm },
  passo: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passoAtivo: { borderColor: colors.primary, backgroundColor: colors.glowSoft },
  passoFeito: { borderColor: colors.success },
  passoEmoji: { fontSize: 18 },
  passoRotulo: { color: colors.textLight, fontSize: 11, fontWeight: '700' },
  passoRotuloFeito: { color: colors.text },

  pergunta: { color: colors.text, fontSize: 14, fontWeight: '700' },

  lista: { gap: spacing.md, paddingVertical: spacing.xs, paddingRight: spacing.xl },
  opcao: {
    width: 132,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  opcaoEscolhida: { borderColor: colors.primary, backgroundColor: colors.glowSoft },
  opcaoFoto: { width: '100%', height: 84, marginBottom: spacing.sm },
  opcaoNome: { color: colors.text, fontSize: 12, fontWeight: '700', minHeight: 30 },
  opcaoPreco: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  check: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkTexto: { color: colors.white, fontSize: 12, fontWeight: '900' },

  vazio: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  vazioEmoji: { fontSize: 30 },
  vazioTexto: { color: colors.textLight, fontSize: 13, textAlign: 'center' },

  rodape: { gap: spacing.md },
  resumo: { gap: 2 },
  resumoRotulo: { color: colors.textLight, fontSize: 12 },
  resumoLinha: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  resumoDesconto: { color: colors.success, fontSize: 13, fontWeight: '800' },
  resumoTotal: { color: colors.text, fontSize: 20, fontWeight: '900' },
  resumoDica: { color: colors.textLight, fontSize: 12, fontStyle: 'italic' },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  secundario: {
    minHeight: hitSize.min,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secundarioTexto: { color: colors.text, fontWeight: '700', fontSize: 14 },
  pular: {
    minHeight: hitSize.min,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  pularTexto: { color: colors.textLight, fontWeight: '700', fontSize: 14 },
  adicionar: { flex: 1 },
});
