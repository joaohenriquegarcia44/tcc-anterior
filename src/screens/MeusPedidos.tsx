import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import QRCode from "react-native-qrcode-svg";
import { db, auth } from "../database/database";
import BottomNavigation from "../components/BottomNavigation";
import OrderStatus from "../components/OrderStatus";
import PrimaryButton from "../components/PrimaryButton";
import EmptyState from "../components/EmptyState";
import { colors, spacing, borderRadius, shadows, typography } from "../styles/theme";
import { ABAS_PRINCIPAIS } from "../navigation/tabs";

export default function MeusPedidos({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any | null>(null);

  async function carregarPedidos() {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, "pedidos"),
        where("compradorId", "==", auth.currentUser.uid),
        where("status", "not-in", ["aguardando_pagamento"])
      );
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPedidos(lista);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar seus pedidos");
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarPedidos();
    setRefreshing(false);
  };

  function formatarData(data: any) {
    if (!data) return "Data não informada";
    if (data.toDate) return data.toDate().toLocaleDateString("pt-BR");
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function getStatusText(status: string) {
    switch (status) {
      case "pendente": return "⏳ Aguardando retirada";
      case "pago": return "💳 Pagamento confirmado";
      case "homologada": return "✅ Compra realizada";
      case "retirado": return "🎉 Retirado";
      case "cancelado": return "❌ Cancelado";
      default: return status;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "pendente": return colors.warning;
      case "pago": return colors.info;
      case "homologada": return colors.success;
      case "retirado": return colors.success;
      case "cancelado": return colors.danger;
      default: return colors.textLight;
    }
  }

  /** Traduz o status do Firestore para a etapa visual da timeline (só apresentação). */
  function getEtapaAtual(status: string) {
    switch (status) {
      case "pago": return 0;
      case "pendente": return 0;
      case "homologada": return 2;
      case "retirado": return 3;
      default: return 0;
    }
  }

  function abrirDetalhes(pedido: any) {
    setPedidoSelecionado(pedido);
  }

  function fecharModal() {
    setPedidoSelecionado(null);
  }

  async function excluirPedido(pedidoId: string) {
    Alert.alert("Excluir pedido", "Tem certeza? Esta ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "pedidos", pedidoId));
            setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
            Alert.alert("Sucesso", "Pedido excluído");
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o pedido");
          }
        },
      },
    ]);
  }

  function renderPedido({ item }: any) {
    const isRetirado = item.status === "retirado";
    const podeAvaliar = isRetirado && !item.avaliado;

    return (
      <TouchableOpacity style={styles.card} onPress={() => abrirDetalhes(item)} activeOpacity={0.85}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.pedidoId}>#{item.id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.data}>{formatarData(item.criadoEm)}</Text>
          </View>
          <View style={[styles.statusPill, { borderColor: getStatusColor(item.status) }]}>
            <Text style={[styles.statusTexto, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardRodape}>
          <Text style={styles.total}>R$ {Number(item.total || 0).toFixed(2)}</Text>
          <Text style={styles.dica}>Toque para ver o andamento →</Text>
        </View>

        {(podeAvaliar || isRetirado) && (
          <View style={styles.acoes}>
            {podeAvaliar && (
              <TouchableOpacity style={styles.avaliarBotao} onPress={() => navigation.navigate("AvaliarPedido", { pedido: item })}>
                <Text style={styles.avaliarTexto}>⭐ Avaliar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.excluirBotao} onPress={() => excluirPedido(item.id)}>
              <Text style={styles.excluirTexto}>🗑 Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        renderItem={renderPedido}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
            <Text style={styles.headerTitulo}>Meus pedidos</Text>
            <Text style={styles.headerSubtitulo}>Acompanhe a retirada dos seus lanches</Text>
          </View>
        }
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            titulo="Nenhum pedido por aqui"
            descricao="Quando você fizer um pedido, ele aparece aqui com o status em tempo real."
          />
        }
      />

      <BottomNavigation
        abas={ABAS_PRINCIPAIS}
        ativa="MeusPedidos"
        onSelect={(key) => navigation.navigate(key)}
      />

      {!!pedidoSelecionado && (
        <Modal transparent visible animationType="slide" onRequestClose={fecharModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl }]}>
              <View style={styles.modalHandle} />

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitulo}>Pedido #{pedidoSelecionado.id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.modalSubtitulo}>{formatarData(pedidoSelecionado.criadoEm)}</Text>

                <OrderStatus
                  atual={getEtapaAtual(pedidoSelecionado.status)}
                  cancelado={pedidoSelecionado.status === "cancelado"}
                />

                <View style={styles.qrCartao}>
                  <Text style={styles.qrTitulo}>Retirada no IF</Text>
                  <View style={styles.qrCaixa}>
                    <QRCode
                      value={JSON.stringify({
                        pedidoId: pedidoSelecionado.id,
                        codigo: pedidoSelecionado.qrCode,
                        vendedorId: pedidoSelecionado.vendedorId,
                      })}
                      size={180}
                      backgroundColor="#FFFFFF"
                      color="#050505"
                    />
                  </View>
                  <Text style={styles.codigoNumerico}>
                    Código de retirada: {pedidoSelecionado.codigoNumerico ?? "—"}
                  </Text>
                  <Text style={styles.qrAjuda}>Mostre este código para retirar seu pedido.</Text>
                </View>

                <View style={styles.modalRodape}>
                  <View style={styles.modalTotalLinha}>
                    <Text style={styles.modalTotalRotulo}>Total do pedido</Text>
                    <Text style={styles.modalTotalValor}>
                      R$ {Number(pedidoSelecionado.total || 0).toFixed(2)}
                    </Text>
                  </View>
                  <PrimaryButton title="Fechar" onPress={fecharModal} variant="secondary" />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  lista: { paddingBottom: spacing.xxl },

  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  headerTitulo: { ...typography.h1 },
  headerSubtitulo: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },

  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  pedidoId: { color: colors.text, fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  data: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  statusPill: {
    borderWidth: 1,
    borderRadius: borderRadius.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusTexto: { fontSize: 11, fontWeight: "700" },

  cardRodape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  total: { color: colors.primary, fontSize: 19, fontWeight: "900" },
  dica: { color: colors.textLight, fontSize: 11 },

  acoes: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  avaliarBotao: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.round,
    alignItems: "center",
    minHeight: 44,
  },
  avaliarTexto: { color: colors.white, fontWeight: "800", fontSize: 13 },
  excluirBotao: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 12,
    borderRadius: borderRadius.round,
    alignItems: "center",
    minHeight: 44,
  },
  excluirTexto: { color: colors.danger, fontWeight: "700", fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    maxHeight: "92%",
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  modalTitulo: { ...typography.h2 },
  modalSubtitulo: { color: colors.textLight, fontSize: 12, marginTop: 2, marginBottom: spacing.lg },

  qrCartao: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  qrTitulo: { color: colors.text, fontSize: 15, fontWeight: "800" },
  qrCaixa: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
  },
  codigoNumerico: { color: colors.primary, fontSize: 14, fontWeight: "800" },
  qrAjuda: { color: colors.textLight, fontSize: 11, textAlign: "center" },

  modalRodape: { marginTop: spacing.xl, gap: spacing.lg },
  modalTotalLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTotalRotulo: { color: colors.textSecondary, fontSize: 14 },
  modalTotalValor: { color: colors.primary, fontSize: 22, fontWeight: "900" },
});
