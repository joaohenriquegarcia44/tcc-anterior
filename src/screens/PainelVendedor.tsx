import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs, deleteDoc, doc, query, where, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../database/database";
import { colors, spacing, borderRadius, shadows } from "../styles/theme";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function PainelVendedor({ navigation }: any) {
  const [lanches, setLanches] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalBonificacao, setModalBonificacao] = useState(false);
  const [reaisGasto, setReaisGasto] = useState("5");
  const [reaisDesconto, setReaisDesconto] = useState("0.5");
  const [salvandoBonificacao, setSalvandoBonificacao] = useState(false);
  const [menuVisivel, setMenuVisivel] = useState(false);

  useEffect(() => {
    verificarPermissao();
  }, []);

  async function verificarPermissao() {
    if (!auth.currentUser) {
      navigation.replace("Login");
      return;
    }
    try {
      const userRef = doc(db, "usuarios", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const papel = userSnap.data()?.papel;
      if (papel !== "admin") {
        Alert.alert("Acesso negado", "Você não tem permissão para acessar esta área.");
        navigation.goBack();
        return;
      }
      buscarLanches();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível verificar permissão.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  const buscarLanches = useCallback(async () => {
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erro", "Usuário não logado");
        setError("Usuário não autenticado");
        return;
      }
      const q = query(collection(db, "lanches"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
      setLanches(lista);
    } catch (err: any) {
      console.error("❌ Erro ao buscar lanches:", err);
      setError(err.message || "Erro desconhecido");
      Alert.alert("Erro", "Não foi possível carregar seus lanches.");
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await buscarLanches();
    setRefreshing(false);
  };

  async function carregarBonificacao() {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "usuarios", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const bonificacao = userSnap.data()?.bonificacao;
      if (bonificacao) {
        setReaisGasto(String(bonificacao.reaisGasto ?? 5));
        setReaisDesconto(String(bonificacao.reaisDesconto ?? 0.5));
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function abrirBonificacao() {
    await carregarBonificacao();
    setModalBonificacao(true);
  }

  async function salvarBonificacao() {
    if (!auth.currentUser) return;
    const gasto = parseFloat(reaisGasto.replace(",", "."));
    const desconto = parseFloat(reaisDesconto.replace(",", "."));
    if (isNaN(gasto) || gasto <= 0) {
      Alert.alert("Erro", "Informe um valor de gasto válido maior que zero");
      return;
    }
    if (isNaN(desconto) || desconto < 0) {
      Alert.alert("Erro", "Informe um valor de desconto válido");
      return;
    }
    setSalvandoBonificacao(true);
    try {
      const userRef = doc(db, "usuarios", auth.currentUser.uid);
      await updateDoc(userRef, {
        bonificacao: { reaisGasto: gasto, reaisDesconto: desconto },
      });
      Alert.alert("Sucesso", "Bonificação atualizada com sucesso!");
      setModalBonificacao(false);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar a bonificação");
    } finally {
      setSalvandoBonificacao(false);
    }
  }

  const deletarLanche = (id: string) => {
    Alert.alert("Excluir", "Deseja excluir este lanche?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "lanches", id));
            setLanches(prev => prev.filter(item => item.id !== id));
            Alert.alert("Sucesso", "Lanche excluído");
          } catch (error: any) {
            Alert.alert("Erro ao deletar", error.message || "Sem permissão");
          }
        },
      },
    ]);
  };

  const salgados = lanches.filter(l =>
    (l.categorias && l.categorias.includes("lanche")) || (!l.categorias && l.categoria === "lanche")
  );
  const doces = lanches.filter(l =>
    (l.categorias && l.categorias.includes("doce")) || (!l.categorias && l.categoria === "doce")
  );
  const bebidas = lanches.filter(l =>
    (l.categorias && l.categorias.includes("bebida")) || (!l.categorias && l.categoria === "bebida")
  );
  const promocoes = lanches.filter(l => l.promocao === true);

  const sections = [
    { title: "🍔 Salgados", data: salgados, color: "#FF6B6B" },
    { title: "🍰 Doces", data: doces, color: "#FFE66D"},
    { title: "🥤 Bebidas", data: bebidas, color: "#4ECDC4" },
    { title: "🔥 Promoções", data: promocoes, color: "#FF9F40"},
  ].filter(section => section.data.length > 0);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imagem }} style={styles.imagem} />
      <View style={styles.cardContent}>
        <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
          {item.promocao && (
            <View style={styles.promoTag}>
              <Text style={styles.promoTagText}>OFF</Text>
            </View>
          )}
        </View>
        <View style={styles.botoes}>
          <TouchableOpacity style={styles.editar} onPress={() => navigation.navigate("EditarLanche", { lanche: item })}>
            <Text style={styles.textoBotao}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.excluir} onPress={() => deletarLanche(item.id)}>
            <Text style={styles.textoBotao}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Verificando permissão...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Erro ao carregar lanches</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.botaoPedidos} onPress={buscarLanches}>
            <Text style={styles.botaoPedidosTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Meus Lanches</Text>
          <TouchableOpacity style={styles.hamburgerButton} onPress={() => setMenuVisivel(!menuVisivel)}>
            <Ionicons name={menuVisivel ? "close" : "menu"} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {menuVisivel && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisivel(false); navigation.navigate("PedidosRecebidos"); }}>
              <Ionicons name="receipt" size={20} color="#FF6B6B" />
              <Text style={styles.menuItemText}>Pedidos Recebidos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisivel(false); navigation.navigate("LerQRCode"); }}>
              <Ionicons name="scan" size={20} color="#3498db" />
              <Text style={styles.menuItemText}>Escanear QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisivel(false); navigation.navigate("GraficoVendas"); }}>
              <Ionicons name="stats-chart" size={20} color="#9b59b6" />
              <Text style={styles.menuItemText}>Gráfico de Vendas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisivel(false); abrirBonificacao(); }}>
              <Ionicons name="gift" size={20} color="#FF9F40" />
              <Text style={styles.menuItemText}>Fidelidade</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisivel(false); navigation.navigate("CriarLanche"); }}>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>Criar Lanche</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal
          visible={modalBonificacao}
          transparent
          animationType="slide"
          onRequestClose={() => setModalBonificacao(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>🎁 Configurar Bonificação</Text>
              <Text style={styles.modalSubtitle}>
                Defina quanto o cliente ganha de desconto a cada valor gasto nos seus lanches.
              </Text>

              <Text style={styles.label}>A cada R$ gasto</Text>
              <TextInput
                style={styles.input}
                value={reaisGasto}
                onChangeText={setReaisGasto}
                keyboardType="numeric"
                placeholder="Ex: 5"
              />

              <Text style={styles.label}>gera R$ de desconto</Text>
              <TextInput
                style={styles.input}
                value={reaisDesconto}
                onChangeText={setReaisDesconto}
                keyboardType="numeric"
                placeholder="Ex: 0,5"
              />

              <Text style={styles.modalHint}>
                Ex: a cada R$ {reaisGasto || "X"} gasto, o cliente acumula R$ {reaisDesconto || "Y"} de desconto de fidelidade.
              </Text>

              <TouchableOpacity
                style={[styles.modalButton, salvandoBonificacao && styles.botaoDisabled]}
                onPress={salvarBonificacao}
                disabled={salvandoBonificacao}
              >
                {salvandoBonificacao ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalBonificacao(false)}
                disabled={salvandoBonificacao}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {lanches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍔</Text>
            <Text style={styles.emptyTitle}>Nenhum lanche encontrado</Text>
            <Text style={styles.emptyText}>Que tal criar seu primeiro lanche?</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("CriarLanche")}>
              <Text style={styles.addButtonText}>+ Criar Lanche</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF6B6B"]} />}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {sections.map((section) => (
              <View key={section.title} style={styles.sectionWrapper}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
                  <View style={[styles.sectionLine, { backgroundColor: section.color }]} />
                </View>
                <FlatList
                  horizontal
                  data={section.data.slice(0, 5)}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 16 }}
                  ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.addButtonFooter} onPress={() => navigation.navigate("CriarLanche")}>
              <Text style={styles.addButtonFooterText}>+ Novo Lanche</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + "15", justifyContent: "center", alignItems: "center" },
  backIcon: { fontSize: 20, color: colors.primary, fontWeight: "bold" },
  titulo: { fontSize: 22, fontWeight: "bold", color: colors.text, textAlign: "center" },
  hamburgerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border },

  botaoPedidos: { flex: 1, minWidth: "48%", backgroundColor: colors.secondary, paddingVertical: 14, borderRadius: 14, alignItems: "center", elevation: 2 },
  botaoPedidosTexto: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  dropdownMenu: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  menuItemText: { fontSize: 15, fontWeight: "500", color: colors.text },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContainer: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 8, textAlign: "center" },
  modalSubtitle: { fontSize: 13, color: "#666", textAlign: "center", marginBottom: 16 },
  label: { fontSize: 14, color: "#666", marginBottom: 8, marginTop: 12, fontWeight: "500" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: "#fff", color: "#333" },
  modalHint: { fontSize: 12, color: "#999", marginTop: 14, fontStyle: "italic", textAlign: "center" },
  modalButton: { backgroundColor: "#FF9F40", marginTop: 20, paddingVertical: 14, borderRadius: 12, alignItems: "center", elevation: 2 },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalCancel: { marginTop: 10, paddingVertical: 12, alignItems: "center" },
  modalCancelText: { color: "#666", fontSize: 14, fontWeight: "500" },
  botaoDisabled: { opacity: 0.6 },

  sectionWrapper: { marginBottom: 20 },
  sectionHeader: { marginTop: 4, marginBottom: 12, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  sectionLine: { height: 3, width: 50, borderRadius: 2, marginTop: 2 },

  card: {
    width: 150,
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  imagem: { width: 150, height: 100, resizeMode: "cover" },
  cardContent: { padding: 12, gap: 6 },
  nome: { fontSize: 15, fontWeight: "bold", color: "#333" },
  preco: { fontSize: 14, fontWeight: "600", color: "#FF6B6B" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  promoTag: { backgroundColor: "#FF6B6B20", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  promoTagText: { fontSize: 9, fontWeight: "bold", color: "#FF6B6B" },
  botoes: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginTop: 8 },
  editar: { flex: 1, backgroundColor: "#3498db", paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  excluir: { flex: 1, backgroundColor: "#e74c3c", paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  textoBotao: { color: "#fff", fontWeight: "bold", fontSize: 12 },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 70, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 8 },
  emptyText: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 24 },
  addButton: { backgroundColor: "#FF6B6B", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, alignItems: "center", elevation: 2 },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  addButtonFooter: { backgroundColor: "#FF6B6B", paddingVertical: 12, borderRadius: 30, alignItems: "center", marginVertical: 20, marginHorizontal: 40, elevation: 2 },
  addButtonFooterText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 10, fontSize: 14, color: "#666" },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorText: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 8 },
  errorDetail: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 20 },
});