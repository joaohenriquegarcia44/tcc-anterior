import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCarrinhoLogic } from "../hooks/useCarrinhoLogic";
import { colors, spacing, borderRadius, shadows } from "../styles/theme";

export default function Carrinho({ navigation }: any) {
  const {
    cart,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    subtotal,
    total,
    isLoggedIn,
    dataRetirada,
    setDataRetirada,
    showDatePicker,
    setShowDatePicker,
    calcularTotais,
    aplicarDescontoFidelidade,
    formatarData,
    onDateChange,
    finalizarPedido,
  } = useCarrinhoLogic(navigation);

  function renderItem({ item }: any) {
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.imagem }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.nome}</Text>
          <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
          {item.localRetirada && <Text style={styles.localText}>📍 {item.localRetirada}</Text>}
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => atualizarQuantidade(item.id, item.quantidade - 1)}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantidade}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => atualizarQuantidade(item.id, item.quantidade + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.itemTotalContainer}>
          <Text style={styles.itemTotal}>R$ {(item.preco * item.quantidade).toFixed(2)}</Text>
          <TouchableOpacity style={styles.removeButton} onPress={() => removerItem(item.id)}>
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
        </View>
        <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
        <Text style={styles.emptyText}>Que tal adicionar alguns lanches deliciosos?</Text>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.botaoTexto}>Ver Lanches</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Meu Carrinho</Text>
        </View>
        <TouchableOpacity onPress={limparCarrinho} style={styles.limparButton}>
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

      <View style={styles.resumoContainer}>
        <Text style={styles.resumoTitulo}>Resumo do pedido</Text>

        <View style={styles.resumoRow}>
          <Text style={styles.resumoLabel}>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'})</Text>
          <Text style={styles.resumoValue}>R$ {subtotal.toFixed(2)}</Text>
        </View>

        {subtotal > 0 && (
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Desconto Fidelidade</Text>
            <Text style={styles.resumoDesconto}>- R$ {aplicarDescontoFidelidade(0).toFixed(2)}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.dataButton} onPress={() => setShowDatePicker(true)}>
          <View style={styles.dataButtonContent}>
            <Text style={styles.dataButtonIcon}>📅</Text>
            <View>
              <Text style={styles.dataButtonLabel}>Data de retirada</Text>
              <Text style={styles.dataButtonText}>{formatarData(dataRetirada)}</Text>
            </View>
          </View>
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
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.botaoFinalizar} onPress={finalizarPedido} activeOpacity={0.8}>
          <Text style={styles.botaoFinalizarTexto}>Continuar • R$ {total.toFixed(2)}</Text>
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
  headerLeft: { flexDirection: "row", alignItems: "center" },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  backIcon: { fontSize: 18, color: colors.primary, fontWeight: "bold" },
  titulo: { fontSize: 22, fontWeight: "bold", color: colors.text },
  limparButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.danger + "10",
  },
  limparButtonText: { color: colors.danger, fontSize: 13, fontWeight: "500" },
  listContainer: { padding: spacing.lg },
  cartItem: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  itemImage: { width: 85, height: 85, borderRadius: borderRadius.lg },
  itemInfo: { flex: 1, marginLeft: spacing.md, justifyContent: "space-between" },
  itemName: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: spacing.xs },
  itemPrice: { fontSize: 14, color: colors.primary, fontWeight: "600", marginBottom: spacing.xs },
  localText: { fontSize: 11, color: colors.textSecondary, marginBottom: spacing.xs },
  quantityContainer: { flexDirection: "row", alignItems: "center" },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: { fontSize: 18, fontWeight: "bold", color: colors.primary },
  quantityText: { fontSize: 16, fontWeight: "bold", marginHorizontal: spacing.md, color: colors.text },
  itemTotalContainer: { alignItems: "flex-end", justifyContent: "space-between" },
  itemTotal: { fontSize: 15, fontWeight: "bold", color: colors.text },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.danger + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: { fontSize: 12, color: colors.danger, fontWeight: "bold" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
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
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textLight, textAlign: "center", marginBottom: spacing.xxl },
  botaoVoltar: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    ...shadows.medium,
  },
  botaoTexto: { color: colors.white, fontWeight: "bold", fontSize: 16 },
  resumoContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? 30 : spacing.xl,
    ...shadows.large,
  },
  resumoTitulo: { fontSize: 17, fontWeight: "bold", color: colors.text, marginBottom: spacing.lg },
  resumoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
  resumoLabel: { fontSize: 14, color: colors.textSecondary },
  resumoValue: { fontSize: 14, fontWeight: "600", color: colors.text },
  resumoDesconto: { fontSize: 14, fontWeight: "500", color: colors.danger },
  dataButton: {
    marginVertical: spacing.md,
    backgroundColor: colors.primary + "08",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary + "20",
    overflow: "hidden",
  },
  dataButtonContent: { flexDirection: "row", alignItems: "center", padding: spacing.lg },
  dataButtonIcon: { fontSize: 24, marginRight: spacing.md },
  dataButtonLabel: { fontSize: 11, color: colors.textLight, marginBottom: 2 },
  dataButtonText: { fontSize: 15, fontWeight: "600", color: colors.text },
  divisor: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  resumoTotal: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.lg },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: colors.text },
  totalValue: { fontSize: 22, fontWeight: "bold", color: colors.primary },
  botaoFinalizar: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    ...shadows.medium,
  },
  botaoFinalizarTexto: { color: colors.white, fontSize: 17, fontWeight: "bold" },
});
