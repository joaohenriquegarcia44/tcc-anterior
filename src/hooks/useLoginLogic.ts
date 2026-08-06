import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../database/database';

export function useLoginLogic(navigation: any, isNavigatorReady: boolean) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigationTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isNavigatorReady) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        navigation.replace('Home');
      }
    });

    return () => unsubscribe();
  }, [isNavigatorReady, navigation]);

  async function fazerLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Atenção', 'Digite um e-mail válido');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      if (!userCredential.user.emailVerified) {
        Alert.alert('E-mail não verificado', 'Por favor, verifique seu e-mail antes de fazer login');
        return;
      }
    } catch (error: any) {
      if (error.code === 'auth/invalid-email')
        Alert.alert('Erro', 'E-mail inválido');
      else if (error.code === 'auth/user-disabled')
        Alert.alert('Erro', 'Usuário desativado');
      else if (error.code === 'auth/user-not-found')
        Alert.alert('Erro', 'Usuário não encontrado');
      else if (error.code === 'auth/wrong-password')
        Alert.alert('Erro', 'Senha incorreta');
      else
        Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function esqueciSenha() {
    if (!email) {
      Alert.alert('Atenção', 'Digite seu e-mail para redefinir a senha');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', 'Enviamos um e-mail para redefinir sua senha');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  }

  function irParaCadastro() {
    navigation.navigate('Cadastro');
  }

  function irParaTermos() {
    navigation.navigate('TermosDeUso');
  }

  function irParaPoliticas() {
    navigation.navigate('PoliticasPrivacidade');
  }

  return {
    email,
    setEmail,
    senha,
    setSenha,
    loading,
    showPassword,
    setShowPassword,
    fazerLogin,
    esqueciSenha,
    irParaCadastro,
    irParaTermos,
    irParaPoliticas,
  };
}
