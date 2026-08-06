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
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>
              Olá, {auth.currentUser?.displayName?.split('@')[0] || auth.currentUser?.email?.split('@')[0] || "Aluno"}!
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasContainer}>
            {categorias.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoriaItem} onPress={() => filtrarPorCategoria(cat.id)}>
                <View style={[
                  styles.categoriaIcon,
                  { backgroundColor: cat.cor + "20" },
                  categoriaSelecionada === cat.id && { backgroundColor: cat.cor + "30", borderColor: cat.cor, borderWidth: 2 },
                ]}>
                  <Text style={styles.categoriaIconText}>{cat.icon}</Text>
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {lanchesFavoritos.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.promoCard}
                    onPress={() => navigation.navigate("Produto", { produto: item })}
                  >
                    <Image source={{ uri: item.imagem }} style={styles.promoImage} />
                    <Text style={styles.promoNome} numberOfLines={2}>{item.nome}</Text>
                    <Text style={styles.promoPrice}>R$ {item.preco.toFixed(2)}</Text>
                    <Text style={styles.deliveryTime}>Pronto em {item.tempoPreparo || "15-25"} min</Text>
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
                  <Text style={styles.seeMore}>Ver todos</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {promocoes.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.promoCard}
                    onPress={() => navigation.navigate("Produto", { produto: item })}
                  >
                    <Image source={{ uri: item.imagem }} style={styles.promoImage} />
                    <Text style={styles.promoNome} numberOfLines={2}>{item.nome}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.oldPrice}>R$ {item.preco.toFixed(2)}</Text>
                      <Text style={styles.promoPrice}>R$ {(item.precoPromocional || item.preco).toFixed(2)}</Text>
                    </View>
                    <Text style={styles.deliveryTime}>Pronto em {item.tempoPreparo || "15-25"} min</Text>
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
              <Text style={styles.resultCount}>{filteredLanches.length} itens</Text>
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
                >
                  <Image source={{ uri: item.imagem }} style={styles.lancheImage} />
                  <View style={styles.lancheInfo}>
                    <Text style={styles.lancheNome}>{item.nome}</Text>
                    <Text style={styles.lancheDescricao} numberOfLines={2}>{item.descricao}</Text>

                    <View style={styles.categoriaBadge}>
                      <Text style={styles.categoriaBadgeText}>
                        {item.categorias ? item.categorias.map((c: string) => getCategoriaIcon(c)).join(' | ') : (item.categoria === "lanche" ? "🍔 Salgado" : item.categoria === "bebida" ? "🥤 Bebida" : "🍰 Doce")}
                      </Text>
                    </View>

                    <View style={styles.ratingContainer}>
                      <Text style={styles.rating}>
                        ⭐ {(item.mediaAvaliacao || 0).toFixed(1)}
                      </Text>
                      <Text style={styles.ratingCount}>
                        ({item.totalAvaliacoes || 0} {item.totalAvaliacoes === 1 ? "avaliação" : "avaliações"})
                      </Text>
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
                    <View style={styles.promoBadge}>
                      <Text style={styles.promoBadgeText}>🔥 OFF</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
            <Text style={[styles.navIcon, styles.navActive]}>🏠</Text>
            <Text style={[styles.navText, styles.navActiveText]}>Início</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Carrinho")}>
            <Text style={styles.navIcon}>🛒</Text>
            <Text style={styles.navText}>Carrinho</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("MeusPedidos")}>
            <Text style={styles.navIcon}>📋</Text>
            <Text style={styles.navText}>Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Perfil")}>
            <Text style={styles.navIcon}>👤</Text>
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
  loadingText: { marginTop: spacing.md, color: colors.primary, fontSize: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
    paddingTop: 50,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: { flex: 1 },
  welcomeText: { fontSize: 24, fontWeight: "bold", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textLight, marginTop: spacing.xs },
  profileButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: colors.button + "20", justifyContent: "center", alignItems: "center" },
  profileIcon: { fontSize: 24 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    margin: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    ...shadows.small,
  },
  searchIcon: { fontSize: 18, color: colors.textLight, marginRight: spacing.sm },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: 16, color: colors.text },
  categoriasContainer: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  categoriaItem: { alignItems: "center", marginRight: 20 },
  categoriaIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categoriaIconText: { fontSize: 30 },
  categoriaNome: { fontSize: 12, color: colors.textSecondary },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
  resultCount: { fontSize: 12, color: colors.textLight },
  seeMore: { color: colors.primary, fontSize: 14, fontWeight: "600" },
  promoCard: {
    backgroundColor: colors.card,
    width: 180,
    marginLeft: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  promoImage: { width: "100%", height: 120, borderRadius: borderRadius.sm, marginBottom: spacing.sm },
  promoNome: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: spacing.xs },
  priceContainer: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  oldPrice: { fontSize: 12, color: colors.textLight, textDecorationLine: "line-through" },
  promoPrice: { fontSize: 16, fontWeight: "bold", color: colors.primary },
  deliveryTime: { fontSize: 11, color: colors.secondary, fontWeight: "500" },
  lancheCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    position: "relative",
    ...shadows.medium,
  },
  lancheImage: { width: 100, height: 100, borderRadius: borderRadius.sm },
  lancheInfo: { flex: 1, marginLeft: spacing.md },
  lancheNome: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: spacing.xs },
  lancheDescricao: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm },
  categoriaBadge: { backgroundColor: colors.background, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 10, alignSelf: "flex-start", marginBottom: spacing.sm },
  categoriaBadgeText: { fontSize: 10, color: colors.textSecondary },
  ratingContainer: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  rating: { fontSize: 12, fontWeight: "bold", color: colors.warning, marginRight: spacing.xs },
  ratingCount: { fontSize: 11, color: colors.textLight },
  priceRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  lanchePreco: { fontSize: 16, fontWeight: "bold", color: colors.primary },
  promoBadge: { position: "absolute", top: 10, right: 10, backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.lg },
  promoBadgeText: { color: colors.white, fontSize: 10, fontWeight: "bold" },
  errorText: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 10, textAlign: "center", paddingHorizontal: 20 },
  errorSubtext: { fontSize: 14, color: colors.textLight, textAlign: "center", paddingHorizontal: 20 },
  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 60, marginBottom: spacing.md },
  emptyText: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: spacing.xs },
  emptySubtext: { fontSize: 12, color: colors.textLight },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.small,
  },
  navItem: { flex: 1, alignItems: "center" },
  navIcon: { fontSize: 24, color: colors.textLight },
  navText: { fontSize: 12, color: colors.textLight, marginTop: spacing.xs },
  navActive: { color: colors.primary },
  navActiveText: { color: colors.primary, fontWeight: "600" },
});
