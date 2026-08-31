import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { useConfirmarPedidoLogic } from "../hooks/useConfirmarPedidoLogic";
import { colors, spacing, borderRadius, shadows } from "../styles/theme";

export default function ConfirmarPedido({ route, navigation }: any) {
  const {
    cart,
    processandoPix,
    formatarData,
    toggleUsarPontos,
    pagarComPIX,
    TOTAL,
    DESCONTO_PONTOS,
    TOTAL_FINAL,
    PONTOS_GANHOS,
    dataRetiradaObj,
    REAIS_POR_PONTO,
    pontosUsuario,
    usandoPontos,
    pontosParaUsar,
  } = useConfirmarPedidoLogic(route, navigation);

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
        </View>
        <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
          <Text style={styles.botaoTexto}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Revisar Pedido</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍔 Seu Pedido</Text>
          {cart.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityBadgeText}>{item.quantidade}x</Text>
                </View>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{item.nome}</Text>
                  <Text style={styles.localRetiradaText}>📍 {item.localRetirada || "Local não informado"}</Text>
                </View>
              </View>
              <Text style={styles.orderItemPrice}>R$ {(item.preco * item.quantidade).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.fidelidadeCard}>
            <View style={styles.fidelidadeIconContainer}>
              <Text style={styles.fidelidadeIcon}>⭐</Text>
            </View>
            <View style={styles.fidelidadeInfo}>
              <Text style={styles.fidelidadeTitle}>Programa Fidelidade</Text>
              <Text style={styles.fidelidadePontos}>{pontosUsuario} pontos</Text>
              <Text style={styles.fidelidadeDescricao}>
                Cada R$ {REAIS_POR_PONTO} = 1 ponto | 10 pontos = R$1 de desconto
              </Text>
              {pontosUsuario > 0 && (
                <TouchableOpacity
                  style={[styles.usarPontosButton, usandoPontos && styles.usarPontosButtonActive]}
                  onPress={toggleUsarPontos}
                  activeOpacity={0.7}
                >
                  <Text style={styles.usarPontosButtonText}>
                    {usandoPontos ? "❌ Cancelar uso de pontos" : "🎁 Usar meus pontos"}
                  </Text>
                </TouchableOpacity>
              )}
              {usandoPontos && (
                <View style={styles.pontosInfo}>
                  <Text style={styles.pontosInfoText}>
                    Usando {pontosParaUsar} pontos → Desconto de R$ {DESCONTO_PONTOS.toFixed(2)}
                  </Text>
                  <Text style={styles.pontosInfoText}>
                    Após a compra: {pontosUsuario - pontosParaUsar + PONTOS_GANHOS} pontos
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Retirada</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>📅</Text>
            </View>
            <View>
              <Text style={styles.infoLabel}>Data escolhida</Text>
              <Text style={styles.infoValue}>{formatarData(dataRetiradaObj)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Resumo</Text>
          <View style={styles.resumoCard}>
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Subtotal</Text>
              <Text style={styles.resumoValue}>R$ {TOTAL.toFixed(2)}</Text>
            </View>
            {DESCONTO_PONTOS > 0 && (
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabelDesconto}>Desconto por pontos</Text>
                <Text style={styles.resumoValueDesconto}>- R$ {DESCONTO_PONTOS.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.divisor} />
            <View style={styles.resumoTotal}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>R$ {TOTAL_FINAL.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.pontosGanhosCard}>
            <View style={styles.pontosGanhosIconContainer}>
              <Text style={styles.pontosGanhosIcon}>⭐</Text>
            </View>
            <View>
              <Text style={styles.pontosGanhosTitle}>Você ganhará</Text>
              <Text style={styles.pontosGanhosValor}>{PONTOS_GANHOS} pontos</Text>
              <Text style={styles.pontosGanhosDescricao}>
                equivalente a R$ {(PONTOS_GANHOS * 0.10).toFixed(2)} de desconto futuro
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.botaoFinalizar, processandoPix && styles.botaoDisabled]}
          onPress={pagarComPIX}
          disabled={processandoPix}
          activeOpacity={0.8}
        >
          {processandoPix ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.botaoFinalizarTexto}>Pagar com PIX • R$ {TOTAL_FINAL.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
    paddingTop: Platform.OS === "ios" ? 50 : spacing.xl,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...shadows.small,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: { fontSize: 20, color: colors.primary, fontWeight: "bold" },
  titulo: { fontSize: 20, fontWeight: "bold", color: colors.text },
  scrollContent: { paddingBottom: 100 },
  section: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.small,
  },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: colors.text, marginBottom: spacing.lg },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  quantityBadge: {
    backgroundColor: colors.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  quantityBadgeText: { fontSize: 13, fontWeight: "bold", color: colors.primary },
  orderItemInfo: { flex: 1 },
  orderItemName: { fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: 2 },
  localRetiradaText: { fontSize: 11, color: colors.textLight, fontStyle: "italic" },
  orderItemPrice: { fontSize: 15, fontWeight: "600", color: colors.text, marginLeft: spacing.md },
  fidelidadeCard: {
    flexDirection: "row",
    backgroundColor: colors.warning + "10",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning + "20",
  },
  fidelidadeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.warning + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  fidelidadeIcon: { fontSize: 24 },
  fidelidadeInfo: { flex: 1 },
  fidelidadeTitle: { fontSize: 15, fontWeight: "bold", color: colors.text, marginBottom: 2 },
  fidelidadePontos: { fontSize: 22, fontWeight: "bold", color: colors.primary, marginBottom: 2 },
  fidelidadeDescricao: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm },
  usarPontosButton: {
    backgroundColor: colors.primary + "15",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  usarPontosButtonActive: { backgroundColor: colors.danger + "15" },
  usarPontosButtonText: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  pontosInfo: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary + "08",
    borderRadius: borderRadius.md,
  },
  pontosInfoText: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  infoIcon: { fontSize: 20 },
  infoLabel: { fontSize: 11, color: colors.textLight, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "600", color: colors.text },
  resumoCard: { backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.lg },
  resumoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
  resumoLabel: { fontSize: 14, color: colors.textSecondary },
  resumoValue: { fontSize: 14, fontWeight: "600", color: colors.text },
  resumoLabelDesconto: { fontSize: 14, color: colors.success },
  resumoValueDesconto: { fontSize: 14, fontWeight: "600", color: colors.success },
  divisor: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  resumoTotal: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: colors.text },
  totalValue: { fontSize: 22, fontWeight: "bold", color: colors.primary },
  pontosGanhosCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success + "10",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.success + "20",
  },
  pontosGanhosIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.success + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  pontosGanhosIcon: { fontSize: 24 },
  pontosGanhosTitle: { fontSize: 12, color: colors.textSecondary },
  pontosGanhosValor: { fontSize: 26, fontWeight: "bold", color: colors.success },
  pontosGanhosDescricao: { fontSize: 11, color: colors.textLight },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? 30 : spacing.xl,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadows.large,
  },
  botaoFinalizar: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  botaoDisabled: { opacity: 0.6 },
  botaoFinalizarTexto: { color: colors.white, fontSize: 17, fontWeight: "bold" },
  botaoVoltar: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    ...shadows.medium,
  },
  botaoTexto: { color: colors.white, fontWeight: "bold", fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background, padding: spacing.xl },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  emptyIcon: { fontSize: 60 },
  emptyTitle: { fontSize: 22, fontWeight: "bold", color: colors.text, marginBottom: spacing.lg },
});
