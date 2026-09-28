import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import StarRating from "../components/StarRating";
import { useAvaliarProdutoLogic } from "../hooks/useAvaliarProdutoLogic";
import { colors } from "../styles/theme";

export default function AvaliarProduto({ route, navigation }: any) {
  const {
    produto,
    avaliacaoProduto,
    setAvaliacaoProduto,
    avaliacaoVendedor,
    setAvaliacaoVendedor,
    comentario,
    setComentario,
    enviarAvaliacao,
  } = useAvaliarProdutoLogic(route, navigation);

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
        <View style={styles.card}>
          <Text style={styles.produtoNome}>{produto.nome}</Text>

          <Text style={styles.label}>Avalie o produto:</Text>
          <StarRating rating={avaliacaoProduto} onRatingPress={setAvaliacaoProduto} />

          <Text style={styles.label}>Avalie o vendedor:</Text>
          <StarRating rating={avaliacaoVendedor} onRatingPress={setAvaliacaoVendedor} />

          <Text style={styles.label}>Deixe um comentário (opcional):</Text>
          <TextInput
            style={styles.input}
            placeholder="O que você achou do lanche e do atendimento?"
            value={comentario}
            onChangeText={setComentario}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.botao} onPress={enviarAvaliacao}>
            <Text style={styles.botaoTexto}>Enviar Avaliação</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 100,
  },
  botao: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  botaoTexto: {
    color: colors.white,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});