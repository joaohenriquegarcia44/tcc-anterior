import React, { createContext, useState, ReactNode, useEffect } from "react";
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
}

interface CartContextType {
  cart: CartItem[];
  adicionarAoCarrinho: (produto: any) => boolean;
  removerItem: (id: string) => void;
  atualizarQuantidade: (id: string, novaQuantidade: number) => boolean;
  limparCarrinho: () => void;
  totalItens: number;
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
        removerItem,
        atualizarQuantidade,
        limparCarrinho,
        totalItens,
        getQuantidadeNoCarrinho,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}