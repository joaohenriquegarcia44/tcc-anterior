import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { collection, getDocs, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { db, auth } from '../database/database';

export function usePainelVendedorLogic(navigation: any) {
  const [lanches, setLanches] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarPermissao();
  }, []);

  async function verificarPermissao() {
    if (!auth.currentUser) {
      navigation.replace('Login');
      return;
    }
    try {
      const userRef = doc(db, 'usuarios', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const papel = userSnap.data()?.papel;
      if (papel !== 'admin') {
        Alert.alert('Acesso negado', 'Você não tem permissão para acessar esta área.');
        navigation.goBack();
        return;
      }
      buscarLanches();
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível verificar permissão.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  const buscarLanches = useCallback(async () => {
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erro', 'Usuário não logado');
        setError('Usuário não autenticado');
        return;
      }
      const q = query(collection(db, 'lanches'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
      setLanches(lista);
    } catch (err: any) {
      console.error('❌ Erro ao buscar lanches:', err);
      setError(err.message || 'Erro desconhecido');
      Alert.alert('Erro', 'Não foi possível carregar seus lanches.');
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await buscarLanches();
    setRefreshing(false);
  };

  const deletarLanche = (id: string) => {
    Alert.alert('Excluir', 'Deseja excluir este lanche?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'lanches', id));
            setLanches(prev => prev.filter(item => item.id !== id));
            Alert.alert('Sucesso', 'Lanche excluído');
          } catch (error: any) {
            Alert.alert('Erro ao deletar', error.message || 'Sem permissão');
          }
        },
      },
    ]);
  };

  const salgados = lanches.filter(l =>
    (l.categorias && l.categorias.includes('lanche')) || (!l.categorias && l.categoria === 'lanche')
  );
  const doces = lanches.filter(l =>
    (l.categorias && l.categorias.includes('doce')) || (!l.categorias && l.categoria === 'doce')
  );
  const bebidas = lanches.filter(l =>
    (l.categorias && l.categorias.includes('bebida')) || (!l.categorias && l.categoria === 'bebida')
  );
  const promocoes = lanches.filter(l => l.promocao === true);

  const sections = [
    { title: '🍔 Salgados', data: salgados, color: '#FF6B6B' },
    { title: '🍰 Doces', data: doces, color: '#FFE66D' },
    { title: '🥤 Bebidas', data: bebidas, color: '#4ECDC4' },
    { title: '🔥 Promoções', data: promocoes, color: '#FF9F40' },
  ].filter(section => section.data.length > 0);

  return {
    lanches,
    setLanches,
    refreshing,
    error,
    loading,
    sections,
    salgados,
    doces,
    bebidas,
    promocoes,
    buscarLanches,
    onRefresh,
    deletarLanche,
    verificarPermissao,
  };
}
