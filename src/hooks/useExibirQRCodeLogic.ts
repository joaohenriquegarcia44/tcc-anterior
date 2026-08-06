import { Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export function useExibirQRCodeLogic(route: any) {
  const { qrCode, qrCodeText, transactionId } = route.params;

  const copiarCodigo = async () => {
    await Clipboard.setStringAsync(qrCodeText);
    Alert.alert('Copiado', 'Código PIX copiado para a área de transferência');
  };

  const compartilhar = async () => {
    await Share.share({
      message: `Pagamento PIX - Pedido ${transactionId}\nCódigo: ${qrCodeText}`,
    });
  };

  return {
    qrCode,
    qrCodeText,
    transactionId,
    copiarCodigo,
    compartilhar,
  };
}
