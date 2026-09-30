import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../database/database';
import { CartContext } from '../services/CartContext';

/** Status que ainda não são pagamento: só estes não confirmam o PIX. */
const PAGAMENTOS_PENDENTES = ['aguardando_pagamento', 'cancelado'];

/** De quanto em quanto tempo o app pergunta ao Firestore se o PIX entrou. */
const INTERVALO_CHECAGEM = 5000;

export function useExibirQRCodeLogic(route: any, navigation: any) {
  const { qrCode, qrCodeText, transactionId, pedidoId, pedidoIds } = route.params;

  const { finalizarCompra } = useContext(CartContext);
  const [confirmando, setConfirmando] = useState(false);

  /** Um pedido por vendedor: todos precisam estar pagos para o carrinho cair. */
  const ids = useMemo(() => {
    if (Array.isArray(pedidoIds) && pedidoIds.length) return pedidoIds;
    return pedidoId ? [pedidoId] : [];
  }, [pedidoIds, pedidoId]);

  // O intervalo e o AppState chamam a checagem juntos: estas travas evitam
  // conferir o mesmo pedido duas vezes e redirecionar duas vezes.
  const checando = useRef(false);
  const confirmado = useRef(false);

  const concluir = useCallback(() => {
    if (confirmado.current) return;
    confirmado.current = true;
    // Estoque consumido de vez: a reserva some e o carrinho é esvaziado.
    finalizarCompra();
    Alert.alert('Pagamento confirmado!', 'Seu pedido foi pago e o carrinho foi esvaziado.');
    navigation.navigate('Home');
  }, [finalizarCompra, navigation]);

  const verificarPagamento = useCallback(async () => {
    if (confirmado.current || checando.current || ids.length === 0) return;

    checando.current = true;
    try {
      const documentos = await Promise.all(ids.map((id: string) => getDoc(doc(db, 'pedidos', id))));
      const pago = documentos.every(
        (snap) => snap.exists() && !PAGAMENTOS_PENDENTES.includes(snap.data()?.status)
      );
      if (pago) concluir();
    } catch (error) {
      console.log('Não foi possível conferir o pagamento:', error);
    } finally {
      checando.current = false;
    }
  }, [ids, concluir]);

  // Enquanto a tela do QR fica aberta o app pergunta de tempos em tempos,
  // porque o PIX é confirmado por fora e o app não recebe nenhum aviso.
  useEffect(() => {
    verificarPagamento();
    const intervalo = setInterval(verificarPagamento, INTERVALO_CHECAGEM);
    return () => clearInterval(intervalo);
  }, [verificarPagamento]);

  // O cliente sai para o app do banco e volta: é nesse retorno que a
  // confirmação normalmente já chegou no Firestore.
  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') verificarPagamento();
    });
    return () => assinatura.remove();
  }, [verificarPagamento]);

  const copiarCodigo = async () => {
    await Clipboard.setStringAsync(qrCodeText);
    Alert.alert('Copiado', 'Código PIX copiado para a área de transferência');
  };

  const compartilhar = async () => {
    await Share.share({
      message: `Pagamento PIX - Pedido ${transactionId}\nCódigo: ${qrCodeText}`,
    });
  };

  /** Botão "Verificar": quando ainda não caiu, diz isso em vez de ficar em silêncio. */
  const verificarAgora = async () => {
    setConfirmando(true);
    await verificarPagamento();
    setConfirmando(false);

    if (!confirmado.current) {
      Alert.alert(
        'Pagamento não identificado',
        'Se você já pagou, aguarde alguns instantes e toque em "Verificar de novo".'
      );
    }
  };

  const voltarAoInicio = () => navigation.navigate('Home');

  return {
    qrCode,
    qrCodeText,
    transactionId,
    confirming: confirmando,
    copiarCodigo,
    compartilhar,
    verificarAgora,
    voltarAoInicio,
  };
}