import { useState } from 'react';
import { Alert } from 'react-native';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../database/database';
import * as ImagePicker from 'expo-image-picker';
import { IMGBB_API_KEY } from '@env';

export function useEditarLancheLogic(route: any, navigation: any) {
  const { lanche } = route.params;

  const [nome, setNome] = useState(lanche.nome);
  const [preco, setPreco] = useState(String(lanche.preco));
  const [descricao, setDescricao] = useState(lanche.descricao);
  const [imagemUrl, setImagemUrl] = useState(lanche.imagem);
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState(
    String(lanche.quantidadeDisponivel || 10)
  );
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>(
    lanche.categorias || (lanche.categoria ? [lanche.categoria] : ['lanche'])
  );
  const [disponivel, setDisponivel] = useState(lanche.disponivel !== false);
  const [promocao, setPromocao] = useState(lanche.promocao || false);
  const [precoPromocional, setPrecoPromocional] = useState(
    String(lanche.precoPromocional || '')
  );
  const [tempoPreparo, setTempoPreparo] = useState(
    String(lanche.tempoPreparo || '15-25')
  );
  const [ingredientes, setIngredientes] = useState(
    lanche.ingredientes?.join(', ') || ''
  );
  const [localRetirada, setLocalRetirada] = useState(lanche.localRetirada || '');

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const opcoesCategorias = [
    { id: 'lanche', label: '🍔 Salgado', cor: '#FF6B6B' },
    { id: 'doce', label: '🍰 Doce', cor: '#FFE66D' },
    { id: 'bebida', label: '🥤 Bebida', cor: '#4ECDC4' },
  ];

  function toggleCategoria(catId: string) {
    setCategoriasSelecionadas(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  }

  function escolherOpcaoImagem() {
    Alert.alert(
      'Imagem do Lanche',
      'De onde você quer pegar a foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '📷 Tirar Foto (Câmera)', onPress: () => processarImagem('camera') },
        { text: '🖼️ Abrir Galeria', onPress: () => processarImagem('galeria') }
      ]
    );
  }

  const processarImagem = async (origem: 'camera' | 'galeria') => {
    try {
      let result;
      const opcoes: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      };
      if (origem === 'camera') {
        const permissao = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissao.granted) {
          Alert.alert('Atenção', 'Precisa de permissão para usar a câmera');
          return;
        }
        result = await ImagePicker.launchCameraAsync(opcoes);
      } else {
        const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissao.granted) {
          Alert.alert('Atenção', 'Precisa de permissão para acessar a galeria');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(opcoes);
      }
      if (!result.canceled && result.assets[0].base64) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', result.assets[0].base64);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          const url = data.data.url;
          setImagemUrl(url);
          Alert.alert('Sucesso', 'Imagem atualizada com sucesso!');
        } else {
          Alert.alert('Erro', 'Falha ao fazer upload da imagem');
        }
      }
    } catch (error) {
      console.error('Erro no upload: ', error);
      Alert.alert('Erro', 'Não foi possível processar a imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  async function atualizarLanche() {
    if (!nome || !preco || !descricao) {
      Alert.alert('Atenção', 'Preencha nome, preço e descrição');
      return;
    }
    if (parseFloat(preco) <= 0) {
      Alert.alert('Atenção', 'Preço deve ser maior que zero');
      return;
    }
    if (parseInt(quantidadeDisponivel) < 0) {
      Alert.alert('Atenção', 'Quantidade disponível não pode ser negativa');
      return;
    }
    if (!imagemUrl) {
      Alert.alert('Erro', 'Selecione uma imagem para o lanche');
      return;
    }
    if (!localRetirada) {
      Alert.alert('Erro', 'Informe o local de retirada do lanche');
      return;
    }
    if (categoriasSelecionadas.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos uma categoria');
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        nome,
        preco: parseFloat(preco),
        descricao,
        imagem: imagemUrl,
        quantidadeDisponivel: parseInt(quantidadeDisponivel),
        categorias: categoriasSelecionadas,
        disponivel,
        promocao,
        tempoPreparo,
        localRetirada,
        atualizadoEm: new Date(),
      };
      if (promocao && precoPromocional) {
        updateData.precoPromocional = parseFloat(precoPromocional);
      }
      if (ingredientes) {
        updateData.ingredientes = ingredientes.split(',').map(i => i.trim());
      }
      await updateDoc(doc(db, 'lanches', lanche.id), updateData);
      Alert.alert('Sucesso', 'Lanche atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível atualizar o lanche');
    } finally {
      setLoading(false);
    }
  }

  async function excluirLanche() {
    Alert.alert(
      'Excluir Lanche',
      'Tem certeza que deseja excluir este lanche? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteDoc(doc(db, 'lanches', lanche.id));
              Alert.alert('Sucesso', 'Lanche excluído com sucesso!');
              navigation.goBack();
            } catch (error) {
              console.log('❌ Erro ao excluir lanche:', error);
              Alert.alert('Erro', 'Não foi possível excluir o lanche. Tente novamente.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  return {
    nome,
    setNome,
    preco,
    setPreco,
    descricao,
    setDescricao,
    imagemUrl,
    setImagemUrl,
    quantidadeDisponivel,
    setQuantidadeDisponivel,
    categoriasSelecionadas,
    setCategoriasSelecionadas,
    disponivel,
    setDisponivel,
    promocao,
    setPromocao,
    precoPromocional,
    setPrecoPromocional,
    tempoPreparo,
    setTempoPreparo,
    ingredientes,
    setIngredientes,
    localRetirada,
    setLocalRetirada,
    loading,
    uploadingImage,
    opcoesCategorias,
    toggleCategoria,
    escolherOpcaoImagem,
    processarImagem,
    atualizarLanche,
    excluirLanche,
  };
}
