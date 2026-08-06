import { useState } from 'react';
import { Alert } from 'react-native';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../database/database';

export function useAvaliarPedidoLogic(route: any, navigation: any) {
  const { pedido } = route.params;
  const [avaliacoes, setAvaliacoes] = useState<{ [produtoId: string]: number }>({});
  const [comentarios, setComentarios] = useState<{ [produtoId: string]: string }>({});
  const [avaliacaoVendedor, setAvaliacaoVendedor] = useState(0);
  const [comentarioVendedor, setComentarioVendedor] = useState('');
  const [loading, setLoading] = useState(false);

  function setNota(produtoId: string, nota: number) {
    setAvaliacoes(prev => ({ ...prev, [produtoId]: nota }));
  }

  function setComentario(produtoId: string, texto: string) {
    setComentarios(prev => ({ ...prev, [produtoId]: texto }));
  }

  async function enviarAvaliacoes() {
    if (!auth.currentUser) return;

    const todosAvaliados = pedido.lanches.every((p: any) => avaliacoes[p.id] && avaliacoes[p.id] > 0);
    if (!todosAvaliados) {
      Alert.alert('Atenção', 'Avalie todos os produtos com estrelas');
      return;
    }
    if (avaliacaoVendedor === 0) {
      Alert.alert('Atenção', 'Avalie o vendedor');
      return;
    }

    setLoading(true);
    try {
      for (const item of pedido.lanches) {
        await addDoc(collection(db, 'avaliacoes_produto'), {
          produtoId: item.id,
          produtoNome: item.nome,
          compradorId: auth.currentUser.uid,
          vendedorId: pedido.vendedorId,
          nota: avaliacoes[item.id],
          comentario: comentarios[item.id] || '',
          pedidoId: pedido.id,
          criadoEm: new Date(),
        });
      }

      await addDoc(collection(db, 'avaliacoes_vendedor'), {
        vendedorId: pedido.vendedorId,
        compradorId: auth.currentUser.uid,
        nota: avaliacaoVendedor,
        comentario: comentarioVendedor,
        pedidoId: pedido.id,
        criadoEm: new Date(),
      });

      await updateDoc(doc(db, 'pedidos', pedido.id), { avaliado: true });

      Alert.alert('Obrigado!', 'Avaliações registradas com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível enviar as avaliações');
    } finally {
      setLoading(false);
    }
  }

  return {
    pedido,
    avaliacoes,
    comentarios,
    avaliacaoVendedor,
    setAvaliacaoVendedor,
    comentarioVendedor,
    setComentarioVendedor,
    setNota,
    setComentario,
    enviarAvaliacoes,
    loading,
  };
}
