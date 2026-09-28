import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useGraficoVendasLogic } from "../hooks/useGraficoVendasLogic";
import { colors } from "../styles/theme";

const { width: screenWidth } = Dimensions.get("window");

export default function GraficoVendas({ navigation }: any) {
  const {
    vendas,
    loading,
    tooltip,
    labels,
    valores,
    totalSales,
    avgSales,
    showTooltip,
  } = useGraficoVendasLogic(navigation);
  return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando vendas...</Text>
        </View>
      )}

      {!loading && vendas.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Nenhuma venda nos últimos 30 dias</Text>
          <Text style={styles.emptyText}>
            As vendas serão exibidas aqui assim que você homologar e retirar pedidos.
          </Text>
        </View>
      )}

      {!loading && vendas.length > 0 && (
      <>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>R$ {totalSales.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Média diária</Text>
          <Text style={styles.summaryValue}>R$ {avgSales.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <BarChart
        data={{
          labels: labels,
          datasets: [{ data: valores }],
        }}
        width={screenWidth - 32}
        height={300}
        yAxisLabel="R$ "
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(240, 0, 24, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(246, 245, 243, ${opacity})`,
          propsForBackgroundLines: {
            stroke: colors.border,
            strokeDasharray: "0",
          },
          propsForLabels: {
            fontSize: 12,
          },
        }}
        verticalLabelRotation={45}
        showBarTops={true}
        withInnerLines={true}
        style={styles.chart}
        fromZero
        />

        {tooltip.visible && (
          <View style={[styles.tooltip, { left: Math.max(6, tooltip.x - 40), top: Math.max(6, tooltip.y - 60) }]}>
            <Text style={styles.tooltipLabel}>{tooltip.label}</Text>
            <Text style={styles.tooltipValue}>R$ {tooltip.value.toFixed(2)}</Text>
          </View>
        )}
      </View>
      </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  loadingText: { marginTop: 10, fontSize: 14, color: colors.textSecondary },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "bold", color: colors.text, textAlign: "center", marginBottom: 8 },
  emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: "center" },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  summaryTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8, color: colors.text },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { color: colors.textSecondary },
  summaryValue: { fontWeight: "700", color: colors.primaryText },
  chart: { borderRadius: 12, padding: 6, backgroundColor: "transparent" },
  chartContainer: { position: "relative", alignItems: "center", marginBottom: 8 },
  tooltip: {
    position: "absolute",
    backgroundColor: colors.text,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  tooltipLabel: { color: colors.background, fontSize: 11, marginBottom: 2 },
  tooltipValue: { color: colors.primaryDark, fontWeight: "700" },
});