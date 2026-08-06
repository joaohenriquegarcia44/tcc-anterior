import { useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { query, collection, where, getDocs, getDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../database/database';
import { CartContext } from '../services/CartContext';

export function useProdutoLogic(route: any, navigation: any) {
  const { produto } = route.params;
  const { adicionarAoCarrinho } = useContext(CartContext);
  const [quantidade, setQuantidade] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [mediaAvaliacao, setMediaAvaliacao] = useState(0);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
  const [vendedorInfo, setVendedorInfo] = useState<any>(null);
  const [isFavorito, setIsFavorito] = useState(false);

  useEffect(() => {
    verificarFavorito();
    buscarAvaliacoes();
    buscarVendedorInfo();
  }, []);

  async function verificarFavorito() {
    if (!auth.currentUser) return;

    try {
      const favoritoId = `${auth.currentUser.uid}_${produto.id}`;
      const favoritoRef = doc(db, 'favoritos', favoritoId);
      const favoritoSnap = await getDoc(favoritoRef);
      setIsFavorito(favoritoSnap.exists());
    } catch (error) {
      console.log('Erro ao verificar favorito:', error);
    }
  }

  async function buscarAvaliacoes() {
    setLoadingAvaliacoes(true);
    try {
      const q = query(
        collection(db, 'avaliacoes_produto'),
        where('produtoId', '==', produto.id)
      );
      const querySnapshot = await getDocs(q);
      const avaliacoesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvaliacoes(avaliacoesList);

      if (avaliacoesList.length > 0) {
        const media = avaliacoesList.reduce((sum, av) => sum + av.nota, 0) / avaliacoesList.length;
        setMediaAvaliacao(media);
      }
    } catch (error) {
      console.log('Erro ao buscar avaliações:', error);
    } finally {
      setLoadingAvaliacoes(false);
    }
  }

  async function buscarVendedorInfo() {
    try {
      const vendedorRef = doc(db, 'usuarios', produto.userId);
      const vendedorSnap = await getDoc(vendedorRef);
      if (vendedorSnap.exists()) {
        setVendedorInfo(vendedorSnap.data());
      }
    } catch (error) {
      console.log('Erro ao buscar info do vendedor:', error);
    }
  }

  function incrementar() {
    if (quantidade < (produto.quantidadeDisponivel || 999)) {
      setQuantidade(quantidade + 1);
    }
  }

  function decrementar() {
    if (quantidade > 1) {
      setQuantidade(quantidade - 1);
    }
  }

  function adicionarAoCarrinhoComQuantidade() {
    const produtoComQuantidade = {
      ...produto,
      quantidade,
    };
    adicionarAoCarrinho(produtoComQuantidade);
    Alert.alert('Sucesso', `${quantidade}x ${produto.nome} adicionado ao carrinho!`);
    setShowModal(false);
  }

  async function toggleFavorito() {
    if (!auth.currentUser) {
      Alert.alert('Atenção', 'Você precisa estar logado para adicionar favoritos');
      return;
    }

    try {
      const favoritoId = `${auth.currentUser.uid}_${produto.id}`;
      const favoritoRef = doc(db, 'favoritos', favoritoId);

      if (isFavorito) {
        await deleteDoc(favoritoRef);
        setIsFavorito(false);
        Alert.alert('Removido', 'Produto removido dos favoritos');
      } else {
        await setDoc(favoritoRef, {
          userId: auth.currentUser.uid,
          produtoId: produto.id,
          produtoNome: produto.nome,
          criadoEm: new Date(),
        });
        setIsFavorito(true);
        Alert.alert('Adicionado', 'Produto adicionado aos favoritos!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar favoritos');
      console.log('Erro ao alterar favorito:', error);
    }
  }

  return {
    produto,
    quantidade,
    setQuantidade,
    showModal,
    setShowModal,
    avaliacoes,
    mediaAvaliacao,
    loadingAvaliacoes,
    vendedorInfo,
    isFavorito,
    incrementar,
    decrementar,
    adicionarAoCarrinhoComQuantidade,
    toggleFavorito,
  };
}
