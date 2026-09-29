import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCarrinhoLogic } from "../hooks/useCarrinhoLogic";
import CartItemRow from "../components/CartItemRow";
import PrimaryButton from "../components/PrimaryButton";
import EmptyState from "../components/EmptyState";
import { colors, spacing, borderRadius, shadows, typography } from "../styles/theme";

export default function Carrinho({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const {
    cart,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    subtotal,
    descontoCombo,
    total,
    dataRetirada,
    setDataRetirada,
    showDatePicker,
    setShowDatePicker,
    aplicarDescontoFidelidade,
    formatarData,
    onDateChange,
    finalizarPedido,
  } = useCarrinhoLogic(navigation);

  function renderItem({ item }: any) {
    return (
      <CartItemRow
        item={item}
        onIncrease={() => atualizarQuantidade(item.id, item.quantidade + 1)}
        onDecrease={() => atualizarQuantidade(item.id, item.quantidade - 1)}
        onRemove={() => removerItem(item.id)}
        onPress={() => navigation.navigate("Produto", { produto: item })}
      />
    );
  }

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="🛒"
          titulo="Seu carrinho está vazio"
          descricao="Que tal adicionar alguns lanches deliciosos?"
        />
        <PrimaryButton
          title="Ver lanches"
          onPress={() => navigation.navigate("Home")}
          icon="🍔"
          style={styles.botaoVoltar}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextos}>
          <Text style={styles.headerSubtitulo}>
            {cart.length} {cart.length === 1 ? "lanche escolhido" : "lanches escolhidos"} · retirada no IF
          </Text>
        </View>
        <TouchableOpacity onPress={limparCarrinho} style={styles.limparButton} hitSlop={8}>
          <Text style={styles.limparButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <View style={[styles.resumoContainer, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl }]}>
        <Text style={styles.resumoTitulo}>Resumo do pedido</Text>

        <View style={styles.resumoRow}>
          <Text style={styles.resumoLabel}>
            Subtotal ({cart.length} {cart.length === 1 ? "item" : "itens"})
          </Text>
          <Text style={styles.resumoValue}>R$ {subtotal.toFixed(2)}</Text>
        </View>

        {descontoCombo > 0 && (
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>🎁 Desconto combo</Text>
            <Text style={styles.resumoDesconto}>- R$ {descontoCombo.toFixed(2)}</Text>
          </View>
        )}

        {subtotal > 0 && (
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Desconto fidelidade</Text>
            <Text style={styles.resumoDesconto}>- R$ {aplicarDescontoFidelidade(0).toFixed(2)}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.dataBotao} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dataBotaoIcone}>📅</Text>
          <View style={styles.dataTextos}>
            <Text style={styles.dataRotulo}>DATA DE RETIRADA</Text>
            <Text style={styles.dataValor}>{formatarData(dataRetirada)}</Text>
          </View>
          <Text style={styles.dataSeta}>›</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dataRetirada}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.divisor} />

        <View style={styles.resumoTotal}>
          <Text style={styles.totalRotulo}>TOTAL</Text>
          <Text style={styles.totalValor}>R$ {total.toFixed(2)}</Text>
        </View>

        <PrimaryButton
          title={`Continuar • R$ ${total.toFixed(2)}`}
          onPress={finalizarPedido}
          icon="→"
        />

        <Text style={styles.avisoRetirada}>
          🚶 Retirada somente no IF · sem taxa de entrega
        </Text>
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  headerTextos: { flex: 1 },
  headerSubtitulo: { color: colors.textSecondary, fontSize: 12, flex: 1 },
  limparButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: "rgba(255,59,71,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,59,71,0.3)",
  },
  limparButtonText: { color: colors.danger, fontSize: 13, fontWeight: "700" },

  listContainer: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  botaoVoltar: { alignSelf: "center", paddingHorizontal: spacing.xxxl },

  resumoContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    ...shadows.large,
  },
  resumoTitulo: { ...typography.h3, marginBottom: spacing.lg },
  resumoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  resumoLabel: { fontSize: 14, color: colors.textSecondary },
  resumoValue: { fontSize: 14, fontWeight: "600", color: colors.text },
  resumoDesconto: { fontSize: 14, fontWeight: "700", color: colors.success },

  dataBotao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.input,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: 56,
  },
  dataBotaoIcone: { fontSize: 20 },
  dataTextos: { flex: 1 },
  dataRotulo: {
    color: colors.textLight,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  dataValor: { color: colors.text, fontSize: 15, fontWeight: "700", marginTop: 2 },
  dataSeta: { color: colors.textLight, fontSize: 22 },

  divisor: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  resumoTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  totalRotulo: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  totalValor: { color: colors.primary, fontSize: 26, fontWeight: "900" },

  avisoRetirada: {
    color: colors.textLight,
    fontSize: 11,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
