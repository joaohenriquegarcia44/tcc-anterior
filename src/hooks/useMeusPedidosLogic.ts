import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { query, collection, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../database/database';
import { colors } from "../styles/theme";

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
        where("status", "not-in", ["aguardando_pagamento"])
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
      pendente: colors.warning,
      pago: colors.info,
      homologada: colors.success,
      processando: colors.info,
      pronto: colors.success,
      retirado: colors.success,
      cancelado: colors.danger,
    };
    return colorMap[status] || colors.textLight;
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
