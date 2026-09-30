import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, borderRadius, shadows } from "../styles/theme";
import MenuAdministrador from "./MenuAdministrador";
import { ROTA_PAINEL_VENDEDOR } from "../navigation/tabs";

type Props = {
  navigation: any;
  /** Tela mostrada no subtítulo do banner. */
  tela?: string;
  /** Botão da direita. Por padrão abre o Painel do Vendedor. */
  direita?: { icone: string; rotulo: string; onPress: () => void };
};

/**
 * Banner fixo do topo da área do vendedor. Marca onde o usuário está, abre o
 * menu hambúrguer de administração e leva ao Painel do Vendedor.
 */
export default function HeaderVendedor({ navigation, tela = "Visão geral", direita }: Props) {
  const insets = useSafeAreaInsets();
  const [menuAberto, setMenuAberto] = useState(false);

  function abrirPainel() {
    setMenuAberto(false);
    navigation.navigate(ROTA_PAINEL_VENDEDOR);
  }

  const acaoDireita = direita ?? { icone: "🏪", rotulo: "Abrir Painel do Vendedor", onPress: abrirPainel };

  return (
    <>
      <View style={[styles.banner, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.botaoMenu}
          onPress={() => setMenuAberto(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu do vendedor"
        >
          <Text style={styles.botaoMenuIcone}>☰</Text>
        </TouchableOpacity>

        <View style={styles.textos}>
          <View style={styles.selo}>
            <View style={styles.seloPonto} />
            <Text style={styles.seloTexto}>ÁREA DO VENDEDOR</Text>
          </View>
          <Text style={styles.titulo}>Painel do Vendedor</Text>
          <Text style={styles.subtitulo} numberOfLines={1}>
            {tela}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botaoPainel}
          onPress={acaoDireita.onPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={acaoDireita.rotulo}
        >
          <Text style={styles.botaoPainelIcone}>{acaoDireita.icone}</Text>
        </TouchableOpacity>
      </View>

      <MenuAdministrador
        visivel={menuAberto}
        onFechar={() => setMenuAberto(false)}
        navigation={navigation}
        onAbrirPainel={abrirPainel}
      />
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    ...shadows.medium,
  },

  botaoMenu: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoMenuIcone: { color: colors.text, fontSize: 18, fontWeight: "800" },

  textos: { flex: 1 },
  selo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    backgroundColor: colors.glowSoft,
  },
  seloPonto: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  seloTexto: { color: colors.primaryText, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  titulo: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 4 },
  subtitulo: { color: colors.textLight, fontSize: 11, marginTop: 1 },

  botaoPainel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.glow,
  },
  botaoPainelIcone: { fontSize: 18 },
});
