import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useEditarLancheLogic } from "../hooks/useEditarLancheLogic";

export default function EditarLanche({ route, navigation }: any) {
  const {
    nome,
    setNome,
    preco,
    setPreco,
    descricao,
    setDescricao,
    imagemUrl,
    setImagemUrl,
    quantidadeDisponivel,
    setQuantidadeDisponivel,
    categoriasSelecionadas,
    setCategoriasSelecionadas,
    disponivel,
    setDisponivel,
    promocao,
    setPromocao,
    precoPromocional,
    setPrecoPromocional,
    tempoPreparo,
    setTempoPreparo,
    ingredientes,
    setIngredientes,
    localRetirada,
    setLocalRetirada,
    loading,
    uploadingImage,
    opcoesCategorias,
    toggleCategoria,
    escolherOpcaoImagem,
    atualizarLanche,
    excluirLanche,
  } = useEditarLancheLogic(route, navigation);

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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Editar Lanche</Text>
          <TouchableOpacity onPress={excluirLanche} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageSection}>
          <Image source={{ uri: imagemUrl }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={escolherOpcaoImagem}
            disabled={uploadingImage}
          >
            <Text style={styles.changeImageText}>
              {uploadingImage ? "⏳ Enviando..." : "📷 Trocar imagem"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Informações Básicas</Text>
          <Text style={styles.label}>Nome do lanche *</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: X-Burger Especial" />
          <Text style={styles.label}>Preço (R$) *</Text>
          <TextInput style={styles.input} value={preco} onChangeText={setPreco} keyboardType="numeric" placeholder="0,00" />
          <Text style={styles.label}>Descrição *</Text>
          <TextInput style={[styles.input, styles.textArea]} value={descricao} onChangeText={setDescricao} placeholder="Descreva seu lanche..." multiline />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Estoque e Disponibilidade</Text>
          <Text style={styles.label}>Quantidade disponível</Text>
          <TextInput style={styles.input} value={quantidadeDisponivel} onChangeText={setQuantidadeDisponivel} keyboardType="numeric" placeholder="10" />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Lanche disponível para venda</Text>
            <Switch value={disponivel} onValueChange={setDisponivel} trackColor={{ false: "#ddd", true: "#FF6B6B" }} />
          </View>
          <Text style={styles.label}>Tempo de preparo (minutos)</Text>
          <TextInput style={styles.input} value={tempoPreparo} onChangeText={setTempoPreparo} keyboardType="numeric" placeholder="15-25" />
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
          <TextInput style={styles.input} value={ingredientes} onChangeText={setIngredientes} placeholder="Pão, hambúrguer, queijo, alface, tomate (separados por vírgula)" />
          <Text style={styles.helperText}>Separe os ingredientes por vírgula</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Local de Retirada</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Cantina do IFSul, Sala 101 / Rua das Flores, 123"
            value={localRetirada}
            onChangeText={setLocalRetirada}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🎯 Ativar promoção</Text>
            <Switch value={promocao} onValueChange={setPromocao} trackColor={{ false: "#ddd", true: "#FF6B6B" }} />
          </View>
          {promocao && (
            <View>
              <Text style={styles.label}>Preço promocional (R$)</Text>
              <TextInput style={styles.input} value={precoPromocional} onChangeText={setPrecoPromocional} keyboardType="numeric" placeholder="0,00" />
              <Text style={styles.helperText}>O preço original será mostrado riscado</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.saveButton, loading && styles.disabledButton]} onPress={atualizarLanche} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>💾 Salvar Alterações</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  backIcon: { fontSize: 28, color: "#FF6B6B" },
  titulo: { fontSize: 20, fontWeight: "bold", color: "#333" },
  deleteButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  deleteButtonText: { fontSize: 24 },
  imageSection: { backgroundColor: "#fff", alignItems: "center", padding: 20, marginTop: 12 },
  previewImage: { width: 150, height: 150, borderRadius: 15, marginBottom: 15, resizeMode: "cover" },
  changeImageButton: { backgroundColor: "#f5f5f5", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  changeImageText: { color: "#FF6B6B", fontWeight: "500" },
  section: { backgroundColor: "#fff", marginTop: 12, paddingHorizontal: 20, paddingVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 16 },
  label: { fontSize: 14, color: "#666", marginBottom: 8, marginTop: 12, fontWeight: "500" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: "#fff" },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  switchLabel: { fontSize: 16, color: "#333" },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  checkboxLabel: { fontSize: 16, marginLeft: 12, color: "#333" },
  helperText: { fontSize: 11, color: "#999", marginTop: 5 },
  buttonContainer: { padding: 20, marginBottom: 30 },
  saveButton: { backgroundColor: "#27ae60", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cancelButton: { backgroundColor: "#f5f5f5", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  cancelButtonText: { color: "#666", fontSize: 16 },
  disabledButton: { opacity: 0.7 },
});