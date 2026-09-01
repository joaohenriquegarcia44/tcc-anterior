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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Vendas (30 dias)</Text>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B6B" />
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
        chartConfig={{
          backgroundColor: "#fff7f7",
          backgroundGradientFrom: "#fff7f7",
          backgroundGradientTo: "#fff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
          propsForBackgroundLines: {
            stroke: "#eee",
            strokeDasharray: "0",
          },
          propsForLabels: {
            fontSize: 12,
          },
        }}
        onDataPointClick={(data: any) => {
          showTooltip(data, labels);
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
  container: { flex: 1, backgroundColor: "#f8f8f8", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  titulo: { fontSize: 18, fontWeight: "bold", marginLeft: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  loadingText: { marginTop: 10, fontSize: 14, color: "#666" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 8 },
  emptyText: { fontSize: 13, color: "#666", textAlign: "center" },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  summaryTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8, color: "#333" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { color: "#666" },
  summaryValue: { fontWeight: "700", color: "#FF6B6B" },
  chart: { borderRadius: 12, padding: 6, backgroundColor: "transparent" },
  chartContainer: { position: "relative", alignItems: "center", marginBottom: 8 },
  tooltip: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  tooltipLabel: { color: "#fff", fontSize: 11, marginBottom: 2 },
  tooltipValue: { color: "#fff", fontWeight: "700" },
});