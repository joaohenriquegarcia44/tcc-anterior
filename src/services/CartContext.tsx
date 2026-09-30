import React, { createContext, useState, ReactNode, useEffect, useMemo, useRef } from "react";
import { Alert, AppState } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../database/database";
import {
  consumir,
  devolver,
  estenderParaPagamento,
  liberarExpiradas,
  reservar,
  soltarTodas,
} from "./reservas";

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
  /** Epoch ms: quando esta linha perde o estoque reservado. */
  expiraEm?: number;
  /** true quando o pedido já foi criado: o estoque não volta mais. */
  pedidoCriado?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  adicionarAoCarrinho: (produto: any, quantidade?: number) => Promise<boolean>;
  adicionarComboAoCarrinho: (produtos: any[], desconto: number) => Promise<boolean>;
  removerItem: (id: string) => void;
  atualizarQuantidade: (id: string, novaQuantidade: number) => Promise<boolean>;
  /** Esvazia devolvendo ao estoque o que ainda estava reservado. */
  limparCarrinho: () => void;
  /** Estica a reserva: o pedido foi criado e o cliente ainda vai pagar. */
  marcarComoPedido: (pedidoId: string) => void;
  /** Pedido pago: consome a reserva e esvazia o carrinho. */
  finalizarCompra: () => Promise<void>;
  totalItens: number;
  totalDescontoCombo: number;
  getQuantidadeNoCarrinho: (produtoId: string) => number;
}

/** De quanto em quanto tempo o carrinho olha o relógio para tirar o que venceu. */
const INTERVALO_CHECAGEM = 5_000;

