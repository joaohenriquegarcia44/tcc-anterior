import { Aba } from '../components/BottomNavigation';

/**
 * Abas da navegação principal (regra 5 do design).
 * O carrinho NÃO é uma aba: ele fica no header com badge de quantidade.
 */
export const ABAS_PRINCIPAIS: Aba[] = [
  { key: 'Home', label: 'Início', icon: '🏠' },
  { key: 'Cardapio', label: 'Cardápio', icon: '🍽️' },
  { key: 'MeusPedidos', label: 'Pedidos', icon: '📋' },
  { key: 'Perfil', label: 'Perfil', icon: '👤' },
];

/**
 * Abas da área do vendedor/administrador. O `key` continua sendo o nome da
 * rota do stack, então `navigation.navigate(key)` funciona igual nas outras telas.
 * O Painel do Vendedor NÃO é aba: ele fica no botão do topo (HeaderVendedor).
 */
export const ABAS_VENDEDOR: Aba[] = [
  { key: 'Home', label: 'Início', icon: '🏠' },
  { key: 'Vendas', label: 'Vendas', icon: '📈' },
  { key: 'PedidosRecebidos', label: 'Pedidos', icon: '📋' },
];

/** Destino do botão do topo que abre o painel do vendedor. */
export const ROTA_PAINEL_VENDEDOR = 'PainelVendedor';

/**
 * Abas da navegação inferior. Quem vende não compra, então a aba "Pedidos"
 * some para ele e a área dele fica acessível pelo botão do topo.
 */
export function abasDoApp(ehVendedor: boolean): Aba[] {
  if (!ehVendedor) return ABAS_PRINCIPAIS;
  return ABAS_PRINCIPAIS.filter((aba) => aba.key !== 'MeusPedidos');
}
