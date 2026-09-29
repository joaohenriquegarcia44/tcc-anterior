import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFidelidadeLogic } from "../hooks/useFidelidadeLogic";
import { colors, spacing, borderRadius, shadows, typography } from "../styles/theme";
import LoyaltyCard from "../components/LoyaltyCard";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";

/**
 * Fidelidade em modo somente leitura.
 * Os pontos exibidos vêm de `usuarios/{uid}.pontos`; nenhuma regra é aplicada aqui.
 */
export default function Fidelidade() {
  const { pontos, loading, erro } = useFidelidadeLogic();

  if (loading) {
    return <LoadingState mensagem="Contando seus pontos..." sub="Quase lá" />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LoyaltyCard pontos={pontos} />

        {erro && (
          <View style={styles.aviso}>
            <Text style={styles.avisoTexto}>⚠️ {erro}</Text>
          </View>
        )}

        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Como funciona</Text>

          {[
            { icon: "🛒", titulo: "Você faz o pedido", texto: "Compre normalmente pelo app. A retirada é sempre no IF, sem taxa de entrega." },
            { icon: "⭐", titulo: "Você acumula pontos", texto: "Cada R$ 5 em pedidos gera 1 ponto no seu perfil." },
            { icon: "🎁", titulo: "Você usa no checkout", texto: "Ao confirmar o pedido você pode aplicar seus pontos como desconto, direto na tela de confirmação." },
            { icon: "👑", titulo: "Você é destaque", texto: "Quanto mais pontos, maior a sua faixa e o destaque no cardápio." },
          ].map((item) => (
            <View key={item.titulo} style={styles.regra}>
              <View style={styles.regraIcone}>
                <Text style={styles.regraIconeTexto}>{item.icon}</Text>
              </View>
              <View style={styles.regraTextos}>
                <Text style={styles.regraTitulo}>{item.titulo}</Text>
                <Text style={styles.regraDescricao}>{item.texto}</Text>
              </View>
            </View>
          ))}
        </View>

        {pontos === 0 && (
          <EmptyState
            icon="⭐"
            titulo="Você ainda não tem pontos"
            descricao="Faça seu primeiro pedido e comece a acumular pontos automaticamente."
          />
        )}

        <Text style={styles.rodape}>
          Os pontos são creditados automaticamente após a confirmação do pedido.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },

  aviso: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(255,59,71,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,59,71,0.35)",
  },
  avisoTexto: { color: colors.danger, fontSize: 12 },

  cartao: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.small,
  },
  cartaoTitulo: { ...typography.h3, marginBottom: spacing.lg },

  regra: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  regraIcone: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.glowSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  regraIconeTexto: { fontSize: 20 },
  regraTextos: { flex: 1 },
  regraTitulo: { color: colors.text, fontSize: 15, fontWeight: "700" },
  regraDescricao: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 2 },

  rodape: { color: colors.textLight, fontSize: 11, textAlign: "center", lineHeight: 16 },
});
