import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../database/database";
import { colors, spacing } from "../styles/theme";
import BottomNavigation from "../components/BottomNavigation";
import HeaderVendedor from "../components/HeaderVendedor";
import { ABAS_VENDEDOR } from "../navigation/tabs";

export default function PedidosRecebidos({ navigation }: any) {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function buscarPedidos() {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, "pedidos"),
        where("vendedorId", "==", auth.currentUser.uid),
        where("status", "in", ["pendente", "pago", "homologada"])
      );
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPedidos(lista);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar os pedidos");
    }
  }

  useEffect(() => {
    buscarPedidos();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await buscarPedidos();
    setRefreshing(false);
  };

  function formatarData(data: any) {
    if (!data) return "Data não informada";
    if (data.toDate) return data.toDate().toLocaleDateString("pt-BR");
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function formatarHorario(data: any) {
    if (!data) return "";
    const d = data.toDate ? data.toDate() : new Date(data);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function renderPedido({ item }: any) {
    const itensTexto = item.lanches?.map((l: any) => `${l.quantidade}x ${l.nome}`).join(", ");
    const isPago = item.status === "pago" || item.status === "pendente";
    const isHomologada = item.status === "homologada";

    return (
      <View style={styles.card}>
        <Text style={styles.pedidoId}>Pedido #{item.id.slice(-6)}</Text>
        <Text style={styles.cliente}>Cliente: {item.compradorNome || item.compradorId.slice(-6)}</Text>
        <Text style={styles.data}>Data: {formatarData(item.criadoEm)} às {formatarHorario(item.criadoEm)}</Text>
        <Text style={styles.itens}>📦 Itens: {itensTexto}</Text>
        <Text style={styles.local}>📍 Retirada: {item.lanches?.[0]?.localRetirada || "Local não informado"}</Text>
        <Text style={styles.total}>Total: R$ {item.total.toFixed(2)}</Text>

        {isPago && (
          <TouchableOpacity
            style={styles.botaoConfirmar}
            onPress={() => navigation.navigate("LerQRCode", { pedidoId: item.id, codigoNumerico: item.codigoNumerico, acao: "homologar" })}
          >
            <Text style={styles.botaoTexto}>✅ Homologar compra</Text>
          </TouchableOpacity>
        )}

        {isHomologada && (
          <TouchableOpacity
            style={[styles.botaoConfirmar, { backgroundColor: colors.info }]}
            onPress={() => navigation.navigate("LerQRCode", { pedidoId: item.id, codigoNumerico: item.codigoNumerico, acao: "retirar" })}
          >
            <Text style={styles.botaoTexto}>📦 Confirmar retirada</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderVendedor navigation={navigation} tela="Pedidos recebidos" />

      <Text style={styles.titulo}>Pedidos Pendentes</Text>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        renderItem={renderPedido}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum pedido pendente</Text>}
      />

      <BottomNavigation
        abas={ABAS_VENDEDOR}
        ativa="PedidosRecebidos"
        onSelect={(key) => key !== "PedidosRecebidos" && navigation.navigate(key)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  lista: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  pedidoId: { fontSize: 16, fontWeight: "bold", marginBottom: 5, color: colors.text },
  cliente: { fontSize: 14, color: colors.text, marginBottom: 2 },
  data: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  itens: { fontSize: 13, color: colors.textSecondary, marginBottom: 4, fontWeight: "500" },
  local: { fontSize: 12, color: colors.textSecondary, marginBottom: 5, fontStyle: "italic" },
  total: { fontSize: 16, fontWeight: "bold", color: colors.success, marginBottom: 10 },
  botaoConfirmar: { backgroundColor: colors.success, padding: 10, borderRadius: 8, alignItems: "center" },
  botaoTexto: { color: colors.white, fontWeight: "bold" },
  vazio: { textAlign: "center", marginTop: 40, fontSize: 16, color: colors.textLight },
});