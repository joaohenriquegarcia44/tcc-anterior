import React, { useEffect, useState, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { CartProvider, CartContext } from "./src/services/CartContext";
import { auth } from "./src/database/database";
import { onAuthStateChanged } from "firebase/auth";
import { Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useURL } from "expo-linking";
import { useFonts } from "expo-font";
import { DancingScript_700Bold } from "@expo-google-fonts/dancing-script";
import { PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { fonts } from "./src/styles/theme";
import Splash from "./src/screens/Splash";

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [fontesCarregadas] = useFonts({
    [fonts.logo]: DancingScript_700Bold,
    [fonts.display]: PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Splash enquanto o Firebase resolve a sessão e as fontes da identidade carregam.
  if (loading || !fontesCarregadas) {
    return (
      <SafeAreaProvider>
        <Splash />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const url = useURL();
  const { finalizarCompra } = useContext(CartContext);

  useEffect(() => {
    if (url) {
      console.log("Deep link recebido:", url);
      const urlParts = url.split("?");
      const queryParams = new URLSearchParams(urlParts[1]);
      const status = queryParams.get("status");

      if (status === "approved") {
        // Pagamento aprovado: o estoque reservado vira venda e o carrinho sai.
        finalizarCompra();
        Alert.alert("Pagamento aprovado!", "Seu pedido foi confirmado e será preparado.");
      } else if (status === "rejected") {
        Alert.alert("Pagamento recusado", "Tente novamente ou escolha outra forma de pagamento.");
      }
    }
  }, [url]);

  return <StackNavigator />;
}