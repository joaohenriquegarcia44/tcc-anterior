import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../database/database';

export function useLerQRCodeLogic(route: any, navigation: any) {
  const pedidoId = route.params?.pedidoId;
  const codigoEsperado = route.params?.codigoNumerico;
  const acao: 'homologar' | 'retirar' = route.params?.acao || 'homologar';
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [usandoCodigo, setUsandoCodigo] = useState(false);
  const qrLock = useRef(false);

  async function finalizarPedido(id: string) {
    const pedidoRef = doc(db, 'pedidos', id);
    const pedidoSnap = await getDoc(pedidoRef);
    if (!pedidoSnap.exists()) {
      Alert.alert('Erro', 'Pedido não encontrado');
      return false;
    }
    const pedido = pedidoSnap.data();

    if (acao === 'retirar') {
      if (pedido.status === 'retirado') {
        Alert.alert('Aviso', 'Este pedido já foi retirado');
        return false;
      }
      if (pedido.status !== 'homologada') {
        Alert.alert('Aviso', 'Este pedido ainda não foi homologado');
        return false;
      }
      await updateDoc(pedidoRef, { status: 'retirado', retiradoEm: new Date() });
      return true;
    }

    if (pedido.status === 'homologada' || pedido.status === 'retirado') {
      Alert.alert('Aviso', 'Este pedido já foi homologado');
      return false;
    }
    await updateDoc(pedidoRef, { status: 'homologada' });
    return true;
  }

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned || loading || qrLock.current) return;
    qrLock.current = true;
    setScanned(true);
    setLoading(true);
    try {
      const qrData = JSON.parse(data);
      const { pedidoId: id, vendedorId } = qrData;
      if (auth.currentUser?.uid !== vendedorId) {
        Alert.alert('Erro', 'Este QR Code não pertence aos seus produtos');
        setScanned(false);
        setLoading(false);
        qrLock.current = false;
        return;
      }
      const sucesso = await finalizarPedido(id);
      if (sucesso) {
        const msg = acao === 'retirar' ? 'Pedido retirado com sucesso!' : 'Compra realizada com sucesso!';
        Alert.alert('Sucesso', msg);
        navigation.goBack();
      } else {
        setScanned(false);
        setLoading(false);
        qrLock.current = false;
      }
    } catch (error) {
      Alert.alert('Erro', 'QR Code inválido');
      setScanned(false);
      setLoading(false);
      qrLock.current = false;
    }
  }

  async function confirmarPorCodigo() {
    if (!codigoDigitado || !pedidoId) {
      Alert.alert('Erro', 'Código inválido ou pedido não identificado');
      return;
    }
    setLoading(true);
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    const pedidoSnap = await getDoc(pedidoRef);
    if (!pedidoSnap.exists()) {
      Alert.alert('Erro', 'Pedido não encontrado');
      setLoading(false);
      return;
    }
    const pedido = pedidoSnap.data();
    if (pedido.codigoNumerico !== codigoDigitado) {
      Alert.alert('Erro', 'Código numérico incorreto');
      setLoading(false);
      return;
    }
    if (auth.currentUser?.uid !== pedido.vendedorId) {
      Alert.alert('Erro', 'Você não tem permissão para finalizar este pedido');
      setLoading(false);
      return;
    }

    if (acao === 'retirar') {
      if (pedido.status === 'retirado') {
        Alert.alert('Aviso', 'Este pedido já foi retirado');
        setLoading(false);
        return;
      }
      if (pedido.status !== 'homologada') {
        Alert.alert('Aviso', 'Este pedido ainda não foi homologado');
        setLoading(false);
        return;
      }
      await updateDoc(pedidoRef, { status: 'retirado', retiradoEm: new Date() });
    } else {
      if (pedido.status === 'homologada' || pedido.status === 'retirado') {
        Alert.alert('Aviso', 'Este pedido já foi homologado');
        setLoading(false);
        return;
      }
      await updateDoc(pedidoRef, { status: 'homologada' });
    }

    const msg = acao === 'retirar' ? 'Pedido retirado com sucesso!' : 'Compra realizada com sucesso!';
    Alert.alert('Sucesso', msg);
    navigation.goBack();
  }

  return {
    permission,
    requestPermission,
    scanned,
    loading,
    codigoDigitado,
    setCodigoDigitado,
    usandoCodigo,
    setUsandoCodigo,
    acao,
    handleBarCodeScanned,
    confirmarPorCodigo,
  };
}
