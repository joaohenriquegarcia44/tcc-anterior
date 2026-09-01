import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, deleteDoc, orderBy } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../database/database';
import * as ImagePicker from 'expo-image-picker';
import { IMGBB_API_KEY } from '@env';

export function usePerfilLogic(navigation: any) {
  const [userData, setUserData] = useState<any>({});
  const [editando, setEditando] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('perfil');
  const [refreshing, setRefreshing] = useState(false);

  const [meusLanches, setMeusLanches] = useState<any[]>([]);
  const [pedidosRecebidos, setPedidosRecebidos] = useState<any[]>([]);
  const [avaliacoesRecebidas, setAvaliacoesRecebidas] = useState<any[]>([]);
  const [mediaAvaliacaoVendedor, setMediaAvaliacaoVendedor] = useState(0);
  const [graficos, setGraficos] = useState({
    pedidosHoje: 0,
    pedidosSemana: 0,
    lucroEstimado: 0,
  });

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  async function carregarDadosUsuario() {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'usuarios', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserData(userDoc.data());
        if (userDoc.data().papel === 'admin') {
          carregarDadosVendedor();
        }
      } else {
        const newUserData = {
          nome: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Aluno',
          email: auth.currentUser.email,
          telefone: 'Não informado',
          fotoPerfil: auth.currentUser.photoURL || null,
          pontos: 0,
          criadoEm: new Date(),
          tipo: 'aluno',
        };
        await setDoc(userRef, newUserData);
        setUserData(newUserData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarDadosVendedor() {
    if (!auth.currentUser) return;
    try {
      const lanchesQuery = query(collection(db, 'lanches'), where('userId', '==', auth.currentUser.uid));
      const lanchesSnap = await getDocs(lanchesQuery);
      setMeusLanches(lanchesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const pedidosQuery = query(collection(db, 'pedidos'), where('vendedorId', '==', auth.currentUser.uid), orderBy('criadoEm', 'desc'));
      const pedidosSnap = await getDocs(pedidosQuery);
      const pedidosLista = pedidosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPedidosRecebidos(pedidosLista);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());

      const pedidosHoje = pedidosLista.filter((p) => p.criadoEm?.toDate() >= hoje && p.status === 'finalizado').length;
      const pedidosSemana = pedidosLista.filter((p) => p.criadoEm?.toDate() >= inicioSemana && p.status === 'finalizado').length;
      const lucroEstimado = pedidosLista.filter((p) => p.status === 'finalizado').reduce((sum, p) => sum + p.total, 0);
      setGraficos({ pedidosHoje, pedidosSemana, lucroEstimado });

      const avaliacoesQuery = query(collection(db, 'avaliacoes_vendedor'), where('vendedorId', '==', auth.currentUser.uid), orderBy('criadoEm', 'desc'));
      const avaliacoesSnap = await getDocs(avaliacoesQuery);
      const listaAvaliacoes = avaliacoesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAvaliacoesRecebidas(listaAvaliacoes);
      const soma = listaAvaliacoes.reduce((acc, av) => acc + av.nota, 0);
      setMediaAvaliacaoVendedor(listaAvaliacoes.length ? soma / listaAvaliacoes.length : 0);
    } catch (error) {
      console.log(error);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDadosUsuario();
    setRefreshing(false);
  };

  function escolherOpcaoImagem() {
    Alert.alert('Foto de Perfil', 'De onde você quer pegar a foto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: '📷 Tirar Foto (Câmera)', onPress: () => processarImagem('camera') },
      { text: '🖼️ Abrir Galeria', onPress: () => processarImagem('galeria') },
    ]);
  }

  const processarImagem = async (origem: 'camera' | 'galeria') => {
    if (!auth.currentUser) return;
    try {
      let result;
      const opcoes: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true };
      if (origem === 'camera') {
        const permissao = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissao.granted) {
          Alert.alert('Atenção', 'Permissão para usar a câmera é necessária');
          return;
        }
        result = await ImagePicker.launchCameraAsync(opcoes);
      } else {
        const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissao.granted) {
          Alert.alert('Atenção', 'Permissão para acessar a galeria é necessária');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(opcoes);
      }
      if (!result.canceled && result.assets[0].base64) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', result.assets[0].base64);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
        const data = await response.json();
        if (data.success) {
          const downloadUrl = data.data.url;
          const userRef = doc(db, 'usuarios', auth.currentUser.uid);
          await updateDoc(userRef, { fotoPerfil: downloadUrl });
          await updateProfile(auth.currentUser, { photoURL: downloadUrl });
          setUserData((prev: any) => ({ ...prev, fotoPerfil: downloadUrl }));
          Alert.alert('Sucesso', 'Foto de perfil atualizada!');
        } else {
          Alert.alert('Erro', 'Falha ao fazer upload');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao anexar imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  async function atualizarPerfil() {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'usuarios', auth.currentUser.uid);
      await updateDoc(userRef, { nome: userData.nome, telefone: userData.telefone });
      await updateProfile(auth.currentUser, { displayName: userData.nome });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      setEditando(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
    }
  }

  async function alterarSenha() {
    if (!auth.currentUser) return;
    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (!senhaAtual) {
      Alert.alert('Erro', 'Digite sua senha atual');
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, senhaAtual);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, novaSenha);
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setShowPasswordModal(false);
      setNovaSenha('');
      setConfirmarSenha('');
      setSenhaAtual('');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') Alert.alert('Erro', 'Senha atual incorreta');
      else Alert.alert('Erro', 'Não foi possível alterar a senha');
    }
  }

  async function limparPedidosAntigos() {
    if (!auth.currentUser) return;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);
    try {
      const q = query(
        collection(db, 'pedidos'),
        where('vendedorId', '==', auth.currentUser.uid),
        where('status', 'in', ['homologada', 'retirado']),
        where('criadoEm', '<', dataLimite)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        Alert.alert('Info', 'Não há pedidos antigos para remover.');
        return;
      }
      const promises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(promises);
      Alert.alert('Limpeza concluída', `${snapshot.size} pedidos removidos com sucesso.`);
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível limpar os pedidos antigos.');
    }
  }

  function confirmarLimpeza() {
    Alert.alert(
      'Limpar pedidos antigos',
      'Esta ação irá remover permanentemente todos os pedidos finalizados ou cancelados com mais de 30 dias.\n\nEsta operação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: limparPedidosAntigos },
      ]
    );
  }

  function handleLogout() {
    Alert.alert('Sair do App', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => signOut(auth).then(() => navigation.replace('Login')).catch(() => Alert.alert('Erro', 'Não foi possível sair')),
      },
    ]);
  }

  function formatarData(data: any) {
    if (!data) return 'Data não disponível';
    try {
      if (data.toDate) return data.toDate().toLocaleDateString('pt-BR');
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  }

  const isAdmin = userData.papel === 'admin';

  return {
    userData,
    setUserData,
    editando,
    setEditando,
    novaSenha,
    setNovaSenha,
    confirmarSenha,
    setConfirmarSenha,
    senhaAtual,
    setSenhaAtual,
    showPasswordModal,
    setShowPasswordModal,
    loading,
    uploadingImage,
    activeTab,
    setActiveTab,
    refreshing,
    meusLanches,
    pedidosRecebidos,
    avaliacoesRecebidas,
    mediaAvaliacaoVendedor,
    graficos,
    carregarDadosUsuario,
    carregarDadosVendedor,
    onRefresh,
    escolherOpcaoImagem,
    processarImagem,
    atualizarPerfil,
    alterarSenha,
    limparPedidosAntigos,
    confirmarLimpeza,
    handleLogout,
    formatarData,
    isAdmin,
  };
}
