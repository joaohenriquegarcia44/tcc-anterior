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
import { colors } from "../styles/theme";

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

  const excluirRef = React.useRef(excluirLanche);
  excluirRef.current = excluirLanche;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => excluirRef.current()}
          style={styles.headerRightButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.headerRightText}>Excluir</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
            <Switch value={disponivel} onValueChange={setDisponivel} trackColor={{ false: colors.borderLight, true: colors.primary }} />
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
            <Switch value={promocao} onValueChange={setPromocao} trackColor={{ false: colors.borderLight, true: colors.primary }} />
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
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>💾 Salvar Alterações</Text>}
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
  container: { flex: 1, backgroundColor: colors.background },
  headerRightButton: { paddingHorizontal: 12, paddingVertical: 6 },
  headerRightText: { color: colors.danger, fontSize: 15, fontWeight: "600" },
  imageSection: { backgroundColor: colors.card, alignItems: "center", padding: 20, marginTop: 12 },
  previewImage: { width: 150, height: 150, borderRadius: 15, marginBottom: 15, resizeMode: "cover" },
  changeImageButton: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  changeImageText: { color: colors.primaryText, fontWeight: "500" },
  section: { backgroundColor: colors.card, marginTop: 12, paddingHorizontal: 20, paddingVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 16 },
  label: { fontSize: 14, color: colors.textSecondary, marginBottom: 8, marginTop: 12, fontWeight: "500" },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: colors.card },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  switchLabel: { fontSize: 16, color: colors.text },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  checkboxLabel: { fontSize: 16, marginLeft: 12, color: colors.text },
  helperText: { fontSize: 11, color: colors.textLight, marginTop: 5 },
  buttonContainer: { padding: 20, marginBottom: 30 },
  saveButton: { backgroundColor: colors.success, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  saveButtonText: { color: colors.white, fontSize: 18, fontWeight: "bold" },
  cancelButton: { backgroundColor: colors.surfaceAlt, paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  cancelButtonText: { color: colors.textSecondary, fontSize: 16 },
  disabledButton: { opacity: 0.7 },
});