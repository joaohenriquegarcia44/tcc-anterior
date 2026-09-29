import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Carrinho from "../screens/Carrinho";
import Login from "../screens/Login";
import Cadastro from "../screens/Cadastro";
import Home from "../screens/Home";
import Produto from "../screens/Produto";
import ConfirmarPedido from "../screens/ConfirmarPedido";
import QRCodePedido from "../screens/QRCodePedido";
import AvaliarProduto from "../screens/AvaliarProduto";
import CriarLanche from "../screens/CriarLanche";
import PainelVendedor from "../screens/PainelVendedor";
import EditarLanche from "../screens/EditarLanche";
import LerQRCode from "../screens/LerQRCode";
import Perfil from "../screens/Perfil";
import Cardapio from "../screens/Cardapio";
import Fidelidade from "../screens/Fidelidade";
import PedidosRecebidos from "../screens/PedidosRecebidos";
import MeusPedidos from "../screens/MeusPedidos";
import ExibirQRCode from "../screens/ExibirQRCode";
import AvaliarPedido from "../screens/AvaliarPedido";
import GraficoVendas from "../screens/GraficoVendas";
import Vendas from "../screens/Vendas";
import PoliticasPrivacidade from "../screens/PoliticasPrivacidade";
import TermosDeUso from "../screens/TermosDeUso";
import { colors, header } from "../styles/theme";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: header.background },
  headerTitleStyle: {
    color: header.titleColor,
    fontSize: header.titleSize,
    fontWeight: "700" as const,
  },
  headerTintColor: header.tintColor,
  headerShadowVisible: header.shadowVisible,
  headerBackTitle: "",
  headerTitleAlign: "center" as const,
  contentStyle: { backgroundColor: colors.background },
};

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Cadastro" component={Cadastro} options={{ title: "Criar conta" }} />
      <Stack.Screen name="Cardapio" component={Cardapio} options={{ headerShown: false }} />
      <Stack.Screen name="Fidelidade" component={Fidelidade} options={{ title: "Fidelidade" }} />
      <Stack.Screen name="Perfil" component={Perfil} options={{ headerShown: false }} />
      <Stack.Screen name="LerQRCode" component={LerQRCode} options={{ title: "Ler QR Code" }} />
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="CriarLanche" component={CriarLanche} options={{ title: "Criar Lanche" }} />
      <Stack.Screen name="EditarLanche" component={EditarLanche} options={{ title: "Editar Lanche" }} />
      <Stack.Screen name="PainelVendedor" component={PainelVendedor} options={{ title: "Painel do vendedor" }} />
      <Stack.Screen name="Produto" component={Produto} options={{ title: "" }} />
      <Stack.Screen name="Carrinho" component={Carrinho} options={{ title: "Seu carrinho" }} />
      <Stack.Screen name="ConfirmarPedido" component={ConfirmarPedido} options={{ title: "" }} />
      <Stack.Screen name="QRCodePedido" component={QRCodePedido} options={{ title: "" }} />
      <Stack.Screen name="ExibirQRCode" component={ExibirQRCode} options={{ title: "Pagamento PIX" }} />
      <Stack.Screen name="AvaliarProduto" component={AvaliarProduto} options={{ title: "Avaliar Produto" }} />
      <Stack.Screen name="PedidosRecebidos" component={PedidosRecebidos} options={{ title: "Pedidos pendentes" }} />
      <Stack.Screen name="MeusPedidos" component={MeusPedidos} options={{ headerShown: false }} />
      <Stack.Screen name="AvaliarPedido" component={AvaliarPedido} options={{ title: "" }} />
      <Stack.Screen name="GraficoVendas" component={GraficoVendas} options={{ title: "Gráficos" }} />
      <Stack.Screen name="Vendas" component={Vendas} options={{ title: "Vendas" }} />
      <Stack.Screen name="PoliticasPrivacidade" component={PoliticasPrivacidade} options={{ title: "Política de Privacidade" }} />
      <Stack.Screen name="TermosDeUso" component={TermosDeUso} options={{ title: "Termos de Uso" }} />
    </Stack.Navigator>
  );
}