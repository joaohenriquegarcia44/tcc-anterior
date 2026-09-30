import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHomeLogic } from "../hooks/useHomeLogic";
import { CartContext } from "../services/CartContext";
import { colors, spacing, borderRadius, shadows, typography } from "../styles/theme";
import SearchBar from "../components/SearchBar";
import CategoryButton from "../components/CategoryButton";
import ProductCard from "../components/ProductCard";
import BottomNavigation from "../components/BottomNavigation";
import CircleActionButton from "../components/CircleActionButton";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ComboCard from "../components/ComboCard";
import ComboBuilder from "../components/ComboBuilder";
import { abasDoApp } from "../navigation/tabs";
import { useEhVendedor } from "../hooks/useEhVendedor";

/**
 * Cardápio completo da lancheria.
 * Reaproveita `useHomeLogic` — mesma fonte de dados (Firestore) e mesmos filtros.
 */
export default function Cardapio({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const ehVendedor = useEhVendedor();
  const { width } = useWindowDimensions();
  const { totalItens } = useContext(CartContext);
  const [comboAberto, setComboAberto] = useState(false);
  const {
    lanches,
    filteredLanches,
    loading,
    searchText,
    setSearchText,
    categoriaSelecionada,
    firebaseError,
    categorias,
    filtrarPorCategoria,
    onRefresh,
    refreshing,
  } = useHomeLogic(navigation);

  const cardLargura = Math.min(320, (width - spacing.xl * 2 - spacing.md) / 2);

  if (loading) {
    return <LoadingState mensagem="Montando o cardápio..." sub="Só um instante" />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextos}>
              <Text style={styles.titulo}>Cardápio</Text>
              <Text style={styles.subtitulo}>Retirada no IF · sem taxa de entrega</Text>
            </View>
            {/* Vendedor não compra: o carrinho some para ele. */}
            {!ehVendedor && (
              <CircleActionButton
                icon="🛒"
                titulo="Abrir carrinho"
                onPress={() => navigation.navigate("Carrinho")}
                tamanho={44}
                badge={totalItens}
              />
            )}
          </View>

          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar por nome ou sabor..."
            style={styles.busca}
          />
        </View>

        {/* MONTE SEU COMBO */}
        {lanches.length > 0 && (
          <View style={styles.bloco}>
            <ComboCard lanches={lanches} onPress={() => setComboAberto(true)} />
          </View>
        )}

        <View style={styles.categorias}>
          <CategoryButton
            categorias={categorias}
            selecionada={categoriaSelecionada}
            onSelect={filtrarPorCategoria}
          />
        </View>

        {firebaseError && (
          <View style={styles.aviso}>
            <Text style={styles.avisoTexto}>⚠️ {firebaseError}</Text>
          </View>
        )}

        {filteredLanches.length === 0 ? (
          <EmptyState
            icon="🍽️"
            titulo="Nada por aqui"
            descricao={
              searchText.trim()
                ? `Não encontramos lanches para "${searchText.trim()}". Tente outro termo.`
                : "Ainda não temos itens nesta categoria. Volte em breve!"
            }
          />
        ) : (
          <View style={styles.grade}>
            {filteredLanches.map((item) => (
              <View key={item.id} style={{ width: cardLargura }}>
                <ProductCard
                  produto={item}
                  onPress={() => navigation.navigate("Produto", { produto: item })}
                />
              </View>
            ))}
          </View>
        )}

        {filteredLanches.length > 0 && (
          <TouchableOpacity style={styles.fim} onPress={() => filtrarPorCategoria("todos")} activeOpacity={0.8}>
            <Text style={styles.fimTexto}>Ver cardápio completo</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomNavigation
        abas={abasDoApp(ehVendedor)}
        ativa="Cardapio"
        onSelect={(key) => navigation.navigate(key)}
      />

      <ComboBuilder
        visivel={comboAberto}
        onFechar={() => setComboAberto(false)}
        lanches={lanches}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxl },

  header: { paddingHorizontal: spacing.xl },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerTextos: { flex: 1 },
  titulo: { ...typography.h1 },
  subtitulo: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  busca: { marginTop: spacing.lg },

  bloco: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },

  categorias: { marginTop: spacing.lg },

  aviso: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,59,71,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,71,0.35)',
  },
  avisoTexto: { color: colors.danger, fontSize: 12 },

  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    justifyContent: "space-between",
  },

  fim: {
    alignSelf: "center",
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    ...shadows.small,
  },
  fimTexto: { color: colors.textSecondary, fontSize: 13, fontWeight: "700" },
});
