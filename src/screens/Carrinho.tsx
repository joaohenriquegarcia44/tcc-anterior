import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCarrinhoLogic } from "../hooks/useCarrinhoLogic";

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
          <Text style={styles.itemName}>{item.nome}</Text>
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
            <Text style={styles.removeButtonText}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
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
        <Text style={styles.titulo}>Meu Carrinho</Text>
        <TouchableOpacity onPress={limparCarrinho} style={styles.limparButton}>
          <Text style={styles.limparButtonText}>Limpar tudo</Text>
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
          <Text style={styles.resumoLabel}>Subtotal</Text>
          <Text style={styles.resumoValue}>R$ {subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.resumoRow}>
          <Text style={styles.resumoLabel}>Taxa de entrega</Text>
          <Text style={styles.resumoValueGratis}>A definir</Text>
        </View>
        {subtotal > 0 && (
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Desconto Fidelidade</Text>
            <Text style={styles.resumoDesconto}>- R$ {aplicarDescontoFidelidade(0).toFixed(2)}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.dataButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dataButtonText}>📅 Data de retirada: {formatarData(dataRetirada)}</Text>
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
        <View style={styles.avisosContainer}>
          <Text style={styles.aviso}>📍 Entrega ou retirada será definida na próxima tela</Text>
        </View>
        <TouchableOpacity style={styles.botaoFinalizar} onPress={finalizarPedido}>
          <Text style={styles.botaoFinalizarTexto}>Continuar • R$ {total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#333" },
  limparButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#f5f5f5" },
  limparButtonText: { color: "#e74c3c", fontSize: 14 },
  listContainer: { padding: 15 },
  cartItem: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 15, padding: 12, marginBottom: 15, elevation: 2 },
  itemImage: { width: 80, height: 80, borderRadius: 10 },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  itemName: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 },
  itemPrice: { fontSize: 14, color: "#FF6B6B", fontWeight: "500", marginBottom: 4 },
  localText: { fontSize: 11, color: "#666", marginBottom: 4 },
  quantityContainer: { flexDirection: "row", alignItems: "center" },
  quantityButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FF6B6B20", justifyContent: "center", alignItems: "center" },
  quantityButtonText: { fontSize: 20, fontWeight: "bold", color: "#FF6B6B" },
  quantityText: { fontSize: 16, fontWeight: "bold", marginHorizontal: 15, color: "#333" },
  itemTotalContainer: { alignItems: "flex-end", justifyContent: "space-between" },
  itemTotal: { fontSize: 16, fontWeight: "bold", color: "#FF6B6B", marginBottom: 10 },
  removeButton: { paddingHorizontal: 10, paddingVertical: 5 },
  removeButtonText: { fontSize: 12, color: "#999" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 10 },
  emptyText: { fontSize: 14, color: "#999", textAlign: "center", marginBottom: 30 },
  botaoVoltar: { backgroundColor: "#FF6B6B", paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  resumoContainer: { backgroundColor: "#fff", borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, elevation: 5 },
  resumoTitulo: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15 },
  resumoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  resumoLabel: { fontSize: 14, color: "#666" },
  resumoValue: { fontSize: 14, fontWeight: "500", color: "#333" },
  resumoValueGratis: { fontSize: 14, fontWeight: "500", color: "#27ae60" },
  resumoDesconto: { fontSize: 14, fontWeight: "500", color: "#e74c3c" },
  dataButton: { marginVertical: 10, paddingVertical: 8, backgroundColor: "#f0f0f0", borderRadius: 8, alignItems: "center" },
  dataButtonText: { fontSize: 14, fontWeight: "500", color: "#333" },
  divisor: { height: 1, backgroundColor: "#eee", marginVertical: 15 },
  resumoTotal: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: "#333" },
  totalValue: { fontSize: 22, fontWeight: "bold", color: "#FF6B6B" },
  avisosContainer: { backgroundColor: "#f8f8f8", borderRadius: 10, padding: 12, marginBottom: 20 },
  aviso: { fontSize: 11, color: "#666", marginBottom: 4 },
  botaoFinalizar: { backgroundColor: "#FF6B6B", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  botaoFinalizarTexto: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});