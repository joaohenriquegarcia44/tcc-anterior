import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { colors, borderRadius, hitSize, spacing } from '../styles/theme';

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  onSubmit?: () => void;
  autoFocus?: boolean;
};

/** Busca arredondada e legível, com ícone de lupa. */
export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar lanches...',
  style,
  onSubmit,
  autoFocus,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icone}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        accessibilityLabel={placeholder}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={12}
          style={styles.limpar}
          accessibilityLabel="Limpar busca"
        >
          <Text style={styles.limparTexto}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    minHeight: hitSize.min,
    gap: spacing.sm,
  },
  icone: {
    fontSize: 15,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 10,
  },
  limpar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  limparTexto: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
});
