import { useState } from 'react';
import { Alert } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../database/database';

export function useCadastroLogic(navigation: any) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function irParaTermos() {
    navigation.navigate('TermosDeUso');
  }

  function irParaPoliticas() {
    navigation.navigate('PoliticasPrivacidade');
  }

  async function cadastrar() {
    if (!nome || !telefone || !email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Atenção', 'Digite um e-mail válido');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (telefone.length < 10) {
      Alert.alert('Atenção', 'Digite um telefone válido com DDD');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await updateProfile(user, { displayName: nome });

      await sendEmailVerification(user);
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome,
        telefone,
        email,
        criadoEm: new Date(),
        pontos: 0,
        emailVerificado: false,
        papel: 'cliente',
      });

      Alert.alert(
        'Verifique seu e-mail',
        'Enviamos um link de confirmação para o seu e-mail.\n\nApós confirmar, faça login no aplicativo.',
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      );
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use')
        Alert.alert('Erro', 'Este e-mail já está cadastrado');
      else if (error.code === 'auth/invalid-email')
        Alert.alert('Erro', 'E-mail inválido');
      else if (error.code === 'auth/weak-password')
        Alert.alert('Erro', 'Senha muito fraca. Use pelo menos 6 caracteres');
      else
        Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    nome,
    setNome,
    telefone,
    setTelefone,
    email,
    setEmail,
    senha,
    setSenha,
    confirmarSenha,
    setConfirmarSenha,
    loading,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    irParaTermos,
    irParaPoliticas,
    cadastrar,
  };
}
