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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs, deleteDoc, doc, query, where, getDoc } from "firebase/firestore";
import { db, auth } from "../database/database";
import { colors, spacing, borderRadius, shadows, typography } from "../styles/theme";
import FoodImage from "../components/FoodImage";
import PrimaryButton from "../components/PrimaryButton";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import HeaderVendedor from "../components/HeaderVendedor";
import BottomNavigation from "../components/BottomNavigation";
import { ABAS_VENDEDOR } from "../navigation/tabs";

export default function PainelVendedor({ navigation }: any) {
  const [lanches, setLanches] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    return (
      <View style={styles.safeArea}>
        <HeaderVendedor navigation={navigation} tela="Meus lanches" />
        <LoadingState mensagem="Verificando permissão..." sub="Só um instante" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.safeArea}>
        <HeaderVendedor navigation={navigation} tela="Meus lanches" />
        <EmptyState icon="⚠️" titulo="Erro ao carregar lanches" descricao={error} />
        <View style={styles.retryBox}>
          <PrimaryButton title="Tentar novamente" onPress={buscarLanches} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <HeaderVendedor
        navigation={navigation}
        tela="Meus lanches"
        direita={{
          icone: "➕",
          rotulo: "Criar lanche",
          onPress: () => navigation.navigate("CriarLanche"),
        }}
      />

      <SafeAreaView style={styles.conteudo} edges={["left", "right", "bottom"]}>
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
      </SafeAreaView>

      {/* O painel não é uma aba: a barra serve só para sair daqui. */}
      <BottomNavigation
        abas={ABAS_VENDEDOR}
        ativa="PainelVendedor"
        onSelect={(key) => key !== "PainelVendedor" && navigation.navigate(key)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  conteudo: { flex: 1 },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },

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
});
