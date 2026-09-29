import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs, deleteDoc, doc, query, where, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../database/database";
import { colors, spacing, borderRadius, shadows, typography } from "../styles/theme";
import AdminCard from "../components/AdminCard";
import FoodImage from "../components/FoodImage";
import PrimaryButton from "../components/PrimaryButton";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";

export default function PainelVendedor({ navigation }: any) {
  const [lanches, setLanches] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalBonificacao, setModalBonificacao] = useState(false);
  const [reaisGasto, setReaisGasto] = useState("5");
  const [reaisDesconto, setReaisDesconto] = useState("0.5");
  const [salvandoBonificacao, setSalvandoBonificacao] = useState(false);

  useEffect(() => {
    verificarPermissao();
  }, []);

  // Permissão: apenas administering lanches (papel === "admin") entra aqui.
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
      const lista = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
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
            setLanches((prev) => prev.filter((item) => item.id !== id));
            Alert.alert("Sucesso", "Lanche excluído");
          } catch (error: any) {
            Alert.alert("Erro ao deletar", error.message || "Sem permissão");
          }
        },
      },
    ]);
  };

  const salgados = lanches.filter(
    (l) => (l.categorias && l.categorias.includes("lanche")) || (!l.categorias && l.categoria === "lanche")
  );
  const doces = lanches.filter(
    (l) => (l.categorias && l.categorias.includes("doce")) || (!l.categorias && l.categoria === "doce")
  );
  const bebidas = lanches.filter(
    (l) => (l.categorias && l.categorias.includes("bebida")) || (!l.categorias && l.categoria === "bebida")
  );
  const promocoes = lanches.filter((l) => l.promocao === true);

  const sections = [
    { title: "🍔 Salgados", data: salgados, color: colors.primary },
    { title: "🥤 Bebidas", data: bebidas, color: colors.secondary },
    { title: "🍰 Doces", data: doces, color: colors.primaryLight },
    { title: "🔥 Promoções", data: promocoes, color: colors.secondary },
  ].filter((section) => section.data.length > 0);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <FoodImage uri={item.imagem} style={styles.imagem} radius={0} fallbackIcon="🍔" />
      <View style={styles.cardContent}>
        <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.preco}>R$ {Number(item.preco || 0).toFixed(2)}</Text>
          {item.promocao && (
            <View style={styles.promoTag}>
              <Text style={styles.promoTagText}>OFF</Text>
            </View>
          )}
        </View>
        <View style={styles.botoes}>
          <TouchableOpacity
            style={styles.editar}
            onPress={() => navigation.navigate("EditarLanche", { lanche: item })}
            activeOpacity={0.85}
          >
            <Text style={styles.textoBotao}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.excluir} onPress={() => deletarLanche(item.id)} activeOpacity={0.85}>
            <Text style={styles.textoBotao}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingState mensagem="Verificando permissão..." sub="Só um instante" />;
  }

  if (error) {
    return (
      <View style={styles.safeArea}>
        <EmptyState icon="⚠️" titulo="Erro ao carregar lanches" descricao={error} />
        <View style={styles.retryBox}>
          <PrimaryButton title="Tentar novamente" onPress={buscarLanches} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.menu}>
          <AdminCard
            icon="➕"
            titulo="Criar lanche"
            subtitulo="Publique um novo lanche no cardápio"
            onPress={() => navigation.navigate("CriarLanche")}
            destaque
            badge="NOVO"
          />
          <AdminCard
            icon="🧾"
            titulo="Pedidos recebidos"
            subtitulo="Confirme e prepare os pedidos"
            onPress={() => navigation.navigate("PedidosRecebidos")}
          />
          <AdminCard
            icon="📷"
            titulo="Escanear QR Code"
            subtitulo="Confirme a retirada do pedido"
            onPress={() => navigation.navigate("LerQRCode")}
          />
          <AdminCard
            icon="📈"
            titulo="Vendas"
            subtitulo="Acompanhe seu desempenho"
            onPress={() => navigation.navigate("Vendas")}
          />
          <AdminCard
            icon="🎁"
            titulo="Fidelidade"
            subtitulo="Defina a bonificação dos seus clientes"
            onPress={abrirBonificacao}
          />
        </View>

        {lanches.length === 0 ? (
          <EmptyState
            icon="🍔"
            titulo="Você ainda não tem lanches"
            descricao="Que tal criar seu primeiro lanche e começar a vender para os alunos do IFSul?"
          >
            <PrimaryButton
              title="Criar lanche"
              onPress={() => navigation.navigate("CriarLanche")}
              style={styles.emptyBotao}
            />
          </EmptyState>
        ) : (
          <>
            {sections.map((section) => (
              <View key={section.title} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
                  <View style={[styles.sectionContador, { borderColor: section.color }]}>
                    <Text style={[styles.sectionContadorTexto, { color: section.color }]}>
                      {section.data.length}
                    </Text>
                  </View>
                </View>

                <FlatList
                  horizontal
                  data={section.data.slice(0, 5)}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                />
              </View>
            ))}

            <PrimaryButton
              title="+ Novo lanche"
              onPress={() => navigation.navigate("CriarLanche")}
              variant="secondary"
              style={styles.novoBotao}
            />
          </>
        )}
      </ScrollView>

      <Modal
        visible={modalBonificacao}
        transparent
        animationType="slide"
        onRequestClose={() => setModalBonificacao(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🎁 Configurar bonificação</Text>
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
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.label}>gera R$ de desconto</Text>
            <TextInput
              style={styles.input}
              value={reaisDesconto}
              onChangeText={setReaisDesconto}
              keyboardType="numeric"
              placeholder="Ex: 0,5"
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.modalHint}>
              Ex: a cada R$ {reaisGasto || "X"} gasto, o cliente acumula R$ {reaisDesconto || "Y"} de desconto
              de fidelidade.
            </Text>

            <PrimaryButton
              title="Salvar"
              onPress={salvarBonificacao}
              loading={salvandoBonificacao}
              disabled={salvandoBonificacao}
              style={styles.modalSalvar}
            />
            <PrimaryButton
              title="Cancelar"
              onPress={() => setModalBonificacao(false)}
              variant="ghost"
              disabled={salvandoBonificacao}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },

  menu: { gap: spacing.md, marginBottom: spacing.xxl },

  section: { marginBottom: spacing.xxl },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: { ...typography.h3, fontSize: 16, color: colors.white },
  sectionContador: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    alignItems: "center",
  },
  sectionContadorTexto: { fontSize: 12, fontWeight: "800", color: colors.white },

  card: {
    width: 158,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.small,
  },
  imagem: { width: "100%", height: 100 },
  cardContent: { padding: spacing.md, gap: 6 },
  nome: { fontSize: 14, fontWeight: "700", color: colors.text },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  preco: { fontSize: 14, fontWeight: "800", color: colors.primaryText },
  promoTag: {
    backgroundColor: "rgba(255,196,0,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
  },
  promoTagText: { fontSize: 9, fontWeight: "800", color: colors.secondary },
  botoes: { flexDirection: "row", gap: 6, marginTop: 6 },
  editar: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 9,
    borderRadius: borderRadius.round,
    alignItems: "center",
    minHeight: 36,
  },
  excluir: {
    flex: 1,
    backgroundColor: "rgba(255,59,71,0.12)",
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 9,
    borderRadius: borderRadius.round,
    alignItems: "center",
    minHeight: 36,
  },
  textoBotao: { color: colors.white, fontWeight: "700", fontSize: 12 },

  emptyBotao: { marginTop: spacing.lg, paddingHorizontal: spacing.xxxl },
  novoBotao: { marginTop: spacing.sm },

  retryBox: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", padding: spacing.xl },
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.large,
  },
  modalTitle: { ...typography.h2, color: colors.white, marginBottom: spacing.sm, textAlign: "center" },
  modalSubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.md, lineHeight: 19 },
  label: { fontSize: 11, color: colors.textLight, marginBottom: spacing.sm, marginTop: spacing.md, fontWeight: "700", letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 15,
    backgroundColor: colors.input,
    color: colors.text,
    minHeight: 48,
  },
  modalHint: { fontSize: 12, color: colors.textLight, marginTop: spacing.lg, fontStyle: "italic", textAlign: "center" },
  modalSalvar: { marginTop: spacing.xl, marginBottom: spacing.sm },
});
