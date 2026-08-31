import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { query, collection, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../database/database';

export function usePedidosRecebidosLogic(navigation: any) {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    buscarPedidos();
  }, []);

  async function buscarPedidos() {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, 'pedidos'),
        where('vendedorId', '==', auth.currentUser.uid),
        where('status', 'in', ['pendente', 'pago', 'homologada']),
        orderBy('status'),
        orderBy('criadoEm', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const pedidosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPedidos(pedidosList);
    } catch (error) {
      console.log('Erro ao buscar pedidos:', error);
      Alert.alert('Erro', 'Não foi possível carregar pedidos recebidos');
    }
  }

  function onRefresh() {
    setRefreshing(true);
    buscarPedidos().finally(() => setRefreshing(false));
  }

  function formatarData(timestamp: any) {
    if (!timestamp) return '';
    const data = new Date(timestamp.toDate ? timestamp.toDate() : timestamp);
    return data.toLocaleDateString('pt-BR');
  }

  function formatarHorario(timestamp: any) {
    if (!timestamp) return '';
    const data = new Date(timestamp.toDate ? timestamp.toDate() : timestamp);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function finalizarPedido(pedidoId: string, codigoNumerico: string) {
    navigation.navigate('LerQRCode', { pedidoId, codigoNumerico });
  }

  return {
    pedidos,
    refreshing,
    onRefresh,
    formatarData,
    formatarHorario,
    finalizarPedido,
  };
}
