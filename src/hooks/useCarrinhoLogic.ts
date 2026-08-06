import { useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { CartContext } from '../services/CartContext';
import { auth } from '../database/database';

const TAXA_ENTREGA = 0;
const DESCONTO_MAXIMO = 5;

export function useCarrinhoLogic(navigation: any) {
  const { cart, removerItem, atualizarQuantidade, limparCarrinho } = useContext(CartContext);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dataRetirada, setDataRetirada] = useState<Date>(() => {
    const hoje = new Date();
    let data = new Date(hoje);
    data.setDate(hoje.getDate() + 1);
    if (data.getDay() === 6) data.setDate(data.getDate() + 2);
    else if (data.getDay() === 0) data.setDate(data.getDate() + 1);
    return data;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    setIsLoggedIn(!!user);
    calcularTotais();
  }, [cart]);

  function calcularTotais() {
    const novoSubtotal = cart.reduce((total, item) => total + item.preco * item.quantidade, 0);
    setSubtotal(novoSubtotal);
    setTotal(novoSubtotal + TAXA_ENTREGA);
  }

  function aplicarDescontoFidelidade(compras: number) {
    const desconto = Math.floor(compras / 10) * DESCONTO_MAXIMO;
    return Math.min(desconto, subtotal);
  }

  function formatarData(data: Date) {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return `${dias[data.getDay()]}, ${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const hoje = new Date();
      if (selectedDate < hoje) {
        Alert.alert('Data inválida', 'Escolha uma data a partir de amanhã.');
        return;
      }
      setDataRetirada(selectedDate);
    }
  };

  async function finalizarPedido() {
    if (!isLoggedIn) {
      Alert.alert('Login Necessário', 'Você precisa estar logado para finalizar o pedido', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Fazer Login', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }
    if (cart.length === 0) {
      Alert.alert('Carrinho Vazio', 'Adicione itens ao carrinho antes de finalizar');
      return;
    }
    navigation.navigate('EnderecoEntrega', {
      cartTotal: total,
      dataRetirada
    });
  }

  return {
    cart,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    subtotal,
    total,
    isLoggedIn,
    dataRetirada,
    setDataRetirada,
    showDatePicker,
    setShowDatePicker,
    calcularTotais,
    aplicarDescontoFidelidade,
    formatarData,
    onDateChange,
    finalizarPedido,
  };
}
