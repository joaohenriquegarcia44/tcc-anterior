import React from 'react';
import {
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useExibirQRCodeLogic } from '../hooks/useExibirQRCodeLogic';
import { colors, spacing } from "../styles/theme";

export default function ExibirQRCode({ route, navigation }: any) {
  const { qrCode, confirming, copiarCodigo, compartilhar, verificarAgora, voltarAoInicio } =
    useExibirQRCodeLogic(route, navigation);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>Pagamento via PIX</Text>
      <Text style={styles.subtitulo}>Escaneie o QR Code ou copie o código</Text>

      {qrCode && <Image source={{ uri: qrCode }} style={styles.qrImage} />}

      <TouchableOpacity style={styles.botaoCopiar} onPress={copiarCodigo}>
        <Text style={styles.botaoTexto}>📋 Copiar código PIX</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoCompartilhar} onPress={compartilhar}>
        <Text style={styles.botaoTexto}>📤 Compartilhar</Text>
      </TouchableOpacity>

      <Text style={styles.aviso}>
        Pagou? Volte para o app: o pedido é confirmado automaticamente e o carrinho é esvaziado.
      </Text>

      <TouchableOpacity style={styles.botaoVerificar} onPress={verificarAgora} disabled={confirming}>
        {confirming ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.botaoTexto}>🔄 Verificar pagamento</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoVoltar} onPress={voltarAoInicio}>
        <Text style={styles.botaoTexto}>Voltar ao início</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  conteudo: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitulo: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  qrImage: { width: 250, height: 250, marginBottom: 20 },
  botaoCopiar: { backgroundColor: colors.info, padding: 12, borderRadius: 8, marginBottom: 10, width: '80%', alignItems: 'center' },
  botaoCompartilhar: { backgroundColor: colors.success, padding: 12, borderRadius: 8, marginBottom: 20, width: '80%', alignItems: 'center' },
  botaoVerificar: { backgroundColor: colors.secondary, padding: 12, borderRadius: 8, marginBottom: 10, width: '80%', alignItems: 'center' },
  botaoVoltar: { backgroundColor: colors.primary, padding: 12, borderRadius: 8, width: '80%', alignItems: 'center' },
  botaoTexto: { color: colors.white, fontWeight: 'bold' },
  aviso: { fontSize: 12, color: colors.textLight, marginVertical: 20, textAlign: 'center' },
});