import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { auth, db } from '../database/database';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as Location from 'expo-location';

export function useConfigurarEntregaLogic(navigation: any) {
  const [loading, setLoading] = useState(true);
  const [pontoPartida, setPontoPartida] = useState({
    latitude: -23.5505,
    longitude: -46.6333,
  });
  const [valorPorKm, setValorPorKm] = useState('2.00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregarConfiguracoes();
    obterLocalizacaoAtual();
  }, []);

  async function obterLocalizacaoAtual() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Não foi possível acessar sua localização');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setPontoPartida({ latitude, longitude });
    } catch (error) {
      console.log(error);
    }
  }

  async function carregarConfiguracoes() {
    if (!auth.currentUser) return;
    try {
      const configRef = doc(db, 'configuracoes_entrega', auth.currentUser.uid);
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        const data = configSnap.data();
        if (data.pontoPartida) setPontoPartida(data.pontoPartida);
        setValorPorKm(data.valorPorKm?.toString() || '2.00');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarConfiguracoes() {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      const configRef = doc(db, 'configuracoes_entrega', auth.currentUser.uid);
      await setDoc(configRef, {
        pontoPartida,
        valorPorKm: parseFloat(valorPorKm),
        atualizadoEm: new Date(),
      });
      Alert.alert('Sucesso', 'Configurações salvas!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    } finally {
      setSaving(false);
    }
  }

  return {
    loading,
    pontoPartida,
    setPontoPartida,
    valorPorKm,
    setValorPorKm,
    saving,
    salvarConfiguracoes,
  };
}
