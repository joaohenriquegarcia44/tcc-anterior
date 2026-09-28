import React, { createContext, useState, ReactNode, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { auth } from "../database/database";

interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem: string;
  userId?: string;
  localRetirada?: string;
  quantidadeDisponivel?: number;
  /** Parcela do desconto de combo que acompanha este item (montado na Home). */
  descontoCombo?: number;
}

interface CartContextType {
  cart: CartItem[];
  adicionarAoCarrinho: (produto: any) => boolean;
  adicionarComboAoCarrinho: (produtos: any[], desconto: number) => boolean;
  removerItem: (id: string) => void;
  atualizarQuantidade: (id: string, novaQuantidade: number) => boolean;
  limparCarrinho: () => void;
  totalItens: number;
  totalDescontoCombo: number;
  getQuantidadeNoCarrinho: (produtoId: string) => number;
}

export const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalItens, setTotalItens] = useState(0);

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.quantidade, 0);
    setTotalItens(total);
  }, [cart]);

  const totalDescontoCombo = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.descontoCombo) || 0), 0),
    [cart]
  );

  function adicionarAoCarrinho(produto: any): boolean {
    const currentUser = auth.currentUser;
    // Impedir que o vendedor compre seu próprio lanche
    if (currentUser && produto.userId === currentUser.uid) {
      Alert.alert("Ação não permitida", "Você não pode comprar seu próprio lanche.");
      return false;
    }

    // Verificar estoque disponível
    const quantidadeEstoque = produto.quantidadeDisponivel;
    if (quantidadeEstoque !== undefined && quantidadeEstoque !== null) {
      const itemNoCarrinho = cart.find((item) => item.id === produto.id);
      const quantidadeAtual = itemNoCarrinho ? itemNoCarrinho.quantidade : 0;
      
      if (quantidadeAtual >= quantidadeEstoque) {
        Alert.alert("Estoque insuficiente", `Apenas ${quantidadeEstoque} unidades disponíveis`);
        return false;
      }
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === produto.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: 1,
          imagem: produto.imagem,
          userId: produto.userId,
          localRetirada: produto.localRetirada || "Local não informado",
          quantidadeDisponivel: produto.quantidadeDisponivel,
        },
      ];
    });
    return true;
  }

  /**
   * Adiciona um combo inteiro (lanche + bebida + doce) de uma vez.
   * O desconto é rateado proporcionalmente entre os itens, então a parcela
   * de cada um continua fazendo sentido se o cliente remover algum depois.
   */
  function adicionarComboAoCarrinho(produtos: any[], desconto: number): boolean {
    const currentUser = auth.currentUser;
    if (!produtos.length) return false;

    for (const produto of produtos) {
      if (currentUser && produto.userId === currentUser.uid) {
        Alert.alert("Ação não permitida", "Você não pode comprar seu próprio lanche.");
        return false;
      }

      const estoque = produto.quantidadeDisponivel;
      if (estoque !== undefined && estoque !== null) {
        const jaNoCarrinho = cart.find((item) => item.id === produto.id);
        const atual = jaNoCarrinho ? jaNoCarrinho.quantidade : 0;
        if (atual >= estoque) {
          Alert.alert("Estoque insuficiente", `Apenas ${estoque} unidades disponíveis`);
          return false;
        }
      }
    }

    const subtotal = produtos.reduce((soma, p) => soma + (Number(p.preco) || 0), 0);
    if (subtotal <= 0) return false;

    const descontoFinal = Math.max(0, Math.min(Number(desconto) || 0, subtotal));

    let acumulado = 0;
    const parcelas = produtos.map((produto, indice) => {
      if (indice === produtos.length - 1) {
        return Math.max(0, descontoFinal - acumulado);
      }
      const parcela = descontoFinal * ((Number(produto.preco) || 0) / subtotal);
      acumulado += parcela;
      return parcela;
    });

    setCart((prevCart) => {
      let novo = [...prevCart];

      produtos.forEach((produto, indice) => {
        const parcela = parcelas[indice];
        const existente = novo.find((item) => item.id === produto.id);

        if (existente) {
          novo = novo.map((item) =>
            item.id === produto.id
              ? {
                  ...item,
                  quantidade: item.quantidade + 1,
                  descontoCombo: (item.descontoCombo || 0) + parcela,
                }
              : item
          );
          return;
        }

        novo = [
          ...novo,
          {
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1,
            imagem: produto.imagem,
            userId: produto.userId,
            localRetirada: produto.localRetirada || "Local não informado",
            quantidadeDisponivel: produto.quantidadeDisponivel,
            descontoCombo: parcela,
          },
        ];
      });

      return novo;
    });

    return true;
  }

  function removerItem(id: string) {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  }
  function atualizarQuantidade(id: string, novaQuantidade: number): boolean {
    if (novaQuantidade < 1) {
      removerItem(id);
      return true;
    }
    
    // Verificar estoque disponível
    const itemNoCarrinho = cart.find((item) => item.id === id);
    if (itemNoCarrinho && itemNoCarrinho.quantidadeDisponivel !== undefined) {
      if (novaQuantidade > itemNoCarrinho.quantidadeDisponivel) {
        Alert.alert("Estoque insuficiente", `Apenas ${itemNoCarrinho.quantidadeDisponivel} unidades disponíveis`);
        return false;
      }
    }
    
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantidade: novaQuantidade } : item))
    );
    return true;
  }

  function limparCarrinho() {
    setCart([]);
  }

  function getQuantidadeNoCarrinho(produtoId: string): number {
    const item = cart.find((item) => item.id === produtoId);
    return item ? item.quantidade : 0;
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        adicionarAoCarrinho,
        adicionarComboAoCarrinho,
        removerItem,
        atualizarQuantidade,
        limparCarrinho,
        totalItens,
        totalDescontoCombo,
        getQuantidadeNoCarrinho,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}