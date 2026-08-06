import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useLoginLogic } from "../hooks/useLoginLogic";

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🍔</Text>
            </View>
            <Text style={styles.titulo}>IF-aminto</Text>
            <Text style={styles.subtitulo}>Comida caseira feita por alunos do IFSul</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Senha"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.esqueciSenha} onPress={esqueciSenha}>
              <Text style={styles.esqueciSenhaText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botao, loading && styles.botaoDisabled]}
              onPress={fazerLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Entrar</Text>}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.botaoCadastro} onPress={irParaCadastro}>
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FF6B6B" },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  content: { flex: 1, justifyContent: "space-between", paddingHorizontal: 25, paddingVertical: 50 },
  logoContainer: { alignItems: "center", marginTop: 40 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", marginBottom: 20, elevation: 10 },
  logoEmoji: { fontSize: 50 },
  titulo: { fontSize: 36, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  subtitulo: { fontSize: 14, color: "#fff", textAlign: "center", opacity: 0.9 },
  formContainer: { backgroundColor: "#fff", borderRadius: 25, padding: 20, elevation: 5 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, backgroundColor: "#fafafa" },
  inputIcon: { fontSize: 20, marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: "#333", opacity: 1 },
  eyeIcon: { fontSize: 20, color: "#999" },
  esqueciSenha: { alignSelf: "flex-end", marginBottom: 20 },
  esqueciSenhaText: { color: "#FF6B6B", fontSize: 13 },
  botao: { backgroundColor: "#FF6B6B", paddingVertical: 15, borderRadius: 12, alignItems: "center", marginBottom: 15 },
  botaoDisabled: { opacity: 0.7 },
  botaoTexto: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e0e0e0" },
  dividerText: { marginHorizontal: 15, color: "#999", fontSize: 14 },
  botaoCadastro: { borderWidth: 1, borderColor: "#FF6B6B", paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  botaoCadastroTexto: { color: "#FF6B6B", fontSize: 16, fontWeight: "500" },
  footer: { alignItems: "center", marginBottom: 20 },
  footerText: { color: "#fff", fontSize: 12, textAlign: "center", opacity: 0.8 },
  footerLink: { textDecorationLine: "underline", fontWeight: "bold" },
});