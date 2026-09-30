import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, borderRadius, shadows } from "../styles/theme";
import ModalBonificacao from "./ModalBonificacao";

type Props = {
  visivel: boolean;
  onFechar: () => void;
  navigation: any;
  /** Abre o Painel do Vendedor (botão da própria tela, fora do menu). */
  onAbrirPainel: () => void;
};

/**
 * Menu hambúrguer da área do vendedor: concentra as ações administrativas que
 * ficavam espalhadas dentro do Painel do Vendedor.
 */
export default function MenuAdministrador({ visivel, onFechar, navigation, onAbrirPainel }: Props) {
  const insets = useSafeAreaInsets();
  const [bonificacaoAberta, setBonificacaoAberta] = useState(false);
  const deslize = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(deslize, {
      toValue: visivel ? 1 : 0,
      duration: visivel ? 260 : 180,
      easing: visivel ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visivel, deslize]);

  function irPara(rota: string) {
    onFechar();
    navigation.navigate(rota);
  }

  const itens = [
    { icone: "🏪", titulo: "Painel do Vendedor", subtitulo: "Gerencie seus lanches", destaque: true, onPress: onAbrirPainel },
    { icone: "➕", titulo: "Criar lanche", subtitulo: "Publique um novo lanche no cardápio", onPress: () => irPara("CriarLanche") },
    { icone: "🧾", titulo: "Pedidos recebidos", subtitulo: "Confirme e prepare os pedidos", onPress: () => irPara("PedidosRecebidos") },
    { icone: "📈", titulo: "Vendas", subtitulo: "Acompanhe seu desempenho", onPress: () => irPara("Vendas") },
    {
      icone: "🎁",
      titulo: "Bonificação e combo",
      subtitulo: "Fidelidade e desconto do combo",
      onPress: () => {
        onFechar();
        setTimeout(() => setBonificacaoAberta(true), 220);
      },
    },
  ];

  return (
    <>
      <Modal visible={visivel} transparent animationType="none" onRequestClose={onFechar} statusBarTranslucent>
        <View style={styles.overlay}>
          <Pressable style={styles.fundo} onPress={onFechar} accessibilityLabel="Fechar menu" />

          <Animated.View
            style={[
              styles.gaveta,
              {
                paddingTop: insets.top + spacing.xl,
                paddingBottom: insets.bottom + spacing.xl,
                transform: [
                  { translateX: deslize.interpolate({ inputRange: [0, 1], outputRange: [-300, 0] }) },
                ],
              },
            ]}
          >
            <View style={styles.topoGaveta}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>🏪</Text>
              </View>
              <View style={styles.topoTextos}>
                <Text style={styles.topoTitulo}>Área do vendedor</Text>
                <Text style={styles.topoSubtitulo}>Painel do Vendedor</Text>
              </View>
              <TouchableOpacity
                style={styles.fechar}
                onPress={onFechar}
                hitSlop={8}
                accessibilityLabel="Fechar menu"
              >
                <Text style={styles.fecharTexto}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.lista}>
              {itens.map((item) => (
                <TouchableOpacity
                  key={item.titulo}
                  activeOpacity={0.85}
                  onPress={item.onPress}
                  style={[styles.item, item.destaque && styles.itemDestaque]}
                  accessibilityRole="button"
                >
                  <View style={[styles.itemIcone, item.destaque && styles.itemIconeDestaque]}>
                    <Text style={styles.itemIconeTexto}>{item.icone}</Text>
                  </View>
                  <View style={styles.itemTextos}>
                    <Text style={[styles.itemTitulo, item.destaque && styles.itemTituloDestaque]} numberOfLines={1}>
                      {item.titulo}
                    </Text>
                    <Text style={styles.itemSubtitulo} numberOfLines={2}>
                      {item.subtitulo}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.rodape}>if-aminto · área restrita a administradores</Text>
          </Animated.View>
        </View>
      </Modal>

      <ModalBonificacao visivel={bonificacaoAberta} onFechar={() => setBonificacaoAberta(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row" },
  fundo: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },

  gaveta: {
    width: 300,
    maxWidth: "86%",
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: spacing.lg,
    ...shadows.large,
  },

  topoGaveta: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.glowSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: { fontSize: 20 },
  topoTextos: { flex: 1 },
  topoTitulo: { color: colors.text, fontSize: 15, fontWeight: "800" },
  topoSubtitulo: { color: colors.primaryText, fontSize: 11, fontWeight: "700", marginTop: 1 },
  fechar: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  fecharTexto: { color: colors.textSecondary, fontSize: 14, fontWeight: "800" },

  lista: { gap: spacing.sm },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "transparent",
  },
  itemDestaque: {
    backgroundColor: colors.glowSoft,
    borderColor: colors.primary,
  },
  itemIcone: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  itemIconeDestaque: { backgroundColor: colors.primary },
  itemIconeTexto: { fontSize: 18 },
  itemTextos: { flex: 1 },
  itemTitulo: { color: colors.text, fontSize: 14, fontWeight: "700" },
  itemTituloDestaque: { color: colors.white, fontWeight: "900" },
  itemSubtitulo: { color: colors.textLight, fontSize: 11, marginTop: 1 },

  rodape: {
    marginTop: spacing.xl,
    color: colors.textLight,
    fontSize: 10,
    textAlign: "center",
  },
});
