import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { CartContext } from "../services/CartContext";
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../database/database";
import StarRating from "../components/StarRating";
import { colors, spacing, borderRadius, shadows } from "../styles/theme";

export default function Produto({ route, navigation }: any) {
  const { produto } = route.params;
  const { adicionarAoCarrinho } = useContext(CartContext);
  const [quantidade, setQuantidade] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [mediaAvaliacao, setMediaAvaliacao] = useState(0);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(true);
  const [vendedorInfo, setVendedorInfo] = useState<any>(null);
  const [isFavorito, setIsFavorito] = useState(false);

  const precoAtual = produto.promocao && produto.precoPromocional ? produto.precoPromocional : produto.preco;
  const precoOriginal = produto.promocao ? produto.preco : null;
  const descontoPercentual = precoOriginal ? Math.round(((precoOriginal - precoAtual) / precoOriginal) * 100) : 0;

  useEffect(() => {
    verificarFavorito();
    buscarAvaliacoes();
    buscarVendedorInfo();
  }, []);

  async function verificarFavorito() {
    if (!auth.currentUser) return;
    const favoritoId = `${auth.currentUser.uid}_${produto.id}`;
    const favoritoRef = doc(db, "favoritos", favoritoId);
    const docSnap = await getDoc(favoritoRef);
    setIsFavorito(docSnap.exists());
  }

  async function buscarAvaliacoes() {
    try {
      const q = query(
        collection(db, "avaliacoes_produto"),
        where("produtoId", "==", produto.id),
        orderBy("criadoEm", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const lista: any[] = [];
      let soma = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        lista.push({ id: doc.id, ...data });
        soma += data.nota;
      });
      setAvaliacoes(lista);
      setMediaAvaliacao(lista.length > 0 ? soma / lista.length : 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingAvaliacoes(false);
    }
  }

  async function buscarVendedorInfo() {
    if (!produto.userId) return;
    try {
      const userDoc = await getDoc(doc(db, "usuarios", produto.userId));
      if (userDoc.exists()) setVendedorInfo(userDoc.data());
    } catch (error) {
      console.log(error);
    }
  }

  function incrementar() {
    const limiteEstoque = produto.quantidadeDisponivel || 999;
    if (quantidade >= limiteEstoque) {
      Alert.alert("Estoque insuficiente", `Apenas ${limiteEstoque} disponíveis`);
      return;
    }
    setQuantidade(quantidade + 1);
  }

  function decrementar() {
    if (quantidade > 1) setQuantidade(quantidade - 1);
  }

  function adicionarAoCarrinhoComQuantidade() {
    if (produto.disponivel === false) {
      Alert.alert("Indisponível", "Este lanche não está disponível no momento");
      return;
    }
    const quantidadeEstoque = produto.quantidadeDisponivel || 999;
    if (quantidade > quantidadeEstoque) {
      Alert.alert("Estoque insuficiente", `Apenas ${quantidadeEstoque} unidades disponíveis`);
      return;
    }
    for (let i = 0; i < quantidade; i++) {
      adicionarAoCarrinho({ ...produto, preco: precoAtual });
    }
    setShowModal(true);
    setTimeout(() => setShowModal(false), 1500);
  }

  async function toggleFavorito() {
    if (!auth.currentUser) {
      Alert.alert("Login necessário", "Faça login para favoritar");
      return;
    }
    const favoritoId = `${auth.currentUser.uid}_${produto.id}`;
    const favoritoRef = doc(db, "favoritos", favoritoId);
    if (isFavorito) {
      await deleteDoc(favoritoRef);
      setIsFavorito(false);
      Alert.alert("Removido", "Lanche removido dos favoritos");
    } else {
      await setDoc(favoritoRef, {
        usuarioId: auth.currentUser.uid,
        lancheId: produto.id,
        criadoEm: new Date()
      });
      setIsFavorito(true);
      Alert.alert("Favoritado", "Lanche adicionado aos favoritos");
    }
  }

  const estaDisponivel = produto.disponivel !== false && (produto.quantidadeDisponivel || 999) > 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: produto.imagem }} style={styles.imagem} />
          <View style={styles.imageOverlay} />

          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorito}>
            <Text style={styles.favoriteIcon}>{isFavorito ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>

          {produto.promocao && (
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>-{descontoPercentual}% OFF</Text>
            </View>
          )}

          <View style={styles.imageBottomInfo}>
            <Text style={styles.imagePrice}>R$ {precoAtual.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.headerInfo}>
            {produto.categoria && (
              <View style={[styles.categoriaBadge, { backgroundColor: getCorCategoria(produto.categoria) + "15" }]}>
                <Text style={[styles.categoriaText, { color: getCorCategoria(produto.categoria) }]}>
                  {getNomeCategoria(produto.categoria)}
                </Text>
              </View>
            )}
            <Text style={styles.nome}>{produto.nome}</Text>
          </View>

          <View style={styles.ratingSection}>
            <StarRating rating={mediaAvaliacao} readonly={true} />
            <Text style={styles.ratingText}>{mediaAvaliacao.toFixed(1)} ({avaliacoes.length} avaliações)</Text>
          </View>

          <View style={styles.priceSection}>
            {precoOriginal ? (
              <View style={styles.priceCard}>
                <View>
                  <Text style={styles.precoOriginal}>R$ {precoOriginal.toFixed(2)}</Text>
                  <Text style={styles.preco}>R$ {precoAtual.toFixed(2)}</Text>
                </View>
                <View style={styles.economiaBadge}>
                  <Text style={styles.economiaText}>Economize R$ {(precoOriginal - precoAtual).toFixed(2)}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.preco}>R$ {precoAtual.toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.statusSection}>
            {estaDisponivel ? (
              <View style={styles.disponivelCard}>
                <View style={styles.statusDot} />
                <View>
                  <Text style={styles.disponivelTitle}>Disponível agora</Text>
                  <Text style={styles.disponivelText}>
                    {produto.quantidadeDisponivel > 0 ? `${produto.quantidadeDisponivel} unidades em estoque` : "Estoque ilimitado"}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.indisponivelCard}>
                <View style={styles.statusDotIndisponivel} />
                <View>
                  <Text style={styles.indisponivelTitle}>Indisponível</Text>
                  <Text style={styles.indisponivelText}>Não disponível no momento</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Descrição</Text>
            <Text style={styles.descricao}>{produto.descricao}</Text>
          </View>

          {produto.ingredientes && produto.ingredientes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🥗 Ingredientes</Text>
              <View style={styles.ingredientesContainer}>
                {produto.ingredientes.map((ingrediente: string, index: number) => (
                  <View key={index} style={styles.ingredienteTag}>
                    <Text style={styles.ingredienteText}>{ingrediente}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ Informações</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Text style={styles.infoIcon}>⏱️</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tempo de preparo</Text>
                  <Text style={styles.infoValue}>{produto.tempoPreparo || "15-25"} min</Text>
                </View>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Text style={styles.infoIcon}>📍</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Retirada</Text>
                  <Text style={styles.infoValue}>Cantina do IFSul</Text>
                </View>
              </View>
              {vendedorInfo && (
                <>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Text style={styles.infoIcon}>👨‍🍳</Text>
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Vendedor</Text>
                      <Text style={styles.infoValue}>{vendedorInfo.nome || "Aluno IFSul"}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ Avaliações</Text>
            </View>
            {loadingAvaliacoes ? (
              <ActivityIndicator color={colors.primary} />
            ) : avaliacoes.length === 0 ? (
              <View style={styles.noReviewsContainer}>
                <Text style={styles.noReviewsIcon}>💬</Text>
                <Text style={styles.noReviews}>Ainda não há avaliações</Text>
              </View>
            ) : (
              avaliacoes.map((avaliacao, index) => (
                <View key={index} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUserContainer}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>👤</Text>
                      </View>
                      <Text style={styles.reviewUser}>Aluno #{avaliacao.compradorId?.slice(-6)}</Text>
                    </View>
                    <StarRating rating={avaliacao.nota} readonly={true} />
                  </View>
                  {avaliacao.comentario && <Text style={styles.reviewComment}>"{avaliacao.comentario}"</Text>}
                  <Text style={styles.reviewDate}>
                    {new Date(avaliacao.criadoEm?.toDate()).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {estaDisponivel && (
        <View style={styles.bottomBar}>
          <View style={styles.quantidadeContainer}>
            <TouchableOpacity style={styles.quantidadeButton} onPress={decrementar}>
              <Text style={styles.quantidadeButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantidade}>{quantidade}</Text>
            <TouchableOpacity style={styles.quantidadeButton} onPress={incrementar}>
              <Text style={styles.quantidadeButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.botaoComprar} onPress={adicionarAoCarrinhoComQuantidade} activeOpacity={0.8}>
            <Text style={styles.botaoComprarTexto}>Adicionar • R$ {(precoAtual * quantidade).toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal transparent={true} visible={showModal} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>✅</Text>
            </View>
            <Text style={styles.modalText}>Adicionado ao carrinho!</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getCorCategoria(categoria: string): string {
  const cores: Record<string, string> = { lanche: "#FF6B6B", bebida: "#4ECDC4", doce: "#FFE66D", promocao: "#FF6B6B" };
  return cores[categoria] || "#FF6B6B";
}
function getNomeCategoria(categoria: string): string {
  const nomes: Record<string, string> = { lanche: "🍔 Lanche", bebida: "🥤 Bebida", doce: "🍰 Doce", promocao: "🎉 Promoção" };
  return nomes[categoria] || "📦 Produto";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 100 },
  imageContainer: { position: "relative", height: 320, backgroundColor: colors.card },
  imagem: { width: "100%", height: "100%", resizeMode: "cover" },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "transparent",
  },
  favoriteButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIcon: { fontSize: 20 },
  promoBadge: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  promoBadgeText: { color: colors.white, fontWeight: "bold", fontSize: 14 },
  imageBottomInfo: {
    position: "absolute",
    bottom: 16,
    left: 20,
  },
  imagePrice: { fontSize: 28, fontWeight: "bold", color: colors.white, textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  content: { padding: spacing.xl },
  headerInfo: { marginBottom: spacing.md },
  categoriaBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  categoriaText: { fontSize: 12, fontWeight: "600" },
  nome: { fontSize: 26, fontWeight: "bold", color: colors.text },
  ratingSection: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  ratingText: { marginLeft: 8, fontSize: 14, color: colors.textSecondary },
  priceSection: { marginBottom: spacing.lg },
  priceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primary + "08",
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  precoOriginal: { fontSize: 14, color: colors.textLight, textDecorationLine: "line-through" },
  preco: { fontSize: 30, fontWeight: "bold", color: colors.primary },
  economiaBadge: {
    backgroundColor: colors.success + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  economiaText: { fontSize: 12, color: colors.success, fontWeight: "600" },
  statusSection: { marginBottom: spacing.xl },
  disponivelCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success + "10",
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success, marginRight: 12 },
  disponivelTitle: { fontSize: 14, fontWeight: "bold", color: colors.success },
  disponivelText: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  indisponivelCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.danger + "10",
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  statusDotIndisponivel: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger, marginRight: 12 },
  indisponivelTitle: { fontSize: 14, fontWeight: "bold", color: colors.danger },
  indisponivelText: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: colors.text, marginBottom: spacing.md },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  descricao: { fontSize: 15, color: colors.textSecondary, lineHeight: 23 },
  ingredientesContainer: { flexDirection: "row", flexWrap: "wrap" },
  ingredienteTag: {
    backgroundColor: colors.primary + "10",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  ingredienteText: { fontSize: 13, color: colors.primary, fontWeight: "500" },
  infoCard: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, ...shadows.small },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoIcon: { fontSize: 18 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: colors.textLight, marginBottom: 2 },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: "500" },
  infoDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  noReviewsContainer: { alignItems: "center", paddingVertical: 30 },
  noReviewsIcon: { fontSize: 40, marginBottom: spacing.sm },
  noReviews: { textAlign: "center", color: colors.textLight, fontSize: 14 },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  reviewUserContainer: { flexDirection: "row", alignItems: "center" },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  reviewAvatarText: { fontSize: 14 },
  reviewUser: { fontSize: 14, fontWeight: "500", color: colors.text },
  reviewComment: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm, fontStyle: "italic", lineHeight: 20 },
  reviewDate: { fontSize: 11, color: colors.textLight },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 30 : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.medium,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  quantidadeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  quantidadeButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  quantidadeButtonText: { fontSize: 22, fontWeight: "bold", color: colors.primary },
  quantidade: { fontSize: 20, fontWeight: "bold", marginHorizontal: spacing.lg, color: colors.text },
  botaoComprar: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginLeft: spacing.md,
    ...shadows.medium,
  },
  botaoComprarTexto: { color: colors.white, fontSize: 17, fontWeight: "bold" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: {
    backgroundColor: colors.white,
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    ...shadows.large,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.success + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalIcon: { fontSize: 36 },
  modalText: { fontSize: 16, fontWeight: "bold", color: colors.text },
});
