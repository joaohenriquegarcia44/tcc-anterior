import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { query, collection, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db, auth } from '../database/database';

export function useMeusPedidosLogic(navigation: any) {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any>(null);

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function carregarPedidos() {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, 'pedidos'),
        where('compradorId', '==', auth.currentUser.uid),
        where("status", "not-in", ["aguardando_pagamento"]),
        orderBy('criadoEm', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const pedidosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPedidos(pedidosList);
    } catch (error) {
      console.log('Erro ao carregar pedidos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus pedidos');
    }
  }

  function onRefresh() {
    setRefreshing(true);
    carregarPedidos().finally(() => setRefreshing(false));
  }

  function formatarData(timestamp: any) {
    if (!timestamp) return '';
    const data = new Date(timestamp.toDate ? timestamp.toDate() : timestamp);
    return data.toLocaleDateString('pt-BR');
  }

  function getStatusText(status: string) {
    const statusMap: { [key: string]: string } = {
      pendente: '⏳ Pendente',
      pago: '💳 Pago',
      homologada: '✅ Compra realizada',
      processando: '⚙️ Processando',
      pronto: '✅ Pronto',
      retirado: '🎉 Retirado',
      cancelado: '❌ Cancelado',
    };
    return statusMap[status] || status;
  }

  function getStatusColor(status: string) {
    const colorMap: { [key: string]: string } = {
      pendente: '#FFA500',
      pago: '#3498db',
      homologada: '#27ae60',
      processando: '#3498db',
      pronto: '#27ae60',
      retirado: '#2ecc71',
      cancelado: '#e74c3c',
    };
    return colorMap[status] || '#999';
  }

  function abrirDetalhes(pedido: any) {
    setPedidoSelecionado(pedido);
  }

  function fecharModal() {
    setPedidoSelecionado(null);
  }

  async function excluirPedido(pedidoId: string) {
    Alert.alert('Excluir pedido?', 'Esta ação não pode ser desfeita', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'pedidos', pedidoId));
            setPedidos(pedidos.filter(p => p.id !== pedidoId));
            Alert.alert('Sucesso', 'Pedido excluído');
            fecharModal();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir o pedido');
          }
        }
      }
    ]);
  }

  function avaliarPedido(pedido: any) {
    navigation.navigate('AvaliarPedido', { pedido });
  }

  return {
    pedidos,
    refreshing,
    pedidoSelecionado,
    onRefresh,
    formatarData,
    getStatusText,
    getStatusColor,
    abrirDetalhes,
    fecharModal,
    excluirPedido,
    avaliarPedido,
  };
}
