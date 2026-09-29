import React, { useContext, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { auth } from "../database/database";
import { useHomeLogic } from "../hooks/useHomeLogic";
import { CartContext } from "../services/CartContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, borderRadius, typography } from "../styles/theme";
import SearchBar from "../components/SearchBar";
import CategoryButton from "../components/CategoryButton";
import Banner from "../components/Banner";
import ProductCard from "../components/ProductCard";
import BottomNavigation from "../components/BottomNavigation";
import CircleActionButton from "../components/CircleActionButton";
import MoodSelector from "../components/MoodSelector";
import Top5Semana from "../components/Top5Semana";
import ComboCard from "../components/ComboCard";
import ComboBuilder from "../components/ComboBuilder";
import QuaseFavoritos from "../components/QuaseFavoritos";
import StatusCard from "../components/StatusCard";
import IntervaloCard from "../components/IntervaloCard";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import { useStatusLancheriaLogic } from "../hooks/useStatusLancheriaLogic";
import { useRankingSemanaLogic } from "../hooks/useRankingSemanaLogic";
import { useRecomendacoesLogic } from "../hooks/useRecomendacoesLogic";
import { ABAS_PRINCIPAIS } from "../navigation/tabs";

/** Foto de hambúrguer usada como fundo do convite "Ver cardápio". */
const FOTO_CARDAPIO = require("../../assets/burger-hero.jpg");

export default function Home({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const { totalItens, adicionarAoCarrinho } = useContext(CartContext);
  const {
    lanches,
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
  } = useHomeLogic(navigation);

  const status = useStatusLancheriaLogic(lanches);
  const [comboAberto, setComboAberto] = useState(false);

  const { top5, rankingParcial } = useRankingSemanaLogic(lanches);
  const idsFavoritos = useMemo(() => lanchesFavoritos.map((f: any) => f.id), [lanchesFavoritos]);
  const { itens: quaseFavoritos, motivo } = useRecomendacoesLogic(lanches, idsFavoritos);

  const primeiroNome =
    auth.currentUser?.displayName?.split(" ")[0] ||
    auth.currentUser?.email?.split("@")[0] ||
    "Aluno";

  // A foto do banner vem de um lanche real do Firestore; se ainda não houver
  // nenhum publicado, cai na foto de hambúrguer que vem com o app.
  const imagemBanner = promocoes[0]?.imagem || filteredLanches[0]?.imagem || FOTO_CARDAPIO;

  const cardLargura = Math.min(300, (width - spacing.xl * 2 - spacing.md) / 2);

  /** Atalho do MoodSelector: filtra e rola até a lista de lanches. */
  function escolherHumor(categoriaId: string) {
    filtrarPorCategoria(categoriaId);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }

  if (loading) {
    return <LoadingState mensagem="Carregando delícias..." sub="Buscando o cardápio de hoje" />;
  }

  if (firebaseError) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="📡"
          titulo="Sem conexão com o cardápio"
          descricao={
            firebaseError ||
            "Não conseguimos falar com o banco de dados agora. Puxe para baixo para tentar de novo."
          }
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollRef}
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
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextos}>
              <Text style={styles.saudacao}>Olá, {primeiroNome}! 👋</Text>
              <Text style={styles.subtitulo}>O que você quer comer hoje?</Text>
            </View>

            <View style={styles.headerAcoes}>
              <CircleActionButton
                icon="🛒"
                titulo="Abrir carrinho"
                onPress={() => navigation.navigate("Carrinho")}
                tamanho={44}
                badge={totalItens}
              />
              <TouchableOpacity
                onPress={() => navigation.navigate("Perfil")}
                style={styles.perfilBotao}
                accessibilityLabel="Abrir perfil"
              >
                <Text style={styles.perfilIcone}>👤</Text>
              </TouchableOpacity>
            </View>
          </View>

          <SearchBar value={searchText} onChangeText={setSearchText} style={styles.busca} />
        </View>

        {/* 1 · COMO TÁ SEU DIA? */}
        <View style={styles.bloco}>
          <MoodSelector
            onSelect={escolherHumor}
            selecionada={["lanche", "bebida", "doce"].includes(categoriaSelecionada) ? categoriaSelecionada : undefined}
          />
        </View>

        {/* 2 + 3 · STATUS DA LANCHERIA E PRÓXIMO INTERVALO */}
        <View style={styles.cardsRow}>
          <StatusCard disponiveis={status.disponiveis} preparoMin={status.preparoMin} />
          <IntervaloCard />
        </View>

        {/* BANNER */}
        <View style={styles.bloco}>
          <Banner
            imagem={imagemBanner}
            titulo={"LANCHES DE VERDADE\nPARA O SEU DIA!"}
            subtitulo="Retirada rápida no IF · Sem taxa de entrega"
            cta="Ver cardápio"
            onCta={() => navigation.navigate("Cardapio")}
          />
        </View>

        {/* CATEGORIAS */}
        <View style={styles.categoriasBloco}>
          <CategoryButton
            categorias={categorias}
            selecionada={categoriaSelecionada}
            onSelect={filtrarPorCategoria}
          />
        </View>

        {/* 4 · TOP 5 DA SEMANA */}
        {top5.length > 0 && categoriaSelecionada === "todos" && searchText.trim() === "" && (
          <View style={styles.secao}>
            <Top5Semana
              itens={top5}
              parcial={rankingParcial}
              onPressItem={(item: any) =>
                navigation.navigate("Produto", { produto: lanches.find((l: any) => l.id === item.id) || item })
              }
              onVerTodos={() => navigation.navigate("Cardapio")}
            />
          </View>
        )}

        {/* 5 · MONTE SEU COMBO */}
        {categoriaSelecionada === "todos" && searchText.trim() === "" && lanches.length > 0 && (
          <View style={styles.secao}>
            <ComboCard onPress={() => setComboAberto(true)} />
          </View>
        )}

        {/* FAVORITOS */}
        {lanchesFavoritos.length > 0 && (
          <View style={styles.secao}>
            <View style={styles.secaoHeader}>
              <Text style={styles.secaoTitulo}>❤️ Seus favoritos</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carrossel}
            >
              {lanchesFavoritos.map((item) => (
                <ProductCard
                  key={item.id}
                  produto={item}
                  largura={cardLargura}
                  onPress={() => navigation.navigate("Produto", { produto: item })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* PROMOÇÕES */}
        {categoriaSelecionada === "todos" && promocoes.length > 0 && (
          <View style={styles.secao}>
            <View style={styles.secaoHeader}>
              <Text style={styles.secaoTitulo}>🔥 Promoções especiais</Text>
              <TouchableOpacity onPress={() => filtrarPorCategoria("promocao")} hitSlop={8}>
                <Text style={styles.verTodos}>Ver todos →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carrossel}
            >
              {promocoes.map((item) => (
                <ProductCard
                  key={item.id}
                  produto={item}
                  largura={cardLargura}
                  onPress={() => navigation.navigate("Produto", { produto: item })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 6 · QUASE NOS SEUS FAVORITOS */}
        {quaseFavoritos.length > 0 && categoriaSelecionada === "todos" && searchText.trim() === "" && (
          <View style={styles.secao}>
            <QuaseFavoritos
              itens={quaseFavoritos}
              motivo={motivo}
              largura={cardLargura}
              onPressItem={(item: any) => navigation.navigate("Produto", { produto: item })}
              onAdd={(item: any) => adicionarAoCarrinho(item)}
            />
          </View>
        )}

        {/* TODOS OS LANCHES */}
        <View style={styles.secao}>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>
              {categorias.find((c) => c.id === categoriaSelecionada)?.nome || "Todos os lanches"}
            </Text>
            <View style={styles.contador}>
              <Text style={styles.contadorTexto}>{filteredLanches.length}</Text>
            </View>
          </View>

          {filteredLanches.length === 0 ? (
            <EmptyState
              icon="🍽️"
              titulo="Nenhum lanche por aqui"
              descricao="Ainda não temos itens nesta categoria. Tente outra ou volte mais tarde!"
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
        </View>
      </ScrollView>

      <BottomNavigation
        abas={ABAS_PRINCIPAIS}
        ativa="Home"
        onSelect={(key) => navigation.navigate(key)}
      />

      <ComboBuilder
        visivel={comboAberto}
        onFechar={() => setComboAberto(false)}
        lanches={lanches}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxl },

  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerTextos: { flex: 1 },
  saudacao: { ...typography.h2, fontSize: 23 },
  subtitulo: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  headerAcoes: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  perfilBotao: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  perfilIcone: { fontSize: 20 },

  busca: { marginTop: spacing.lg },

  bloco: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  cardsRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  categoriasBloco: { marginTop: spacing.lg },

  secao: { marginTop: spacing.xxl },
  secaoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  secaoTitulo: { ...typography.h3, fontSize: 17 },
  verTodos: { color: colors.primaryText, fontSize: 13, fontWeight: "700" },
  contador: {
    backgroundColor: colors.glowSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
  },
  contadorTexto: { fontSize: 11, color: colors.primaryText, fontWeight: "800" },

  carrossel: { paddingHorizontal: spacing.xl, gap: spacing.md },

  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    justifyContent: "space-between",
  },
});