export const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalItens, setTotalItens] = useState(0);
  // O timer precisa do carrinho mais recente sem recriar o intervalo a cada tecla.
  const cartRef = useRef<CartItem[]>(cart);
  cartRef.current = cart;

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.quantidade, 0);
    setTotalItens(total);
  }, [cart]);

  const totalDescontoCombo = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.descontoCombo) || 0), 0),
    [cart]
  );

  /** Tira do carrinho tudo que passou do prazo e devolve ao estoque. */
  function descartarVencidos() {
    const vencidos = cartRef.current.filter(
      (item) => !item.pedidoCriado && !!item.expiraEm && item.expiraEm <= Date.now()
    );
    if (!vencidos.length) return;

    setCart((atual) => atual.filter((item) => !vencidos.some((v) => v.id === item.id)));
    vencidos.forEach((item) => devolver(item.id, item.quantidade));

    const nomes = vencidos.map((item) => item.nome).join(", ");
    Alert.alert(
      "Tempo esgotado",
      `${nomes} ${vencidos.length === 1 ? "saiu do carrinho" : "saíram do carrinho"} para voltar ao estoque do vendedor.`
    );
  }

  useEffect(() => {
    if (!cart.length) return;

    const intervalo = setInterval(descartarVencidos, INTERVALO_CHECAGEM);
    // Ao voltar do app do banco o tempo já pode ter esgotado.
    const assinatura = AppState.addEventListener("change", (estado) => {
      if (estado === "active") descartarVencidos();
    });

    return () => {
      clearInterval(intervalo);
      assinatura.remove();
    };
  }, [cart.length]);

  /**
   * Sessão nova: reserva vencida de uma sessão anterior (app fechado, pedido
   * abandonado) volta ao estoque. Na troca de conta, quem estava antes solta
   * o que tinha reservado — o carrinho dele também morre com a sessão.
   */
  useEffect(() => {
    const anterior = { uid: auth.currentUser?.uid ?? null };

    const cancelar = onAuthStateChanged(auth, (usuario) => {
      const uidAtual = usuario?.uid ?? null;
      if (uidAtual !== anterior.uid) soltarTodas(anterior.uid);
      anterior.uid = uidAtual;

      cartRef.current = [];
      setCart([]);
      if (uidAtual) liberarExpiradas();
    });

    return cancelar;
  }, []);

  async function adicionarAoCarrinho(produto: any, quantidade = 1): Promise<boolean> {
    const currentUser = auth.currentUser;
    // Impedir que o vendedor compre seu próprio lanche
    if (currentUser && produto.userId === currentUser.uid) {
      Alert.alert("Ação não permitida", "Você não pode comprar seu próprio lanche.");
      return false;
    }

    const jaNoCarrinho = cartRef.current.find((item) => item.id === produto.id);
    const quantidadeAtual = jaNoCarrinho ? jaNoCarrinho.quantidade : 0;

    // O estoque sai do cardápio agora, não na hora de pagar.
    const reserva = await reservar(produto, quantidade);
    if (!reserva.ok) {
      const limite = Number(produto.quantidadeDisponivel);
      if (Number.isFinite(limite)) {
        const restante = Math.max(0, limite - quantidadeAtual);
        Alert.alert(
          "Estoque insuficiente",
          restante > 0 ? `Apenas ${restante} unidades disponíveis` : "Não há mais unidades disponíveis"
        );
      } else {
        Alert.alert("Não foi possível adicionar", "Tente novamente em instantes.");
      }
      return false;
    }

    setCart((atual) => {
      const existente = atual.find((item) => item.id === produto.id);
      if (existente) {
        return atual.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                quantidade: item.quantidade + quantidade,
                expiraEm: reserva.expiraEm,
                pedidoCriado: false,
              }
            : item
        );
      }

      return [
        ...atual,
        {
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade,
          imagem: produto.imagem,
          userId: produto.userId,
          localRetirada: produto.localRetirada || "Local não informado",
          quantidadeDisponivel: produto.quantidadeDisponivel,
          expiraEm: reserva.expiraEm,
        },
      ];
    });

    return true;
  }

  /**
   * Adiciona um combo inteiro (lanche + bebida + doce) de uma vez.
   * O desconto é rateado proporcionalmente entre os itens, então a parcela
   * de cada um continua fazendo sentido se o cliente remover algum depois.
   * Se algum item não tiver estoque, nada é reservado e nada entra.
   */
  async function adicionarComboAoCarrinho(produtos: any[], desconto: number): Promise<boolean> {
    const currentUser = auth.currentUser;
    if (!produtos.length) return false;

    for (const produto of produtos) {
      if (currentUser && produto.userId === currentUser.uid) {
        Alert.alert("Ação não permitida", "Você não pode comprar seu próprio lanche.");
        return false;
      }
    }

    const subtotal = produtos.reduce((soma, p) => soma + (Number(p.preco) || 0), 0);
    if (subtotal <= 0) return false;

    const reservas = [];
    for (const produto of produtos) {
      const reserva = await reservar(produto, 1);
      if (!reserva.ok) {
        // Desfaz o que já foi reservado para não segurar estoque à toa.
        reservas.forEach((r) => devolver(r.id, 1));
        const limite = Number(produto.quantidadeDisponivel);
        if (Number.isFinite(limite)) {
          Alert.alert("Estoque insuficiente", `Não há unidades de ${produto.nome} para montar o combo.`);
        } else {
          Alert.alert("Não foi possível montar o combo", "Tente novamente em instantes.");
        }
        return false;
      }
      reservas.push({ id: produto.id, expiraEm: reserva.expiraEm });
    }

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

    // Todas as reservas compartilham o mesmo prazo: um prazo só para o combo.
    const expiraEm = Math.max(...reservas.map((r) => r.expiraEm));

    setCart((atual) => {
      let novo = [...atual];

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
                  expiraEm,
                  pedidoCriado: false,
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
            expiraEm,
          },
        ];
      });

      return novo;
    });

    return true;
  }

  function removerItem(id: string) {
    const item = cartRef.current.find((i) => i.id === id);
    if (!item) return;

    setCart((atual) => atual.filter((i) => i.id !== id));
    if (!item.pedidoCriado) devolver(item.id, item.quantidade);
  }

  async function atualizarQuantidade(id: string, novaQuantidade: number): Promise<boolean> {
    const item = cartRef.current.find((i) => i.id === id);
    if (!item) return false;

    if (novaQuantidade < 1) {
      removerItem(id);
      return true;
    }

    const delta = novaQuantidade - item.quantidade;
    if (delta === 0) return true;

    if (delta > 0) {
      // Só faz sentido reservar mais se a linha ainda está segurando estoque.
      if (item.pedidoCriado) {
        setCart((atual) =>
          atual.map((i) => (i.id === id ? { ...i, quantidade: novaQuantidade } : i))
        );
        return true;
      }

      const reserva = await reservar({ ...item, quantidadeDisponivel: item.quantidadeDisponivel }, delta);
      if (!reserva.ok) {
        const limite = Number(item.quantidadeDisponivel);
        const restante = Number.isFinite(limite) ? Math.max(0, limite - item.quantidade) : 0;
        Alert.alert(
          "Estoque insuficiente",
          restante > 0 ? `Apenas ${restante} unidades disponíveis` : "Não há mais unidades disponíveis"
        );
        return false;
      }

      setCart((atual) =>
        atual.map((i) =>
          i.id === id
            ? { ...i, quantidade: novaQuantidade, expiraEm: reserva.expiraEm, pedidoCriado: false }
            : i
        )
      );
      return true;
    }

    // Diminuir devolve a diferença ao estoque e não estica o prazo.
    const devolvido = Math.min(Math.abs(delta), item.quantidade);
    if (!item.pedidoCriado) devolver(item.id, devolvido);

    setCart((atual) =>
      atual.map((i) =>
        i.id === id ? { ...i, quantidade: novaQuantidade, pedidoCriado: false } : i
      )
    );
    return true;
  }

  /** Esvazia devolvendo ao estoque o que ainda estava reservado. */
  function limparCarrinho() {
    cartRef.current.forEach((item) => {
      if (!item.pedidoCriado) devolver(item.id, item.quantidade);
    });
    setCart([]);
  }

  /** O pedido foi criado: a reserva vira janela de pagamento. */
  function marcarComoPedido(pedidoId: string) {
    const itens = cartRef.current;
    setCart((atual) => atual.map((item) => ({ ...item, pedidoCriado: true })));
    if (itens.length) estenderParaPagamento(itens.map((item) => item.id), pedidoId);
  }

  /** Pedido pago: o estoque fica consumido e o carrinho some. */
  async function finalizarCompra() {
    const itens = cartRef.current;
    setCart([]);
    await consumir(itens.map((item) => item.id));
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
        marcarComoPedido,
        finalizarCompra,
        totalItens,
        totalDescontoCombo,
        getQuantidadeNoCarrinho,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}