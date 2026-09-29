import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useCadastroLogic } from "../hooks/useCadastroLogic";
import PrimaryButton from "../components/PrimaryButton";
import { colors, borderRadius, spacing, hitSize, shadows } from "../styles/theme";

export default function Cadastro() {
  const navigation = useNavigation();
  const {
    nome,
    setNome,
    telefone,
    setTelefone,
    email,
    setEmail,
    senha,
    setSenha,
    confirmarSenha,
    setConfirmarSenha,
    loading,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    irParaTermos,
    irParaPoliticas,
    cadastrar,
  } = useCadastroLogic(navigation);

  const renderCampo = (
    label: string,
    icon: string,
    props: any,
    {
      show,
      onToggle,
    }: { show?: boolean; onToggle?: () => void } = {}
  ) => (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{label}</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          style={[styles.input, !!onToggle && { flex: 1 }]}
          placeholderTextColor={colors.textLight}
          secureTextEntry={show !== undefined ? !show : false}
          {...props}
        />
        {!!onToggle && (
          <TouchableOpacity onPress={onToggle} hitSlop={10} style={styles.olho} accessibilityLabel="Mostrar ou ocultar senha">
            <Text style={styles.eyeIcon}>{show ? "👁️" : "🙈"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.intro}>
            Entre para a comunidade Al-lanches e acumule pontos a cada pedido.
          </Text>

          <View style={styles.cartao}>
            {renderCampo("NOME COMPLETO", "👤", {
              placeholder: "Como te chamamos?",
              value: nome,
              onChangeText: setNome,
              autoCapitalize: "words",
            })}

            {renderCampo("TELEFONE", "📱", {
              placeholder: "(51) 99999-9999",
              value: telefone,
              onChangeText: setTelefone,
              keyboardType: "phone-pad",
            })}

            {renderCampo("E-MAIL", "✉️", {
              placeholder: "seuemail@ifsul.edu.br",
              value: email,
              onChangeText: setEmail,
              autoCapitalize: "none",
              keyboardType: "email-address",
            })}

            {renderCampo(
              "SENHA",
              "🔒",
              { placeholder: "Mínimo de 6 caracteres", value: senha, onChangeText: setSenha },
              { show: showPassword, onToggle: () => setShowPassword(!showPassword) }
            )}

            {renderCampo(
              "CONFIRMAR SENHA",
              "🔒",
              { placeholder: "Repita sua senha", value: confirmarSenha, onChangeText: setConfirmarSenha },
              { show: showConfirmPassword, onToggle: () => setShowConfirmPassword(!showConfirmPassword) }
            )}

            <PrimaryButton
              title="Criar conta"
              onPress={cadastrar}
              loading={loading}
              disabled={loading}
              style={styles.botao}
            />

            <View style={styles.termosContainer}>
              <Text style={styles.termosText}>
                Ao se cadastrar, você concorda com nossos{"\n"}
                <Text style={styles.termosLink} onPress={irParaTermos}>
                  Termos de Serviço
                </Text>{" "}
                e{" "}
                <Text style={styles.termosLink} onPress={irParaPoliticas}>
                  Política de Privacidade
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  intro: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  cartao: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.medium,
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
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.text, opacity: 1 },
  olho: { padding: spacing.xs },
  eyeIcon: { fontSize: 16 },
  botao: { marginTop: spacing.sm, marginBottom: spacing.xl },
  termosContainer: { alignItems: "center" },
  termosText: { fontSize: 12, color: colors.textLight, textAlign: "center", lineHeight: 18 },
  termosLink: { color: colors.primaryText, textDecorationLine: "underline", fontWeight: "700" },
});
