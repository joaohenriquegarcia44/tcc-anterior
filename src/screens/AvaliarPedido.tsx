import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import StarRating from "../components/StarRating";
import { useAvaliarPedidoLogic } from "../hooks/useAvaliarPedidoLogic";

export default function AvaliarPedido({ route, navigation }: any) {
  const {
    pedido,
    avaliacoes,
    comentarios,
    avaliacaoVendedor,
    setAvaliacaoVendedor,
    comentarioVendedor,
    setComentarioVendedor,
    setNota,
    setComentario,
    enviarAvaliacoes,
    loading,
  } = useAvaliarPedidoLogic(route, navigation);

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
        <Text style={styles.titulo}>Avaliar Pedido</Text>
        <Text style={styles.pedidoId}>Pedido #{pedido.id.slice(-6)}</Text>

        {pedido.lanches.map((item: any) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.produtoNome}>{item.nome}</Text>
            <Text style={styles.label}>Sua nota:</Text>
            <StarRating rating={avaliacoes[item.id] || 0} onRatingPress={(nota) => setNota(item.id, nota)} />
            <Text style={styles.label}>Comentário (opcional):</Text>
            <TextInput
              style={styles.input}
              placeholder="O que achou deste lanche?"
              value={comentarios[item.id] || ""}
              onChangeText={(text) => setComentario(item.id, text)}
              multiline
            />
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.produtoNome}>Avalie o vendedor</Text>
          <Text style={styles.label}>Nota para o vendedor:</Text>
          <StarRating rating={avaliacaoVendedor} onRatingPress={setAvaliacaoVendedor} />
          <Text style={styles.label}>Comentário (opcional):</Text>
          <TextInput
            style={styles.input}
            placeholder="Como foi o atendimento?"
            value={comentarioVendedor}
            onChangeText={setComentarioVendedor}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.botao} onPress={enviarAvaliacoes} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Enviar Avaliações</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8", padding: 16 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  pedidoId: { fontSize: 14, color: "#666", marginBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  produtoNome: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8, marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, fontSize: 14, textAlignVertical: "top", minHeight: 60, marginBottom: 8 },
  botao: { backgroundColor: "#FF6B6B", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 8, marginBottom: 30 },
  botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});