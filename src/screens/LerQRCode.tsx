import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { CameraView } from "expo-camera";
import { useLerQRCodeLogic } from "../hooks/useLerQRCodeLogic";

export default function LerQRCode({ route, navigation }: any) {
  const {
    permission,
    requestPermission,
    scanned,
    loading,
    codigoDigitado,
    setCodigoDigitado,
    usandoCodigo,
    setUsandoCodigo,
    handleBarCodeScanned,
    confirmarPorCodigo,
  } = useLerQRCodeLogic(route, navigation);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: "center", marginBottom: 20 }}>
          Precisamos de acesso à câmera para ler QR Codes.
        </Text>
        <TouchableOpacity style={styles.botao} onPress={requestPermission}>
          <Text style={styles.botaoTexto}>Conceder Permissão</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
          <Text style={styles.botaoTexto}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!usandoCodigo ? (
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <Text style={styles.scanText}>Centralize o QR Code</Text>
            </View>
          </View>
        </CameraView>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.codigoContainer}>
              <Text style={styles.codigoLabel}>Digite o código numérico do pedido</Text>
              <TextInput
                style={styles.codigoInput}
                placeholder="Ex: 123456"
                keyboardType="number-pad"
                value={codigoDigitado}
                onChangeText={setCodigoDigitado}
                maxLength={6}
              />
              <TouchableOpacity style={styles.botaoConfirmar} onPress={confirmarPorCodigo}>
                <Text style={styles.botaoTexto}>Confirmar entrega</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      <View style={styles.botoesTroca}>
        <TouchableOpacity style={styles.botaoAlternativo} onPress={() => setUsandoCodigo(!usandoCodigo)}>
          <Text style={styles.botaoTextoAlt}>
            {usandoCodigo ? "📷 Usar câmera (QR)" : "🔢 Digitar código numérico"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
          <Text style={styles.botaoTexto}>← Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  scanArea: { width: 250, height: 250, borderWidth: 2, borderColor: "#FF6B6B", borderRadius: 20, justifyContent: "center", alignItems: "center" },
  scanText: { color: "#fff", fontSize: 16, fontWeight: "bold", backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  codigoContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  codigoLabel: { fontSize: 16, marginBottom: 20, color: "#333", textAlign: "center" },
  codigoInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 18, width: "80%", textAlign: "center", marginBottom: 20 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  botoesTroca: { position: "absolute", bottom: 40, left: 0, right: 0, alignItems: "center" },
  botaoAlternativo: { backgroundColor: "#4ECDC4", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginBottom: 15 },
  botaoTextoAlt: { color: "#fff", fontWeight: "bold" },
  botaoConfirmar: { backgroundColor: "#27ae60", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  botaoVoltar: { backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25, marginTop: 10 },
  botao: { backgroundColor: "#FF6B6B", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});