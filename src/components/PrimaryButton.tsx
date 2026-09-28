import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, View, StyleProp, ViewStyle } from 'react-native';
import { colors, borderRadius, hitSize } from '../styles/theme';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold' | 'white';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

/** Botão principal do app. Grande, vermelho e fácil de tocar. */
export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  compact = false,
}: Props) {
  const inativo = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={inativo}
      style={[
        styles.base,
        compact && styles.compact,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'gold' && styles.gold,
        variant === 'white' && styles.white,
        variant === 'ghost' && styles.ghost,
        inativo && styles.desabilitado,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
        {loading ? (
        <ActivityIndicator color={variant === 'gold' || variant === 'white' ? colors.background : colors.white} />
      ) : (
        <View style={styles.conteudo}>
          {!!icon && <Text style={styles.icone}>{icon}</Text>}
          <Text
            style={[
              styles.texto,
              variant === 'ghost' && styles.textoGhost,
              variant === 'gold' && styles.textoGold,
              variant === 'white' && styles.textoWhite,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: hitSize.comfortable,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  compact: {
    minHeight: hitSize.min,
    paddingHorizontal: 18,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  gold: {
    backgroundColor: colors.secondary,
  },
  white: {
    backgroundColor: colors.white,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  icone: {
    fontSize: 17,
  },
  texto: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  textoGhost: {
    color: colors.primaryText,
  },
  textoGold: {
    color: colors.background,
  },
  textoWhite: {
    color: colors.primary,
  },
  desabilitado: {
    opacity: 0.55,
  },
});
