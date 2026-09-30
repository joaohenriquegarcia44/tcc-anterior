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
import { colors, spacing } from "../styles/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LerQRCode({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const {
    permission,
    requestPermission,
    scanned,
    loading,
    codigoDigitado,
    setCodigoDigitado,
    usandoCodigo,
    setUsandoCodigo,
    pedidoId,
    handleBarCodeScanned,
    confirmarPorCodigo,
  } = useLerQRCodeLogic(route, navigation);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
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
            {/* O vendedor precisa ver qual pedido está confirmando. */}
            {!!pedidoId && (
              <View style={[styles.avisoPedido, { top: insets.top + spacing.md }]}>
                <Text style={styles.avisoPedidoTexto}>
                  Confirmando o pedido #{String(pedidoId).slice(-6)}
                </Text>
              </View>
            )}
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
      <View style={[styles.botoesTroca, { bottom: insets.bottom + spacing.lg }]}>
        <TouchableOpacity style={styles.botaoAlternativo} onPress={() => setUsandoCodigo(!usandoCodigo)}>
          <Text style={styles.botaoTextoAlt}>
            {usandoCodigo ? "📷 Usar câmera (QR)" : "🔢 Digitar código numérico"}
          </Text>
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
  avisoPedido: {
    position: "absolute",
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  avisoPedidoTexto: { color: colors.white, fontSize: 13, fontWeight: "700" },
  scanArea: { width: 250, height: 250, borderWidth: 2, borderColor: colors.primary, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  scanText: { color: colors.white, fontSize: 16, fontWeight: "bold", backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  codigoContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  codigoLabel: { fontSize: 16, marginBottom: 20, color: colors.text, textAlign: "center" },
  codigoInput: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 8, padding: 12, fontSize: 18, width: "80%", textAlign: "center", marginBottom: 20 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  botoesTroca: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  botaoAlternativo: { backgroundColor: colors.secondary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginBottom: 15 },
  botaoTextoAlt: { color: colors.white, fontWeight: "bold" },
  botaoConfirmar: { backgroundColor: colors.success, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  botao: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  botaoTexto: { color: colors.white, fontWeight: "bold", fontSize: 16 },
});