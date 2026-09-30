import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Checkbox from "expo-checkbox";
import Constants from 'expo-constants';
import { useCriarLancheLogic } from "../hooks/useCriarLancheLogic";
import { colors } from "../styles/theme";

export default function CriarLanche({ navigation }: any) {
  const {
    nome,
    setNome,
    preco,
    setPreco,
    precoPromocional,
    setPrecoPromocional,
    descricao,
    setDescricao,
    imagemUrl,
    setImagemUrl,
    quantidadeDisponivel,
    setQuantidadeDisponivel,
    categoriasSelecionadas,
    setCategoriasSelecionadas,
    tempoPreparo,
    setTempoPreparo,
    ingredientes,
    setIngredientes,
    promocao,
    setPromocao,
    localRetirada,
    setLocalRetirada,
    loading,
    uploadingImage,
    permissaoVerificada,
    opcoesCategorias,
    toggleCategoria,
    escolherOpcaoImagem,
    processarImagem,
    salvarLanche,
  } = useCriarLancheLogic(navigation);

  if (!permissaoVerificada) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Verificando permissão...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.imageSection}>
          {imagemUrl ? (
            <Image source={{ uri: imagemUrl }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>🍔</Text>
              <Text style={styles.imagePlaceholderText}>Nenhuma imagem selecionada</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={escolherOpcaoImagem}
            disabled={uploadingImage}
          >
            <Text style={styles.changeImageText}>
              {uploadingImage ? "⏳ Enviando..." :
                imagemUrl ? "🔄 Trocar imagem" : "📷 Selecionar imagem"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Informações Básicas</Text>
          <Text style={styles.label}>Nome do lanche *</Text>
          <TextInput style={styles.input} placeholderTextColor={colors.textSecondary} placeholder="Ex: X-Burger Especial" value={nome} onChangeText={setNome} />
          <Text style={styles.label}>Preço (R$) *</Text>
          <TextInput style={styles.input} placeholderTextColor={colors.textSecondary} placeholder="0,00" value={preco} onChangeText={setPreco} keyboardType="numeric" />
          <Text style={styles.label}>Descrição *</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholderTextColor={colors.textSecondary} placeholder="Descreva seu lanche..." value={descricao} onChangeText={setDescricao} multiline />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Estoque</Text>
          <Text style={styles.label}>Quantidade disponível</Text>
          <TextInput style={styles.input} placeholderTextColor={colors.textSecondary} placeholder="10" value={quantidadeDisponivel} onChangeText={setQuantidadeDisponivel} keyboardType="numeric" />
          <Text style={styles.label}>Tempo de preparo (minutos)</Text>
          <TextInput style={styles.input} placeholderTextColor={colors.textSecondary} placeholder="15-25" value={tempoPreparo} onChangeText={setTempoPreparo} keyboardType="numeric" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ Categorias (pode escolher mais de uma)</Text>
          {opcoesCategorias.map(cat => (
            <View key={cat.id} style={styles.checkboxRow}>
              <Checkbox
                value={categoriasSelecionadas.includes(cat.id)}
                onValueChange={() => toggleCategoria(cat.id)}
                color={categoriasSelecionadas.includes(cat.id) ? cat.cor : undefined}
              />
              <Text style={styles.checkboxLabel}>{cat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥗 Ingredientes</Text>
          <TextInput style={styles.input} placeholderTextColor={colors.textSecondary} placeholder="Pão, hambúrguer, queijo, alface, tomate" value={ingredientes} onChangeText={setIngredientes} />
          <Text style={styles.helperText}>Separe os ingredientes por vírgula</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Local de Retirada</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textSecondary}
            placeholder="Ex: Cantina do IFSul, Sala 101 / Rua das Flores, 123"
            value={localRetirada}
            onChangeText={setLocalRetirada}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🎯 Ativar promoção</Text>
            <Switch value={promocao} onValueChange={setPromocao} trackColor={{ false: colors.borderLight, true: colors.primary }} />
          </View>
          {promocao && (
            <View>
              <Text style={styles.label}>Preço promocional (R$)</Text>
              <TextInput style={styles.input} placeholderTextColor={colors.textSecondary} placeholder="0,00" value={precoPromocional} onChangeText={setPrecoPromocional} keyboardType="numeric" />
            </View>
          )}
        </View>

        <TouchableOpacity style={[styles.botaoSalvar, loading && styles.botaoDisabled]} onPress={salvarLanche} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.botaoTexto}>🍔 Criar Lanche</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageSection: { backgroundColor: colors.card, alignItems: "center", padding: 20, marginTop: 12 },
  previewImage: { width: 200, height: 150, borderRadius: 12, resizeMode: "cover" },
  imagePlaceholder: { width: 200, height: 150, borderRadius: 12, backgroundColor: colors.surfaceAlt, justifyContent: "center", alignItems: "center" },
  imagePlaceholderIcon: { fontSize: 40, marginBottom: 8 },
  imagePlaceholderText: { fontSize: 12, color: colors.textSecondary },
  changeImageButton: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginTop: 12 },
  changeImageText: { color: colors.primaryText, fontWeight: "500" },
  section: { backgroundColor: colors.card, marginTop: 12, paddingHorizontal: 20, paddingVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 16 },
  label: { fontSize: 14, color: colors.textSecondary, marginBottom: 8, marginTop: 12, fontWeight: "500" },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: colors.card, color: colors.text },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  switchLabel: { fontSize: 16, color: colors.text },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  checkboxLabel: { fontSize: 16, marginLeft: 12, color: colors.text },
  helperText: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  botaoSalvar: { backgroundColor: colors.primary, margin: 20, paddingVertical: 16, borderRadius: 12, alignItems: "center", elevation: 3 },
  botaoDisabled: { opacity: 0.7 },
  botaoTexto: { color: colors.white, fontSize: 18, fontWeight: "bold" },
});