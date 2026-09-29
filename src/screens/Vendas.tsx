import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavigation from '../components/BottomNavigation';
import FoodImage from '../components/FoodImage';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';
import { ABAS_VENDEDOR } from '../navigation/tabs';
import {
  useVendasLogic,
  formatarMoeda,
  formatarPercentual,
  PERIODOS,
} from '../hooks/useVendasLogic';

const FOTO_HERO = require('../../assets/burger-hero.jpg');

/** Verde só para crescimento; vermelho para queda; neutro quando não houve mudança. */
function tomVariacao(variacao: number) {
  if (variacao > 0) return { seta: '↑', fundo: 'rgba(61, 214, 140, 0.12)', texto: colors.success };
  if (variacao < 0) return { seta: '↓', fundo: 'rgba(255, 59, 71, 0.12)', texto: colors.danger };
  return { seta: '→', fundo: colors.surfaceAlt, texto: colors.textLight };
}

export default function Vendas({ navigation }: any) {
  const { width } = useWindowDimensions();
  const [periodoAberto, setPeriodoAberto] = useState(false);

  const {
    carregando,
    atualizando,
    permitido,
    erro,
    dias,
    periodo,
    trocarPeriodo,
    atualizar,
    resumo,
    topProdutos,
  } = useVendasLogic(navigation);

  const entrada = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permitido && !carregando) {
      Animated.timing(entrada, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [permitido, carregando, entrada]);

  if (!permitido) {
    if (carregando) return <LoadingState mensagem="Validando acesso..." sub="Somente administradores" />;
    return null;
  }

  if (carregando) return <LoadingState mensagem="Carregando suas vendas..." sub="Últimos 30 dias" />;

  if (erro) {
    return (
      <SafeAreaView style={styles.tela} edges={['top']}>
        <View style={styles.erroWrapper}>
          <EmptyState
            icon="📡"
            titulo="Não foi possível carregar"
            descricao={erro}
          >
            <TouchableOpacity style={styles.tentarNovamente} onPress={atualizar} activeOpacity={0.85}>
              <Text style={styles.tentarNovamenteTexto}>Tentar novamente</Text>
            </TouchableOpacity>
          </EmptyState>
        </View>
        <BottomNavigation
          abas={ABAS_VENDEDOR}
          ativa="Vendas"
          onSelect={(key) => key !== 'Vendas' && navigation.navigate(key)}
        />
      </SafeAreaView>
    );
  }

  // O número grande encolhe em telas estreitas; o ajuste fino é o FontSizeToFit.
  const larguraUtil = Math.max(140, (width - spacing.xl * 2) * 0.7 - spacing.xl * 2);
  const fonteValor = Math.min(44, Math.max(26, larguraUtil / 6.2));
  const tomPrincipal = tomVariacao(resumo.variacao);

  const estiloEntrada = {
    opacity: entrada,
    transform: [
      { translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
    ],
  };

  return (
    <View style={styles.tela}>
      {/* Fecha o menu de período ao tocar fora dele */}
      {periodoAberto && (
        <Pressable style={styles.fundoPeriodo} onPress={() => setPeriodoAberto(false)} />
      )}

      <SafeAreaView style={styles.tela} edges={[]}>
        <Text style={styles.headerSub}>Acompanhe o desempenho da sua lancheria</Text>

        <View style={styles.gutterTopo}>
          <View style={styles.periodoWrap}>
            <TouchableOpacity
              onPress={() => setPeriodoAberto((a) => !a)}
              style={styles.periodoBotao}
              activeOpacity={0.85}
              accessibilityLabel="Selecionar período"
            >
              <Text style={styles.periodoIcone}>🗓</Text>
              <Text style={styles.periodoTexto} numberOfLines={1}>
                {periodo.rotulo}
              </Text>
              <Text style={styles.periodoSeta}>⌄</Text>
            </TouchableOpacity>

            {periodoAberto && (
              <View style={styles.periodoMenu}>
                {PERIODOS.map((p) => {
                  const ativo = p.dias === dias;
                  return (
                    <TouchableOpacity
                      key={p.dias}
                      onPress={() => {
                        trocarPeriodo(p.dias);
                        setPeriodoAberto(false);
                      }}
                      style={[styles.periodoItem, ativo && styles.periodoItemAtivo]}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.periodoItemTexto, ativo && styles.periodoItemTextoAtivo]}>
                        {p.rotulo}
                      </Text>
                      {ativo && <Text style={styles.periodoCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={atualizar}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* CARD PRINCIPAL — média diária */}
          <Animated.View style={[styles.hero, estiloEntrada]}>
            <Image source={FOTO_HERO} style={styles.heroFoto} resizeMode="cover" />
            <LinearGradient
              colors={['#0A0507', '#0A0507', 'rgba(10,5,7,0.62)', 'rgba(10,5,7,0.30)']}
              locations={[0, 0.44, 0.74, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            <View style={styles.heroConteudo}>
              <View style={styles.heroTopo}>
                <View style={styles.heroIcone}>
                  <Text style={styles.heroIconeTexto}>📊</Text>
                </View>
                <View style={styles.heroTopoTextos}>
                  <Text style={styles.heroTitulo} numberOfLines={1}>
                    Média de vendas
                  </Text>
                  <Text style={styles.heroSubtitulo} numberOfLines={1}>
                    ({periodo.rotulo.toLowerCase()})
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.heroValor, { fontSize: fonteValor }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.55}
              >
                {formatarMoeda(resumo.media)}
              </Text>

              <View style={styles.heroRodape}>
                <Text style={[styles.heroVariacao, { color: tomPrincipal.texto }]}>
                  {tomPrincipal.seta} {formatarPercentual(resumo.variacao)}
                </Text>
                <Text style={styles.heroComparacao} numberOfLines={2}>
                  em relação aos {dias} dias anteriores
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* RESUMO DO PERÍODO — o gráfico mora na tela Gráficos */}
          <Animated.View style={[styles.card, estiloEntrada]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcone}>
                <Text style={styles.cardIconeTexto}>🧾</Text>
              </View>
              <Text style={styles.cardTitulo}>Resumo do período</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('GraficoVendas')}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={styles.verTodos}>Ver gráfico ›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.miniRow}>
              <View style={styles.miniCard}>
                <Text style={styles.miniLabel} numberOfLines={1}>
                  Total no período
                </Text>
                <Text
                  style={styles.miniValor}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {formatarMoeda(resumo.total)}
                </Text>
              </View>
              <View style={styles.miniCard}>
                <Text style={styles.miniLabel}>Pedidos</Text>
                <Text style={styles.miniValor}>{resumo.pedidos}</Text>
              </View>
            </View>
          </Animated.View>

          {/* PRODUTOS MAIS VENDIDOS */}
          <Animated.View style={[styles.card, estiloEntrada]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcone}>
                <Text style={styles.cardIconeTexto}>🏆</Text>
              </View>
              <Text style={styles.cardTitulo}>Produtos mais vendidos</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Cardapio')}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={styles.verTodos}>Ver todos ›</Text>
              </TouchableOpacity>
            </View>

            {topProdutos.length === 0 ? (
              <View style={styles.semProdutos}>
                <Text style={styles.vazioTexto}>
                  Assim que houver pedidos, os campeões aparecem aqui.
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.produtosLista}
              >
                {topProdutos.map((produto) => {
                  const tom = tomVariacao(produto.variacao);
                  return (
                    <TouchableOpacity
                      key={produto.id}
                      activeOpacity={0.85}
                      style={styles.produtoCard}
                      onPress={() => navigation.navigate('Cardapio')}
                      accessibilityRole="button"
                      accessibilityLabel={produto.nome}
                    >
                      <FoodImage
                        uri={produto.imagem}
                        style={styles.produtoFoto}
                        radius={borderRadius.lg}
                        fallbackIcon="🍔"
                      />
                      <Text style={styles.produtoNome} numberOfLines={2}>
                        {produto.nome}
                      </Text>
                      <Text style={styles.produtoQtd}>{produto.quantidade} vendidos</Text>
                      <View style={[styles.produtoChip, { backgroundColor: tom.fundo }]}>
                        <Text style={[styles.produtoChipTexto, { color: tom.texto }]}>
                          {tom.seta} {formatarPercentual(produto.variacao)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </Animated.View>

          <Text style={styles.rodape}>if-aminto · dados atualizados do seu histórico de pedidos</Text>
        </ScrollView>
      </SafeAreaView>

      <BottomNavigation
        abas={ABAS_VENDEDOR}
        ativa="Vendas"
        onSelect={(key) => {
          if (key === 'Vendas') return;
          navigation.navigate(key);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },

  fundoPeriodo: { ...StyleSheet.absoluteFillObject, zIndex: 10 },

  gutterTopo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    zIndex: 21,
  },
  periodoWrap: { zIndex: 21 },
  periodoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodoIcone: { fontSize: 12 },
  periodoTexto: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  periodoSeta: { color: colors.textLight, fontSize: 13, fontWeight: '800', marginTop: -3 },

  periodoMenu: {
    position: 'absolute',
    top: '110%',
    right: 0,
    minWidth: 178,
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.medium,
  },
  periodoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 11,
    paddingHorizontal: spacing.lg,
  },
  periodoItemAtivo: { backgroundColor: colors.glowSoft },
  periodoItemTexto: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  periodoItemTextoAtivo: { color: colors.primaryText, fontWeight: '800' },
  periodoCheck: { color: colors.primary, fontSize: 13, fontWeight: '900' },

  headerSub: {
    color: colors.textLight,
    fontSize: 13,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },

  hero: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: '#0A0507',
    borderWidth: 1,
    borderColor: 'rgba(255, 30, 45, 0.30)',
    minHeight: 168,
    justifyContent: 'center',
    ...shadows.medium,
  },
  heroFoto: {
    position: 'absolute',
    top: '12%',
    bottom: '12%',
    right: '4%',
    width: '30%',
    borderRadius: borderRadius.lg,
  },
  heroConteudo: { padding: spacing.xl, width: '70%', gap: spacing.sm },
  heroTopo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroIcone: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconeTexto: { fontSize: 18 },
  heroTopoTextos: { flex: 1 },
  heroTitulo: { color: colors.text, fontSize: 15, fontWeight: '800' },
  heroSubtitulo: { color: colors.textLight, fontSize: 11, marginTop: 1 },
  heroValor: {
    color: colors.text,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: spacing.xs,
  },
  heroRodape: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  heroVariacao: { fontSize: 14, fontWeight: '900' },
  heroComparacao: { color: colors.textLight, fontSize: 11, flexShrink: 1 },

  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardIcone: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.glowSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconeTexto: { fontSize: 16 },
  cardTitulo: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '800' },
  verTodos: { color: colors.primaryText, fontSize: 12, fontWeight: '800' },

  miniRow: { flexDirection: 'row', gap: spacing.md },
  miniCard: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 3,
  },
  miniLabel: { color: colors.textLight, fontSize: 11, fontWeight: '700' },
  miniValor: { color: colors.text, fontSize: 17, fontWeight: '900' },

  produtosLista: { gap: spacing.md, paddingRight: spacing.lg, paddingVertical: spacing.xs },
  produtoCard: {
    width: 150,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: 2,
  },
  produtoFoto: { width: '100%', height: 96, marginBottom: spacing.sm },
  produtoNome: { color: colors.text, fontSize: 12, fontWeight: '700', minHeight: 30 },
  produtoQtd: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  produtoChip: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
  },
  produtoChipTexto: { fontSize: 10, fontWeight: '800' },

  semProdutos: { paddingVertical: spacing.lg, alignItems: 'center' },
  vazioTexto: { color: colors.textLight, fontSize: 12, textAlign: 'center' },

  rodape: {
    color: colors.textLight,
    fontSize: 10,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  erroWrapper: { flex: 1, justifyContent: 'center' },
  tentarNovamente: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
  },
  tentarNovamenteTexto: { color: colors.white, fontWeight: '800', fontSize: 14 },
});
