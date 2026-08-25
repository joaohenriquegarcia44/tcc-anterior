import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Image,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { auth } from "../database/database";
import { useHomeLogic } from "../hooks/useHomeLogic";
import { colors, spacing, borderRadius, shadows } from "../styles/theme";

export default function Home({ navigation }: any) {
  const {
    filteredLanches,
    promocoes,
    lanchesFavoritos,
    loading,
    searchText,
    setSearchText,
    categoriaSelecionada,
    firebaseError,
    categorias,
    filtrarPorCategoria,
    onRefresh,
    refreshing,
    getCategoriaIcon,
  } = useHomeLogic(navigation);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando delícias...</Text>
      </View>
    );
  }

  if (firebaseError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 60, marginBottom: 20 }}>⚠️</Text>
        <Text style={styles.errorText}>Erro de conexão</Text>
        <Text style={styles.errorSubtext}>{firebaseError}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerContent}>
              <Text style={styles.greeting}>Olá! 👋</Text>
              <Text style={styles.welcomeText}>
                {auth.currentUser?.displayName?.split('@')[0] || auth.currentUser?.email?.split('@')[0] || "Aluno"}
              </Text>
              <Text style={styles.subtitle}>O que você quer comer hoje?</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Perfil")} style={styles.profileButton}>
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar lanches..."
              placeholderTextColor={colors.textLight}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasContainer}>
            {categorias.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoriaItem} onPress={() => filtrarPorCategoria(cat.id)}>
                <View style={[
                  styles.categoriaIcon,
                  { backgroundColor: cat.cor + "15" },
                  categoriaSelecionada === cat.id && { backgroundColor: cat.cor, borderColor: cat.cor, borderWidth: 2 },
                ]}>
                  <Text style={[styles.categoriaIconText, categoriaSelecionada === cat.id && { transform: [{ scale: 1.1 }] }]}>{cat.icon}</Text>
                </View>
                <Text style={[styles.categoriaNome, categoriaSelecionada === cat.id && { color: cat.cor, fontWeight: "bold" }]}>
                  {cat.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {lanchesFavoritos.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>❤️ Seus Favoritos</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoScroll}>
                {lanchesFavoritos.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.promoCard}
                    onPress={() => navigation.navigate("Produto", { produto: item })}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.imagem }} style={styles.promoImage} />
                    <View style={styles.promoOverlay}>
                      <Text style={styles.promoNome} numberOfLines={2}>{item.nome}</Text>
                      <Text style={styles.promoPrice}>R$ {item.preco.toFixed(2)}</Text>
                      <View style={styles.timeBadge}>
                        <Text style={styles.timeText}>⏱️ {item.tempoPreparo || "15-25"} min</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {categoriaSelecionada === "todos" && promocoes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🎯 Promoções Especiais</Text>
                <TouchableOpacity onPress={() => filtrarPorCategoria("promocao")}>
                  <Text style={styles.seeMore}>Ver todos →</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoScroll}>
                {promocoes.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.promoCard}
                    onPress={() => navigation.navigate("Produto", { produto: item })}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.imagem }} style={styles.promoImage} />
                    <View style={styles.promoBadge}>
                      <Text style={styles.promoBadgeText}>🔥 OFF</Text>
                    </View>
                    <View style={styles.promoOverlay}>
                      <Text style={styles.promoNome} numberOfLines={2}>{item.nome}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.oldPrice}>R$ {item.preco.toFixed(2)}</Text>
                        <Text style={styles.promoPrice}>R$ {(item.precoPromocional || item.preco).toFixed(2)}</Text>
                      </View>
                      <View style={styles.timeBadge}>
                        <Text style={styles.timeText}>⏱️ {item.tempoPreparo || "15-25"} min</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {categoriaSelecionada === "todos" && "🍔 Todos os Lanches"}
                {categoriaSelecionada === "lanche" && "🍔 Salgados"}
                {categoriaSelecionada === "bebida" && "🥤 Bebidas"}
                {categoriaSelecionada === "doce" && "🍰 Doces"}
                {categoriaSelecionada === "promocao" && "🎉 Em Promoção"}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.resultCount}>{filteredLanches.length}</Text>
              </View>
            </View>

            {filteredLanches.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🍔</Text>
                <Text style={styles.emptyText}>Nenhum lanche encontrado</Text>
                <Text style={styles.emptySubtext}>Tente outra categoria</Text>
              </View>
            ) : (
              filteredLanches.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.lancheCard}
                  onPress={() => navigation.navigate("Produto", { produto: item })}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: item.imagem }} style={styles.lancheImage} />
                  <View style={styles.lancheInfo}>
                    <Text style={styles.lancheNome}>{item.nome}</Text>
                    <Text style={styles.lancheDescricao} numberOfLines={2}>{item.descricao}</Text>

                    <View style={styles.lancheMeta}>
                      <View style={styles.categoriaBadge}>
                        <Text style={styles.categoriaBadgeText}>
                          {item.categorias ? item.categorias.map((c: string) => getCategoriaIcon(c)).join(' ') : (item.categoria === "lanche" ? "🍔" : item.categoria === "bebida" ? "🥤" : "🍰")}
                        </Text>
                      </View>
                      <View style={styles.ratingContainer}>
                        <Text style={styles.rating}>⭐ {(item.mediaAvaliacao || 0).toFixed(1)}</Text>
                        <Text style={styles.ratingCount}>({item.totalAvaliacoes || 0})</Text>
                      </View>
                    </View>

                    <View style={styles.priceRow}>
                      {item.promocao ? (
                        <>
                          <Text style={styles.oldPrice}>R$ {item.preco.toFixed(2)}</Text>
                          <Text style={styles.lanchePreco}>R$ {(item.precoPromocional || item.preco).toFixed(2)}</Text>
                        </>
                      ) : (
                        <Text style={styles.lanchePreco}>R$ {item.preco.toFixed(2)}</Text>
                      )}
                    </View>
                    <Text style={styles.deliveryTime}>⏱️ Pronto em {item.tempoPreparo || "15-25"} min</Text>
                  </View>
                  {item.promocao && (
                    <View style={styles.promoBadgeCard}>
                      <Text style={styles.promoBadgeTextCard}>OFF</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
            <View style={[styles.navIconContainer, styles.navActiveBg]}>
              <Text style={[styles.navIcon, styles.navActive]}>🏠</Text>
            </View>
            <Text style={[styles.navText, styles.navActiveText]}>Início</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Carrinho")}>
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>🛒</Text>
            </View>
            <Text style={styles.navText}>Carrinho</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("MeusPedidos")}>
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>📋</Text>
            </View>
            <Text style={styles.navText}>Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Perfil")}>
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>👤</Text>
            </View>
            <Text style={styles.navText}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  loadingText: { marginTop: spacing.md, color: colors.primary, fontSize: 16, fontWeight: "500" },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  headerContent: { flex: 1 },
  greeting: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: spacing.xs },
  welcomeText: { fontSize: 26, fontWeight: "bold", color: colors.white, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.md,
  },
  profileIcon: { fontSize: 24 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    height: 48,
    ...shadows.small,
  },
  searchIcon: { fontSize: 18, color: colors.textLight, marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  scrollContent: { paddingBottom: 100 },
  categoriasContainer: { paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md },
  categoriaItem: { alignItems: "center", marginRight: spacing.lg },
  categoriaIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categoriaIconText: { fontSize: 30 },
  categoriaNome: { fontSize: 11, color: colors.textSecondary },
  section: { marginBottom: spacing.xl },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
  countBadge: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultCount: { fontSize: 12, color: colors.primary, fontWeight: "bold" },
  seeMore: { color: colors.primary, fontSize: 14, fontWeight: "600" },
  promoScroll: { paddingLeft: spacing.xl, paddingRight: spacing.sm },
  promoCard: {
    backgroundColor: colors.card,
    width: 180,
    marginRight: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.medium,
  },
  promoImage: { width: "100%", height: 130, resizeMode: "cover" },
  promoOverlay: { padding: spacing.md },
  promoNome: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: spacing.xs },
  priceRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  oldPrice: { fontSize: 12, color: colors.textLight, textDecorationLine: "line-through" },
  promoPrice: { fontSize: 16, fontWeight: "bold", color: colors.primary },
  timeBadge: {
    backgroundColor: colors.secondary + "15",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  timeText: { fontSize: 10, color: colors.secondary, fontWeight: "600" },
  lancheCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    position: "relative",
    ...shadows.medium,
  },
  lancheImage: { width: 105, height: 105, borderRadius: borderRadius.lg },
  lancheInfo: { flex: 1, marginLeft: spacing.md },
  lancheNome: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: spacing.xs },
  lancheDescricao: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 17 },
  lancheMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  categoriaBadge: {
    backgroundColor: colors.primary + "10",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoriaBadgeText: { fontSize: 11, color: colors.primary, fontWeight: "500" },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 12, fontWeight: "bold", color: colors.warning, marginRight: spacing.xs },
  ratingCount: { fontSize: 11, color: colors.textLight },
  lanchePreco: { fontSize: 17, fontWeight: "bold", color: colors.primary },
  deliveryTime: { fontSize: 11, color: colors.secondary, fontWeight: "500" },
  promoBadgeCard: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  promoBadgeTextCard: { color: colors.white, fontSize: 10, fontWeight: "bold" },
  promoBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1,
  },
  promoBadgeText: { color: colors.white, fontSize: 10, fontWeight: "bold" },
  errorText: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 10, textAlign: "center", paddingHorizontal: 20 },
  errorSubtext: { fontSize: 14, color: colors.textLight, textAlign: "center", paddingHorizontal: 20 },
  emptyContainer: { alignItems: "center", paddingVertical: 50 },
  emptyIcon: { fontSize: 60, marginBottom: spacing.md },
  emptyText: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: spacing.xs },
  emptySubtext: { fontSize: 12, color: colors.textLight },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === "ios" ? 24 : spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.medium,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  navIconContainer: {
    width: 40,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  navActiveBg: { backgroundColor: colors.primary + "15" },
  navIcon: { fontSize: 20, color: colors.textLight },
  navText: { fontSize: 10, color: colors.textLight },
  navActive: { color: colors.primary },
  navActiveText: { color: colors.primary, fontWeight: "600" },
});
