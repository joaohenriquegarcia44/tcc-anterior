import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GraficoVendasArea from '../components/GraficoVendasArea';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { colors, borderRadius, spacing, hitSize, shadows } from '../styles/theme';
import { useVendasLogic, formatarMoeda, PERIODOS } from '../hooks/useVendasLogic';

/**
 * Página de gráficos: a curva de vendas por dia do período, com toque nos
 * pontos para o valor do dia. A tela de Vendas fica só com os números e os
 * produtos, e entra aqui pelo link "Ver gráfico ›".
 */
export default function GraficoVendas({ navigation }: any) {
  const {
    carregando,
    atualizando,
    permitido,
    erro,
    dias,
    trocarPeriodo,
    atualizar,
    resumo,
    serie,
  } = useVendasLogic(navigation);

  if (!permitido) {
    if (carregando) return <LoadingState mensagem="Validando acesso..." sub="Somente administradores" />;
    return null;
  }

  if (carregando) return <LoadingState mensagem="Carregando o gráfico..." sub="Vendas por dia" />;

  if (erro) {
    return (
      <SafeAreaView style={styles.tela} edges={['top']}>
        <View style={styles.erroWrapper}>
          <EmptyState icon="📡" titulo="Não foi possível carregar" descricao={erro}>
            <TouchableOpacity style={styles.tentarNovamente} onPress={atualizar} activeOpacity={0.85}>
              <Text style={styles.tentarNovamenteTexto}>Tentar novamente</Text>
            </TouchableOpacity>
          </EmptyState>
        </View>
      </SafeAreaView>
    );
  }

  const temDados = serie.some((p) => p.valor > 0);

  return (
    <SafeAreaView style={styles.tela} edges={[]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={atualizar}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Período em pílulas: mais simples e direto que o menu da tela de Vendas */}
        <View style={styles.pPeriodo}>
          {PERIODOS.map((p) => {
            const ativo = p.dias === dias;
            return (
              <TouchableOpacity
                key={p.dias}
                onPress={() => trocarPeriodo(p.dias)}
                activeOpacity={0.85}
                style={[styles.pilula, ativo && styles.pilulaAtiva]}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
              >
                <Text style={[styles.pilulaTexto, ativo && styles.pilulaTextoAtivo]}>
                  {p.dias} dias
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Números do período */}
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
            <Text style={styles.miniLabel}>Média diária</Text>
            <Text style={styles.miniValor} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {formatarMoeda(resumo.media)}
            </Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>Pedidos</Text>
            <Text style={styles.miniValor}>{resumo.pedidos}</Text>
          </View>
        </View>

        {/* Gráfico */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcone}>
              <Text style={styles.cardIconeTexto}>📈</Text>
            </View>
            <Text style={styles.cardTitulo}>Vendas diárias</Text>
          </View>

          {temDados ? (
            <>
              <View style={styles.graficoArea}>
                <GraficoVendasArea dados={serie} altura={230} />
              </View>
              <Text style={styles.dica}>Toque ou arraste sobre o gráfico para ver o dia</Text>
            </>
          ) : (
            <View style={styles.vazio}>
              <Text style={styles.vazioEmoji}>📊</Text>
              <Text style={styles.vazioTitulo}>Nenhuma venda no período</Text>
              <Text style={styles.vazioTexto}>
                O gráfico aparece assim que houver pedidos homologados ou retirados.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },

  scroll: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl },

  pPeriodo: { flexDirection: 'row', gap: spacing.sm },
  pilula: {
    flex: 1,
    minHeight: hitSize.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.round,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pilulaAtiva: { backgroundColor: colors.primary, borderColor: colors.primary },
  pilulaTexto: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  pilulaTextoAtivo: { color: colors.white, fontWeight: '800' },

  miniRow: { flexDirection: 'row', gap: spacing.sm },
  miniCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 3,
  },
  miniLabel: { color: colors.textLight, fontSize: 10, fontWeight: '700' },
  miniValor: { color: colors.text, fontSize: 15, fontWeight: '900' },

  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadows.medium,
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

  graficoArea: { marginHorizontal: -spacing.xs },
  dica: { color: colors.textLight, fontSize: 11, textAlign: 'center', marginTop: -spacing.sm },

  vazio: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  vazioEmoji: { fontSize: 34 },
  vazioTitulo: { color: colors.text, fontSize: 15, fontWeight: '800' },
  vazioTexto: { color: colors.textLight, fontSize: 12, textAlign: 'center' },

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
