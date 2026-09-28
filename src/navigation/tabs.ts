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
