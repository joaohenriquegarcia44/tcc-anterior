import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../database/database';
import * as ImagePicker from 'expo-image-picker';
import { IMGBB_API_KEY } from '@env';

export function useCriarLancheLogic(navigation: any) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [precoPromocional, setPrecoPromocional] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState('10');
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
  const [tempoPreparo, setTempoPreparo] = useState('15-25');
  const [ingredientes, setIngredientes] = useState('');
  const [promocao, setPromocao] = useState(false);
  const [localRetirada, setLocalRetirada] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [permissaoVerificada, setPermissaoVerificada] = useState(false);

  const opcoesCategorias = [
    { id: 'lanche', label: '🍔 Salgado', cor: '#FF6B6B' },
    { id: 'doce', label: '🍰 Doce', cor: '#FFE66D' },
    { id: 'bebida', label: '🥤 Bebida', cor: '#4ECDC4' },
  ];

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
        Alert.alert('Acesso negado', 'Você não tem permissão para criar lanches.');
        navigation.goBack();
        return;
      }
      setPermissaoVerificada(true);
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível verificar permissão.');
      navigation.goBack();
    }
  }

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
          Alert.alert('Sucesso', 'Imagem carregada com sucesso!');
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

  async function salvarLanche() {
    if (!nome || !preco || !descricao) {
      Alert.alert('Erro', 'Preencha nome, preço e descrição');
      return;
    }
    if (parseFloat(preco) <= 0) {
      Alert.alert('Erro', 'Preço deve ser maior que zero');
      return;
    }
    if (!auth.currentUser) {
      Alert.alert('Erro', 'Usuário não autenticado');
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
      const lancheData: any = {
        nome,
        preco: parseFloat(preco),
        descricao,
        imagem: imagemUrl,
        quantidadeDisponivel: parseInt(quantidadeDisponivel),
        categorias: categoriasSelecionadas,
        disponivel: true,
        promocao,
        tempoPreparo,
        localRetirada,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        userId: auth.currentUser.uid,
        mediaAvaliacao: 0,
        totalAvaliacoes: 0,
      };
      if (promocao && precoPromocional) {
        lancheData.precoPromocional = parseFloat(precoPromocional);
      }
      if (ingredientes) {
        lancheData.ingredientes = ingredientes.split(',').map(i => i.trim());
      }
      await addDoc(collection(db, 'lanches'), lancheData);
      Alert.alert('Sucesso!', 'Lanche criado com sucesso! 🍔');
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível salvar o lanche');
    } finally {
      setLoading(false);
    }
  }

  return {
    nome,
    setNome,
    preco,
    setPreco,
    precoPromocional,
    setPrecoPromocional,
    descricao,
    setDescricao,
    imagemUrl,
    setImagemUrl,
    quantidadeDisponivel,
    setQuantidadeDisponivel,
    categoriasSelecionadas,
    setCategoriasSelecionadas,
    tempoPreparo,
    setTempoPreparo,
    ingredientes,
    setIngredientes,
    promocao,
    setPromocao,
    localRetirada,
    setLocalRetirada,
    loading,
    uploadingImage,
    permissaoVerificada,
    opcoesCategorias,
    toggleCategoria,
    escolherOpcaoImagem,
    processarImagem,
    salvarLanche,
  };
}
