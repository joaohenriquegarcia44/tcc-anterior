/**
 * Identidade visual do Al-lanches — "Sabor no IF"
 * Preto absoluto, vermelho intenso, detalhes em dourado.
 * Todas as chaves exportadas antes continuam existindo para não quebrar telas antigas.
 */

export const colors = {
  // Marca
  primary: '#FF1E2D',
  primaryDark: '#B50012',
  primaryLight: '#FF5A63',
  primaryText: '#FF6B6B',
  secondary: '#FFC400',
  secondaryDark: '#E0A800',
  accent: '#FFC400',
  purple: '#A78BFA',
  info: '#5DADE2',

  // Superfícies
  background: '#050505',
  surface: '#111111',
  surfaceAlt: '#1A1A1A',
  card: '#141414',
  cardElevated: '#1C1C1C',
  input: '#181818',
  overlay: 'rgba(0,0,0,0.80)',
  shadow: '#000000',

  // Texto
  white: '#FFFFFF',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textLight: '#6E6E6E',

  // Bordas
  border: '#242424',
  borderLight: '#2E2E2E',

  // Feedback
  success: '#3DD68C',
  warning: '#FFC400',
  danger: '#FF3B47',

  // Brilhos
  glow: 'rgba(255, 30, 45, 0.35)',
  glowSoft: 'rgba(255, 30, 45, 0.14)',
  goldGlow: 'rgba(255, 196, 0, 0.25)',

  category: {
    lanche: '#FF1E2D',
    bebida: '#FFC400',
    doce: '#FF5A63',
    promocao: '#FFC400',
  },
  categoryText: {
    lanche: '#FF1E2D',
    bebida: '#FFC400',
    doce: '#FF8A8F',
    promocao: '#FFC400',
  },
};

/** Categorias do cardápio. Os `id` NÃO mudam: o filtro do Firestore depende deles. */
export const categories = [
  { id: 'todos', nome: 'Todos', icon: '🍽️', cor: colors.primary },
  { id: 'lanche', nome: 'Salgados', icon: '🍔', cor: colors.primary },
  { id: 'bebida', nome: 'Bebidas', icon: '🥤', cor: colors.secondary },
  { id: 'doce', nome: 'Doces', icon: '🍰', cor: colors.primaryLight },
  { id: 'promocao', nome: 'Ofertas', icon: '🔥', cor: colors.secondary },
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  round: 999,
};

/** Toque mínimo confortável para alvos de toque (regra 17/18 do design). */
export const hitSize = {
  min: 44,
  comfortable: 52,
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 10,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const fonts = {
  logo: 'DancingScript_700Bold',
  display: 'PlayfairDisplay_700Bold',
};

export const typography = {
  logo: { fontFamily: fonts.logo, fontSize: 34, color: colors.white },
  h1: { fontSize: 26, fontWeight: '800' as const, color: colors.text },
  h2: { fontSize: 21, fontWeight: '800' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 14, color: colors.textSecondary },
  bodyStrong: { fontSize: 14, fontWeight: '600' as const, color: colors.text },
  bodySmall: { fontSize: 12, color: colors.textSecondary },
  caption: { fontSize: 11, color: colors.textLight },
  price: { fontSize: 18, fontWeight: '800' as const, color: colors.primary },
};

/** Configuração do header nativo do React Navigation. */
export const header = {
  background: colors.surface,
  titleColor: colors.text,
  tintColor: colors.primary,
  borderColor: colors.border,
  titleSize: 17,
  shadowVisible: false,
};
