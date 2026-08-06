import { useState } from 'react';
import { Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../database/database';

export function useAvaliarProdutoLogic(route: any, navigation: any) {
  const { pedidoId, produto, vendedorId } = route.params;
  const [avaliacaoProduto, setAvaliacaoProduto] = useState(0);
  const [avaliacaoVendedor, setAvaliacaoVendedor] = useState(0);
  const [comentario, setComentario] = useState('');

  async function enviarAvaliacao() {
    if (avaliacaoProduto === 0) {
      Alert.alert('Atenção', 'Avalie o produto com estrelas');
      return;
    }

    if (avaliacaoVendedor === 0) {
      Alert.alert('Atenção', 'Avalie o vendedor com estrelas');
      return;
    }

    try {
      await addDoc(collection(db, 'avaliacoes_produto'), {
        produtoId: produto.id,
        produtoNome: produto.nome,
        compradorId: auth.currentUser?.uid,
        vendedorId: vendedorId,
        nota: avaliacaoProduto,
        comentario: comentario,
        pedidoId: pedidoId,
        criadoEm: new Date(),
      });

      await addDoc(collection(db, 'avaliacoes_vendedor'), {
        vendedorId: vendedorId,
        compradorId: auth.currentUser?.uid,
        nota: avaliacaoVendedor,
        comentario: comentario,
        pedidoId: pedidoId,
        criadoEm: new Date(),
      });

      Alert.alert('Obrigado!', 'Sua avaliação foi registrada com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível enviar a avaliação');
    }
  }

  return {
    produto,
    avaliacaoProduto,
    setAvaliacaoProduto,
    avaliacaoVendedor,
    setAvaliacaoVendedor,
    comentario,
    setComentario,
    enviarAvaliacao,
  };
}
