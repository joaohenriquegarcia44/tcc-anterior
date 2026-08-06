import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useExibirQRCodeLogic } from '../hooks/useExibirQRCodeLogic';

export default function ExibirQRCode({ route, navigation }: any) {
  const { qrCode, qrCodeText, copiarCodigo, compartilhar } = useExibirQRCodeLogic(route);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Pagamento via PIX</Text>
      <Text style={styles.subtitulo}>Escaneie o QR Code ou copie o código</Text>

      {qrCode && (
        <Image source={{ uri: qrCode }} style={styles.qrImage} />
      )}

      <TouchableOpacity style={styles.botaoCopiar} onPress={copiarCodigo}>
        <Text style={styles.botaoTexto}>📋 Copiar código PIX</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoCompartilhar} onPress={compartilhar}>
        <Text style={styles.botaoTexto}>📤 Compartilhar</Text>
      </TouchableOpacity>

      <Text style={styles.aviso}>
        Após o pagamento, o pedido será confirmado automaticamente.
      </Text>

      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.botaoTexto}>Voltar ao início</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#f8f8f8' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitulo: { fontSize: 14, color: '#666', marginBottom: 20 },
  qrImage: { width: 250, height: 250, marginBottom: 20 },
  botaoCopiar: { backgroundColor: '#3498db', padding: 12, borderRadius: 8, marginBottom: 10, width: '80%', alignItems: 'center' },
  botaoCompartilhar: { backgroundColor: '#27ae60', padding: 12, borderRadius: 8, marginBottom: 20, width: '80%', alignItems: 'center' },
  botaoVoltar: { backgroundColor: '#FF6B6B', padding: 12, borderRadius: 8, width: '80%', alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  aviso: { fontSize: 12, color: '#999', marginVertical: 20, textAlign: 'center' },
});