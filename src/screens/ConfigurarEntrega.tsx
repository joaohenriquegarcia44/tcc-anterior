import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useConfigurarEntregaLogic } from '../hooks/useConfigurarEntregaLogic';

export default function ConfigurarEntrega({ navigation }: any) {
  const {
    loading,
    pontoPartida,
    setPontoPartida,
    valorPorKm,
    setValorPorKm,
    saving,
    salvarConfiguracoes,
  } = useConfigurarEntregaLogic(navigation);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.titulo}>Configurar Entrega</Text>

        <Text style={styles.label}>📍 Ponto de partida (sua localização):</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: pontoPartida.latitude,
            longitude: pontoPartida.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          onPress={(e) => setPontoPartida(e.nativeEvent.coordinate)}
        >
          <Marker
            coordinate={pontoPartida}
            draggable
            onDragEnd={(e) => setPontoPartida(e.nativeEvent.coordinate)}
          />
        </MapView>
        <Text style={styles.coordenadas}>
          Lat: {pontoPartida.latitude.toFixed(6)} | Lng: {pontoPartida.longitude.toFixed(6)}
        </Text>

        <Text style={styles.label}>💰 Valor por km (R$):</Text>
        <TextInput
          style={styles.input}
          value={valorPorKm}
          onChangeText={setValorPorKm}
          keyboardType="numeric"
          placeholder="2.00"
        />

        <TouchableOpacity style={styles.saveButton} onPress={salvarConfiguracoes} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? "Salvando..." : "Salvar Configurações"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f8f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 8, color: '#333' },
  map: { width: '100%', height: 250, borderRadius: 12, marginBottom: 8 },
  coordenadas: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  saveButton: { backgroundColor: '#FF6B6B', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});