import React from "react";
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
import { useNavigation } from "@react-navigation/native";
import { useCadastroLogic } from "../hooks/useCadastroLogic";

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

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.titulo}>Criar conta</Text>
            <Text style={styles.subtitulo}>Faça parte da comunidade IF-aminto</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                placeholderTextColor="#999"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📱</Text>
              <TextInput
                style={styles.input}
                placeholder="Telefone (com DDD) ex: 51999999999"
                placeholderTextColor="#999"
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                style={styles.input}
                placeholder="seuemail@exemplo.com"
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
                placeholder="Senha (mínimo 6 caracteres)"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Confirmar senha"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Text style={styles.eyeIcon}>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.botao, loading && styles.botaoDisabled]}
              onPress={cadastrar}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Cadastrar</Text>}
            </TouchableOpacity>

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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 28,
    color: "#FF6B6B",
    marginRight: 5,
  },
  backText: {
    fontSize: 16,
    color: "#FF6B6B",
  },
  headerContainer: {
    marginBottom: 30,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: "#999",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fafafa",
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
    opacity: 1,
  },
  eyeIcon: {
    fontSize: 20,
    color: "#999",
  },
  botao: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  botaoDisabled: {
    opacity: 0.7,
  },
  botaoTexto: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  termosContainer: {
    alignItems: "center",
  },
  termosText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  termosLink: {
    color: "#FF6B6B",
    textDecorationLine: "underline",
  },
});