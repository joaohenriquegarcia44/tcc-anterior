import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useConfirmarPedidoLogic } from "../hooks/useConfirmarPedidoLogic";

export default function ConfirmarPedido({ route, navigation }: any) {
  const {
    cart,
    loading,
    metodoPagamento,
    setMetodoPagamento,
    pontosUsuario,
    usandoPontos,
    pontosParaUsar,
    processandoPix,
    taxaEntrega,
    distancia,
    formatarData,
    calcularTotal,
    calcularDescontoPorPontos,
    calcularTotalComDesconto,
    calcularTotalFinal,
    toggleUsarPontos,
    pagarComPIX,
    finalizarPedidoPresencial,
    metodosPagamento,
    TOTAL,
    DESCONTO_PONTOS,
    TOTAL_COM_DESCONTO,
    TOTAL_FINAL,
    PONTOS_GANHOS,
    dataRetiradaObj,
    REAIS_POR_PONTO,        // 🔥 adicionado – era o que faltava
    entregaTipo,
    enderecoEntrega,
  } = useConfirmarPedidoLogic(route, navigation);

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
          <Text style={styles.botaoTexto}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPIX = metodoPagamento === "pix";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Revisar Pedido</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍔 Seu Pedido</Text>
        {cart.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <View style={styles.orderItemInfo}>
              <Text style={styles.orderItemQuantity}>{item.quantidade}x</Text>
              <Text style={styles.orderItemName}>{item.nome}</Text>
            </View>
            <Text style={styles.orderItemPrice}>R$ {(item.preco * item.quantidade).toFixed(2)}</Text>
            <Text style={styles.localRetiradaText}>📍 {item.localRetirada || "Local não informado"}</Text>
          </View>
        ))}
      </View>

      {/* Tipo de entrega */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚚 Entrega</Text>
        <View style={styles.infoCard}>
          <Text style={styles.tipoEntrega}>
            {entregaTipo === "retirada" ? "📍 Retirar com o vendedor" : "🚚 Receber em casa"}
          </Text>
          {entregaTipo === "entrega" && enderecoEntrega && (
            <>
              <Text style={styles.enderecoTexto}>
                📍 {enderecoEntrega.texto || "Endereço selecionado no mapa"}
              </Text>
              {distancia > 0 && (
                <Text style={styles.distanciaTexto}>📏 Distância: {distancia.toFixed(2)} km</Text>
              )}
            </>
          )}
          {taxaEntrega > 0 && (
            <Text style={styles.freteTexto}>🚚 Taxa de entrega: R$ {taxaEntrega.toFixed(2)}</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.fidelidadeCard}>
          <Text style={styles.fidelidadeIcon}>⭐</Text>
          <View style={styles.fidelidadeInfo}>
            <Text style={styles.fidelidadeTitle}>Programa Fidelidade</Text>
            <Text style={styles.fidelidadePontos}>Você tem {pontosUsuario} pontos acumulados!</Text>
            <Text style={styles.fidelidadeDescricao}>
              Cada R$ {REAIS_POR_PONTO} = 1 ponto | 10 pontos = R$1 de desconto
            </Text>
            {pontosUsuario > 0 && (
              <TouchableOpacity
                style={[styles.usarPontosButton, usandoPontos && styles.usarPontosButtonActive]}
                onPress={toggleUsarPontos}
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
                  Após a compra você terá: {pontosUsuario - pontosParaUsar + PONTOS_GANHOS} pontos
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Forma de Pagamento</Text>
        {metodosPagamento.map((metodo) => (
          <TouchableOpacity
            key={metodo.id}
            style={[styles.pagamentoOption, metodoPagamento === metodo.id && styles.pagamentoOptionSelected]}
            onPress={() => setMetodoPagamento(metodo.id)}
          >
            <View style={styles.pagamentoRadio}>
              {metodoPagamento === metodo.id && <View style={styles.pagamentoRadioSelected} />}
            </View>
            <View>
              <Text style={styles.pagamentoNome}>{metodo.nome}</Text>
              <Text style={styles.pagamentoDescricao}>{metodo.descricao}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Retirada</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View>
              <Text style={styles.infoLabel}>Data escolhida</Text>
              <Text style={styles.infoValue}>{formatarData(dataRetiradaObj)}</Text>
            </View>
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
          {taxaEntrega > 0 && (
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Taxa de entrega</Text>
              <Text style={styles.resumoValue}>R$ {taxaEntrega.toFixed(2)}</Text>
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
          <Text style={styles.pontosGanhosIcon}>⭐</Text>
          <View>
            <Text style={styles.pontosGanhosTitle}>Você ganhará</Text>
            <Text style={styles.pontosGanhosValor}>{PONTOS_GANHOS} pontos</Text>
            <Text style={styles.pontosGanhosDescricao}>
              equivalente a R$ {(PONTOS_GANHOS * 0.10).toFixed(2)} de desconto futuro
            </Text>
          </View>
        </View>
      </View>

      {isPIX ? (
        <TouchableOpacity
          style={[styles.botaoFinalizar, processandoPix && styles.botaoDisabled]}
          onPress={pagarComPIX}
          disabled={processandoPix}
        >
          {processandoPix ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoFinalizarTexto}>Pagar com PIX • R$ {TOTAL_FINAL.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.botaoFinalizar, loading && styles.botaoDisabled]}
          onPress={finalizarPedidoPresencial}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoFinalizarTexto}>Confirmar Pedido • R$ {TOTAL_FINAL.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// Estilos (mantenha os mesmos que você já tem no seu arquivo original)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  backIcon: { fontSize: 28, color: "#FF6B6B" },
  titulo: { fontSize: 20, fontWeight: "bold", color: "#333" },
  section: { backgroundColor: "#fff", marginTop: 12, paddingHorizontal: 20, paddingVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 16 },
  orderItem: { marginBottom: 12, borderBottomWidth: 0.5, borderBottomColor: "#ddd", paddingBottom: 8 },
  orderItemInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  orderItemQuantity: { fontSize: 14, fontWeight: "bold", color: "#FF6B6B", width: 35 },
  orderItemName: { fontSize: 16, color: "#333" },
  orderItemPrice: { fontSize: 16, fontWeight: "500", color: "#333", marginTop: 4 },
  localRetiradaText: { fontSize: 12, color: "#666", marginTop: 4, fontStyle: "italic" },
  tipoEntrega: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  enderecoTexto: { fontSize: 14, color: "#666", marginBottom: 4 },
  distanciaTexto: { fontSize: 12, color: "#666", marginBottom: 4 },
  freteTexto: { fontSize: 14, color: "#FF6B6B", fontWeight: "bold", marginTop: 8 },
  fidelidadeCard: { flexDirection: "row", backgroundColor: "#FFF3E0", borderRadius: 12, padding: 15 },
  fidelidadeIcon: { fontSize: 32, marginRight: 15 },
  fidelidadeInfo: { flex: 1 },
  fidelidadeTitle: { fontSize: 16, fontWeight: "bold", color: "#FF6B6B", marginBottom: 4 },
  fidelidadePontos: { fontSize: 20, fontWeight: "bold", color: "#FF6B6B", marginBottom: 4 },
  fidelidadeDescricao: { fontSize: 12, color: "#666", marginBottom: 10 },
  usarPontosButton: { backgroundColor: "#FF6B6B20", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: "flex-start", marginTop: 5 },
  usarPontosButtonActive: { backgroundColor: "#e74c3c20" },
  usarPontosButtonText: { color: "#FF6B6B", fontWeight: "500", fontSize: 13 },
  pontosInfo: { marginTop: 10, padding: 8, backgroundColor: "#FF6B6B10", borderRadius: 8 },
  pontosInfoText: { fontSize: 12, color: "#666", marginBottom: 2 },
  pagamentoOption: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  pagamentoOptionSelected: { backgroundColor: "#FF6B6B10" },
  pagamentoRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#ddd", marginRight: 15, justifyContent: "center", alignItems: "center" },
  pagamentoRadioSelected: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#FF6B6B" },
  pagamentoNome: { fontSize: 16, fontWeight: "500", color: "#333" },
  pagamentoDescricao: { fontSize: 12, color: "#999", marginTop: 2 },
  infoCard: { backgroundColor: "#f8f8f8", borderRadius: 12, padding: 15 },
  infoRow: { flexDirection: "row", marginBottom: 15 },
  infoIcon: { fontSize: 22, marginRight: 15 },
  infoLabel: { fontSize: 12, color: "#999", marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "500", color: "#333" },
  resumoCard: { backgroundColor: "#f8f8f8", borderRadius: 12, padding: 15 },
  resumoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  resumoLabel: { fontSize: 14, color: "#666" },
  resumoValue: { fontSize: 14, fontWeight: "500", color: "#333" },
  resumoLabelDesconto: { fontSize: 14, color: "#27ae60" },
  resumoValueDesconto: { fontSize: 14, fontWeight: "500", color: "#27ae60" },
  divisor: { height: 1, backgroundColor: "#ddd", marginVertical: 10 },
  resumoTotal: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: "#333" },
  totalValue: { fontSize: 22, fontWeight: "bold", color: "#FF6B6B" },
  pontosGanhosCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#E8F5E9", borderRadius: 12, padding: 15 },
  pontosGanhosIcon: { fontSize: 32, marginRight: 15 },
  pontosGanhosTitle: { fontSize: 12, color: "#666" },
  pontosGanhosValor: { fontSize: 24, fontWeight: "bold", color: "#4CAF50" },
  pontosGanhosDescricao: { fontSize: 11, color: "#999" },
  botaoFinalizar: { backgroundColor: "#FF6B6B", margin: 20, paddingVertical: 18, borderRadius: 12, alignItems: "center", elevation: 3 },
  botaoDisabled: { opacity: 0.7 },
  botaoFinalizarTexto: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  botaoVoltar: { backgroundColor: "#FF6B6B", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  botaoTexto: { color: "#fff", fontWeight: "bold" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f8f8", padding: 20 },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 10 },
});