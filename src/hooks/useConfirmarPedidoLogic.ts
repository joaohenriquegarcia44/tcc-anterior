import { useContext, useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { CartContext } from '../services/CartContext';
import { auth, db } from '../database/database';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

export function useConfirmarPedidoLogic(route: any, navigation: any) {
  const dataRecebida = route.params?.dataRetirada;

  const { cart } = useContext(CartContext);
  const [metodoPagamento] = useState<string>('pix');
  const [userData, setUserData] = useState<any>({});
  const [pontosUsuario, setPontosUsuario] = useState(0);
  const [usandoPontos, setUsandoPontos] = useState(false);
  const [processandoPix, setProcessandoPix] = useState(false);
  const [configsVendedores, setConfigsVendedores] = useState<Record<string, { reaisGasto: number; reaisDesconto: number }>>({});
  const [creditosFidelidade, setCreditosFidelidade] = useState<Record<string, number>>({});

  // 🔥 Constantes (fallback padrão)
  const REAIS_POR_PONTO = 5;
  const DESCONTO_PADRAO = 0.5;

  // 🔥 Vendedores envolvidos neste pedido
  const vendedoresIds = useMemo(() => Array.from(new Set(cart.map((i: any) => i.userId).filter(Boolean))) as string[], [cart]);

  // 🔥 Subtotal por vendedor
  const subtotalPorVendedor = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((item: any) => {
      if (!item.userId) return;
      const preco = typeof item.preco === 'number' ? item.preco : parseFloat(item.preco);
      const qtd = typeof item.quantidade === 'number' ? item.quantidade : parseInt(item.quantidade);
      map[item.userId] = (map[item.userId] || 0) + (isNaN(preco) ? 0 : preco) * (isNaN(qtd) ? 0 : qtd);
    });
    return map;
  }, [cart]);

  // 🔥 Valores derivados do carrinho (calculados com useMemo para performance e reatividade)
  const total = useMemo(() => {
    const soma = Object.values(subtotalPorVendedor).reduce((s, v) => s + (v || 0), 0);
    console.log('📊 Total calculado:', soma); // 🔍 Log para debug (pode remover depois)
    return soma;
  }, [subtotalPorVendedor]);

  // 🔥 Bonificação (desconto de fidelidade) disponível por vendedor
  const descontoDisponivelPorVendedor = useMemo(() => {
    const map: Record<string, number> = {};
    vendedoresIds.forEach((vendedorId: string) => {
      const config = configsVendedores[vendedorId] || { reaisGasto: REAIS_POR_PONTO, reaisDesconto: DESCONTO_PADRAO };
      const subtotal = subtotalPorVendedor[vendedorId] || 0;
      const credit = creditosFidelidade[vendedorId] || 0;
      map[vendedorId] = Math.min(credit, subtotal);
    });
    return map;
  }, [vendedoresIds, configsVendedores, creditosFidelidade, subtotalPorVendedor]);

  const descontoDisponivel = useMemo(() => Object.values(descontoDisponivelPorVendedor).reduce((s, v) => s + (v || 0), 0), [descontoDisponivelPorVendedor]);

  const descontoPontos = useMemo(() => {
    if (!usandoPontos) return 0;
    return Math.min(total, descontoDisponivel);
  }, [usandoPontos, total, descontoDisponivel]);

  // 🔥 Pontos (R$ de crédito) que o cliente ganhará nesta compra por vendedor
  const bonificacaoGanhadaPorVendedor = useMemo(() => {
    const map: Record<string, number> = {};
    vendedoresIds.forEach((vendedorId: string) => {
      const config = configsVendedores[vendedorId] || { reaisGasto: REAIS_POR_PONTO, reaisDesconto: DESCONTO_PADRAO };
      const subtotal = subtotalPorVendedor[vendedorId] || 0;
      map[vendedorId] = Math.floor(subtotal / config.reaisGasto) * config.reaisDesconto;
    });
    return map;
  }, [vendedoresIds, configsVendedores, subtotalPorVendedor]);

  const pontosGanhos = useMemo(() => Object.values(bonificacaoGanhadaPorVendedor).reduce((s, v) => s + (v || 0), 0), [bonificacaoGanhadaPorVendedor]);

  const totalComDesconto = useMemo(() => total - descontoPontos, [total, descontoPontos]);
  const totalFinal = useMemo(() => totalComDesconto, [totalComDesconto]);

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
        const creditos = data.creditosFidelidade || {};
        setCreditosFidelidade(creditos);

        const configs: Record<string, { reaisGasto: number; reaisDesconto: number }> = {};
        for (const vendedorId of vendedoresIds) {
          try {
            const vendedorDoc = await getDoc(doc(db, 'usuarios', vendedorId));
            if (vendedorDoc.exists()) {
              const b = vendedorDoc.data().bonificacao;
              configs[vendedorId] = {
                reaisGasto: typeof b?.reaisGasto === 'number' ? b.reaisGasto : REAIS_POR_PONTO,
                reaisDesconto: typeof b?.reaisDesconto === 'number' ? b.reaisDesconto : DESCONTO_PADRAO,
              };
            }
          } catch (error) {
            console.log(error);
          }
        }
        setConfigsVendedores(configs);
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
    if (descontoDisponivel <= 0) {
      Alert.alert('Sem Crédito', 'Você ainda não tem crédito de fidelidade para usar neste vendedor.');
      return;
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
    const codigoNumerico = gerarCodigoNumerico();

    const creditosAtualizados = { ...creditosFidelidade };

    for (const [vendedorId, itens] of pedidosPorVendedor) {
      const idUnico = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const subtotal = itens.reduce((sum: number, item: any) => sum + (item.preco || 0) * (item.quantidade || 0), 0);
      const descontoVendedor = usandoPontos ? Math.min(creditosAtualizados[vendedorId] || 0, subtotal) : 0;
      const incremento = bonificacaoGanhadaPorVendedor[vendedorId] || 0;

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
        subtotal,
        descontoPontos: descontoVendedor,
        total: subtotal - descontoVendedor,
        dataRetirada,
        metodoPagamento,
        pontosGanhos: incremento,
        status: status,
        qrCode: idUnico,
        codigoNumerico,
        paymentIntentId: paymentIntentId || null,
        avaliado: false,
        criadoEm: new Date(),
      };
      const docRef = await addDoc(collection(db, 'pedidos'), pedido);
      pedidosCriados.push({ ...pedido, id: docRef.id });

      const novoCredito = (creditosAtualizados[vendedorId] || 0) - descontoVendedor + incremento;
      creditosAtualizados[vendedorId] = novoCredito;
    }

    const userRef = doc(db, 'usuarios', auth.currentUser!.uid);
    const updateData: any = { creditosFidelidade: creditosAtualizados };
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

  const metodosPagamento = [
    { id: 'pix', nome: '📱 PIX', descricao: 'Pague via QR Code PIX' },
  ];

  const dataRetiradaObj = calcularDataRetirada();

  return {
    cart,
    metodoPagamento,
    userData,
    pontosUsuario,
    usandoPontos,
    descontoDisponivel,
    processandoPix,
    formatarData,
    toggleUsarPontos,
    pagarComPIX,
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