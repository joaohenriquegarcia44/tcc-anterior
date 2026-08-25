import { useContext, useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { CartContext } from '../services/CartContext';
import { auth, db } from '../database/database';
import { collection, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export function useConfirmarPedidoLogic(route: any, navigation: any) {
  const dataRecebida = route.params?.dataRetirada;

  const { cart, limparCarrinho } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<string>('presencial');
  const [userData, setUserData] = useState<any>({});
  const [pontosUsuario, setPontosUsuario] = useState(0);
  const [usandoPontos, setUsandoPontos] = useState(false);
  const [pontosParaUsar, setPontosParaUsar] = useState(0);
  const [processandoPix, setProcessandoPix] = useState(false);

  // 🔥 Constantes
  const REAIS_POR_PONTO = 5;

  // 🔥 Valores derivados do carrinho (calculados com useMemo para performance e reatividade)
  const total = useMemo(() => {
    const soma = cart.reduce((sum, item) => {
      const preco = typeof item.preco === 'number' ? item.preco : parseFloat(item.preco);
      const qtd = typeof item.quantidade === 'number' ? item.quantidade : parseInt(item.quantidade);
      return sum + (isNaN(preco) ? 0 : preco) * (isNaN(qtd) ? 0 : qtd);
    }, 0);
    console.log('📊 Total calculado:', soma); // 🔍 Log para debug (pode remover depois)
    return soma;
  }, [cart]);

  const descontoPontos = useMemo(() => {
    if (!usandoPontos) return 0;
    return Math.min(total, pontosParaUsar * 0.10);
  }, [usandoPontos, total, pontosParaUsar]);

  const totalComDesconto = useMemo(() => total - descontoPontos, [total, descontoPontos]);
  const totalFinal = useMemo(() => totalComDesconto, [totalComDesconto]);
  const pontosGanhos = useMemo(() => Math.floor(total / REAIS_POR_PONTO), [total]);

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  async function carregarDadosUsuario() {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setPontosUsuario(data.pontos || 0);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function gerarCodigoNumerico() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function calcularDataRetirada() {
    if (dataRecebida) return new Date(dataRecebida);
    const hoje = new Date();
    let dataRetirada = new Date(hoje);
    dataRetirada.setDate(hoje.getDate() + 1);
    if (dataRetirada.getDay() === 6) dataRetirada.setDate(dataRetirada.getDate() + 2);
    else if (dataRetirada.getDay() === 0) dataRetirada.setDate(dataRetirada.getDate() + 1);
    return dataRetirada;
  }

  function formatarData(data: Date) {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return `${dias[data.getDay()]}, ${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  function toggleUsarPontos() {
    if (pontosUsuario === 0) {
      Alert.alert('Sem Pontos', 'Você ainda não tem pontos para usar.');
      return;
    }
    if (!usandoPontos) {
      const maxPontosPossiveis = Math.floor(total / 0.10);
      const pontosRecomendados = Math.min(pontosUsuario, maxPontosPossiveis);
      setPontosParaUsar(pontosRecomendados);
    } else {
      setPontosParaUsar(0);
    }
    setUsandoPontos(!usandoPontos);
  }

  async function criarPedidoNoFirestore(status: string = 'pendente', paymentIntentId?: string) {
    const pedidosPorVendedor = new Map();
    cart.forEach((item) => {
      const vendedorId = item.userId;
      if (!vendedorId) return;
      if (!pedidosPorVendedor.has(vendedorId)) pedidosPorVendedor.set(vendedorId, []);
      pedidosPorVendedor.get(vendedorId).push(item);
    });

    if (pedidosPorVendedor.size === 0) {
      throw new Error('Nenhum vendedor identificado');
    }

    const pedidosCriados = [];
    const dataRetirada = calcularDataRetirada();
    const pontosGanhosValue = pontosGanhos; // usa o useMemo
    const codigoNumerico = gerarCodigoNumerico();
    const totalFinalValue = totalFinal;

    for (const [vendedorId, itens] of pedidosPorVendedor) {
      const idUnico = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const pedido = {
        compradorId: auth.currentUser!.uid,
        compradorNome: userData.nome || auth.currentUser!.email?.split('@')[0],
        vendedorId,
        lanches: itens.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          quantidade: item.quantidade,
          imagem: item.imagem,
          localRetirada: item.localRetirada || 'Não informado',
        })),
        subtotal: itens.reduce((sum: number, item: any) => sum + item.preco * item.quantidade, 0),
        descontoPontos: descontoPontos / pedidosPorVendedor.size,
        total: totalFinalValue / pedidosPorVendedor.size,
        dataRetirada,
        metodoPagamento,
        pontosGanhos: pontosGanhosValue,
        pontosUsados: usandoPontos ? pontosParaUsar : 0,
        status: status,
        qrCode: idUnico,
        codigoNumerico,
        paymentIntentId: paymentIntentId || null,
        avaliado: false,
        criadoEm: new Date(),
      };
      const docRef = await addDoc(collection(db, 'pedidos'), pedido);
      pedidosCriados.push({ ...pedido, id: docRef.id });
    }

    const userRef = doc(db, 'usuarios', auth.currentUser!.uid);
    const updateData: any = { pontos: increment(pontosGanhosValue) };
    if (usandoPontos && pontosParaUsar > 0) updateData.pontos = increment(pontosGanhosValue - pontosParaUsar);
    await updateDoc(userRef, updateData);

    return pedidosCriados;
  }

  async function pagarComPIX() {
    console.log('🔥 Botão PIX clicado');
    if (!auth.currentUser) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }
    if (cart.length === 0) {
      Alert.alert('Erro', 'Carrinho vazio');
      return;
    }
    for (const item of cart) {
      if (item.userId && item.userId === auth.currentUser.uid) {
        Alert.alert('Erro', 'Seu pedido contém um lanche que você mesmo vende. Remova-o do carrinho.');
        return;
      }
    }

    setProcessandoPix(true);
    try {
      const pedidosCriados = await criarPedidoNoFirestore('aguardando_pagamento');
      const pedidoId = pedidosCriados[0].id;
      const totalValue = totalFinal;
      const itens = cart.map(i => ({ nome: i.nome, quantidade: i.quantidade, preco: i.preco }));
      const email = auth.currentUser.email;

      if (!email) {
        throw new Error('Email do usuário não encontrado para pagamento PIX');
      }

      const apiUrl = 'https://us-central1-appcaradasrapaduras.cloudfunctions.net/createPreference';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: totalValue, itens, pedidoId, email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText || 'Falha na comunicação'}`);
      }

      const data = await response.json();
      if (data.qrCode) {
        navigation.navigate('ExibirQRCode', {
          qrCode: data.qrCode,
          qrCodeText: data.qrCodeText,
          pedidoId: pedidoId,
        });
      } else {
        throw new Error('Resposta da API não contém QR Code');
      }
    } catch (error: any) {
      console.error('Erro no PIX:', error);
      Alert.alert('Erro', error.message || 'Não foi possível iniciar o pagamento PIX');
    } finally {
      setProcessandoPix(false);
    }
  }

  async function finalizarPedidoPresencial() {
    if (!auth.currentUser) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }
    if (cart.length === 0) {
      Alert.alert('Erro', 'Carrinho vazio');
      return;
    }
    for (const item of cart) {
      if (item.userId && item.userId === auth.currentUser.uid) {
        Alert.alert('Erro', 'Seu pedido contém um lanche que você mesmo vende. Remova-o do carrinho.');
        return;
      }
    }

    setLoading(true);
    try {
      const pedidosCriados = await criarPedidoNoFirestore('pendente');
      const codigoNumerico = pedidosCriados[0].codigoNumerico;
      Alert.alert(
        '✅ Pedido Confirmado!',
        `🔢 Código de retirada: ${codigoNumerico}\n\nApresente o QR Code ou o código ao vendedor.`,
        [
          {
            text: 'Ver QR Code',
            onPress: () => {
              limparCarrinho();
              navigation.replace('QRCodePedido', { pedidos: pedidosCriados });
            },
          },
        ]
      );
    } catch (error: any) {
      console.log('Erro ao finalizar pedido:', error);
      Alert.alert('Erro', `Não foi possível finalizar o pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const metodosPagamento = [
    { id: 'presencial', nome: '💰 Pagamento Presencial', descricao: 'Pague na hora da retirada' },
    { id: 'pix', nome: '📱 PIX', descricao: 'Pague via QR Code PIX' },
    { id: 'credito', nome: '💳 Cartão de Crédito', descricao: 'Pague com cartão na retirada' },
    { id: 'debito', nome: '💳 Cartão de Débito', descricao: 'Pague com cartão na retirada' },
  ];

  const dataRetiradaObj = calcularDataRetirada();

  return {
    cart,
    loading, setLoading,
    metodoPagamento, setMetodoPagamento,
    userData,
    pontosUsuario,
    usandoPontos,
    pontosParaUsar,
    processandoPix,
    formatarData,
    toggleUsarPontos,
    pagarComPIX,
    finalizarPedidoPresencial,
    metodosPagamento,
    TOTAL: total,
    DESCONTO_PONTOS: descontoPontos,
    TOTAL_COM_DESCONTO: totalComDesconto,
    TOTAL_FINAL: totalFinal,
    PONTOS_GANHOS: pontosGanhos,
    REAIS_POR_PONTO,
    dataRetiradaObj,
  };
}