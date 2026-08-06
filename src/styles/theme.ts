export const colors = {
  primary: '#FF6B6B',
  primaryDark: '#e05555',
  primaryLight: '#ff8e8e',
  secondary: '#4ECDC4',
  secondaryDark: '#3ab0a8',
  accent: '#FFE66D',
  success: '#27ae60',
  successLight: '#d4edda',
  warning: '#FFB800',
  danger: '#e74c3c',
  info: '#3498db',
  white: '#fff',
  background: '#f8f8f8',
  card: '#fff',
  text: '#333',
  textSecondary: '#666',
  textLight: '#999',
  border: '#eee',
  overlay: 'rgba(0,0,0,0.7)',
  shadow: '#000',
  category: {
    lanche: '#FF6B6B',
    bebida: '#4ECDC4',
    doce: '#FFE66D',
    promocao: '#FF9F40',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  round: 25,
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
};

export const typography = {
  h1: { fontSize: 24, fontWeight: 'bold' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: 'bold' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: 'bold' as const, color: colors.text },
  body: { fontSize: 14, color: colors.text },
  bodySmall: { fontSize: 12, color: colors.textSecondary },
  caption: { fontSize: 11, color: colors.textLight },
};

export const categories = [
  { id: 'todos', nome: 'Todos', icon: '🍽️', cor: colors.primary },
  { id: 'lanche', nome: 'Salgados', icon: '🍔', cor: colors.category.lanche },
  { id: 'bebida', nome: 'Bebidas', icon: '🥤', cor: colors.category.bebida },
  { id: 'doce', nome: 'Doces', icon: '🍰', cor: colors.category.doce },
  { id: 'promocao', nome: 'Promoções', icon: '🎉', cor: colors.category.promocao },
];
