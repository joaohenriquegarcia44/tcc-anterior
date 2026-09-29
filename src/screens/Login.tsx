import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useLoginLogic } from "../hooks/useLoginLogic";
import BrandLogo from "../components/BrandLogo";
import PrimaryButton from "../components/PrimaryButton";
import { colors, borderRadius, spacing, hitSize, shadows } from "../styles/theme";

/** Foto de hambúrguer usada como fundo da tela de login. */
const FOTO_LOGIN = require("../../assets/burger-hero.jpg");

export default function Login() {
  const navigation = useNavigation();
  const [isNavigatorReady, setIsNavigatorReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsNavigatorReady(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  const {
    email,
    setEmail,
    senha,
    setSenha,
    loading,
    showPassword,
    setShowPassword,
    fazerLogin,
    esqueciSenha,
    irParaCadastro,
    irParaTermos,
    irParaPoliticas,
  } = useLoginLogic(navigation, isNavigatorReady);

  return (
    <View style={styles.container}>
      {/* Foto de lanche ao fundo, escurecida para o conteúdo continuar legível */}
      <Image source={FOTO_LOGIN} style={styles.fotoFundo} resizeMode="cover" />
      <LinearGradient
        colors={["rgba(5,5,5,0.45)", "rgba(5,5,5,0.86)", colors.background]}
        locations={[0, 0.34, 0.62]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topo}>
            <BrandLogo tamanho={38} />
            <Text style={styles.frase}>
              Olá! 👋 Que bom ter você aqui.{'\n'}Peça seu lanche favorito do IF.
            </Text>
          </View>

          <View style={styles.cartao}>
            <Text style={styles.cartaoTitulo}>Bem-vindo de volta</Text>
            <Text style={styles.cartaoSubtitulo}>Entre para acompanhar seus pedidos e pontos.</Text>

            <View style={styles.campo}>
              <Text style={styles.rotulo}>E-MAIL</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seu.email@ifsul.edu.br"
                  placeholderTextColor={colors.textLight}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  accessibilityLabel="E-mail"
                />
              </View>
            </View>

            <View style={styles.campo}>
              <Text style={styles.rotulo}>SENHA</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Sua senha"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry={!showPassword}
                  value={senha}
                  onChangeText={setSenha}
                  accessibilityLabel="Senha"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={10}
                  style={styles.olho}
                  accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "🙈"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.esqueciSenha} onPress={esqueciSenha} hitSlop={8}>
              <Text style={styles.esqueciSenhaText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <PrimaryButton
              title="Entrar"
              onPress={fazerLogin}
              loading={loading}
              disabled={loading}
              icon="→"
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.botaoCadastro} onPress={irParaCadastro} activeOpacity={0.85}>
              <Text style={styles.botaoCadastroTexto}>Criar nova conta</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ao continuar, você concorda com os{"\n"}
              <Text style={styles.footerLink} onPress={irParaTermos}>
                Termos de uso
              </Text>{" "}
              e{" "}
              <Text style={styles.footerLink} onPress={irParaPoliticas}>
                Política de privacidade
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: "center",
  },
  fotoFundo: { ...StyleSheet.absoluteFillObject, width: '100%', height: '62%' },
  topo: { marginBottom: spacing.xxl },
  frase: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.lg,
  },
  cartao: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.medium,
  },
  cartaoTitulo: { color: colors.text, fontSize: 20, fontWeight: "800" },
  cartaoSubtitulo: {
    color: colors.textLight,
    fontSize: 13,
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  campo: { marginBottom: spacing.lg },
  rotulo: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.input,
    minHeight: hitSize.comfortable,
  },
  inputIcon: { fontSize: 16, marginRight: spacing.md },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    opacity: 1,
  },
  olho: { padding: spacing.xs },
  eyeIcon: { fontSize: 16 },
  esqueciSenha: { alignSelf: "flex-end", marginBottom: spacing.lg },
  esqueciSenhaText: { color: colors.primaryText, fontSize: 13, fontWeight: "600" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: spacing.lg, color: colors.textLight, fontSize: 12 },
  botaoCadastro: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 15,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    backgroundColor: colors.glowSoft,
  },
  botaoCadastroTexto: { color: colors.primaryText, fontSize: 15, fontWeight: "700" },
  footer: { alignItems: "center", marginTop: spacing.xl },
  footerText: { color: colors.textLight, fontSize: 12, textAlign: "center", lineHeight: 18 },
  footerLink: { color: colors.primaryText, textDecorationLine: "underline", fontWeight: "700" },
});
