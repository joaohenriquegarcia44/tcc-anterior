import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

export function useEnderecoEntregaLogic(route: any, navigation: any) {
  const { cartTotal } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [entregaTipo, setEntregaTipo] = useState<'retirada' | 'entrega'>('retirada');
  const [selectedLocation, setSelectedLocation] = useState<Coordinate>({
    latitude: -23.5505,
    longitude: -46.6333,
  });
  const [region, setRegion] = useState<Region>({
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [addressText, setAddressText] = useState('');
  const [MapComponent, setMapComponent] = useState<any>(null);
  const [MarkerComponent, setMarkerComponent] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('react-native-maps').then((module) => {
        setMapComponent(() => module.default);
        setMarkerComponent(() => module.Marker);
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Não foi possível acessar sua localização');
          setLoading(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setSelectedLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        setAddressText(`${address.street}, ${address.name || address.district || ''}`);
      } catch (error) {
        console.log(error);
        Alert.alert('Erro', 'Não foi possível obter sua localização');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      setAddressText(`${address.street}, ${address.name || address.district || ''}`);
    } catch (error) {
      console.log(error);
      setAddressText('Localização selecionada');
    }
  };

  const usarLocalizacaoAtual = async () => {
    setLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setSelectedLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      setAddressText(`${address.street}, ${address.name || address.district || ''}`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter sua localização');
    } finally {
      setLoading(false);
    }
  };

  const confirmarEndereco = () => {
    if (entregaTipo === 'entrega') {
      navigation.navigate('ConfirmarPedido', {
        entregaTipo,
        endereco: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          texto: addressText || 'Localização selecionada',
        },
      });
    } else {
      navigation.navigate('ConfirmarPedido', {
        entregaTipo,
        endereco: null,
      });
    }
  };

  return {
    loading,
    entregaTipo,
    setEntregaTipo,
    selectedLocation,
    setSelectedLocation,
    region,
    setRegion,
    addressText,
    setAddressText,
    MapComponent,
    MarkerComponent,
    handleMapPress,
    usarLocalizacaoAtual,
    confirmarEndereco,
  };
}
