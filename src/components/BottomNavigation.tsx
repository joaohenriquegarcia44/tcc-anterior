import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, hitSize } from '../styles/theme';

export type Aba = {
  key: string;
  label: string;
  icon: string;
};

type Props = {
  abas: Aba[];
  ativa: string;
  onSelect: (key: string) => void;
  /** Contador exibido em uma aba específica (ex.: badge do carrinho). */
  badge?: { key: string; valor: number } | null;
};

/** Navegação inferior: Início · Cardápio · Pedidos · Perfil. */
export default function BottomNavigation({ abas, ativa, onSelect, badge }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {abas.map((aba) => {
        const selecionada = aba.key === ativa;
        const valor = badge?.key === aba.key ? badge.valor : 0;

        return (
          <TouchableOpacity
            key={aba.key}
            activeOpacity={0.75}
            onPress={() => onSelect(aba.key)}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: selecionada }}
            accessibilityLabel={aba.label}
          >
            <View style={[styles.iconeCaixa, selecionada && styles.iconeCaixaAtivo]}>
              <Text style={[styles.icone, selecionada && styles.iconeAtivo]}>{aba.icon}</Text>
              {valor > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>{valor > 99 ? '99+' : valor}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.rotulo, selecionada && styles.rotuloAtivo]} numberOfLines={1}>
              {aba.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hitSize.min,
    gap: 3,
  },
  iconeCaixa: {
    width: 40,
    height: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeCaixaAtivo: {
    backgroundColor: colors.glowSoft,
  },
  icone: {
    fontSize: 18,
    opacity: 0.75,
  },
  iconeAtivo: {
    opacity: 1,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeTexto: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  rotulo: {
    color: colors.textLight,
    fontSize: 10,
    fontWeight: '600',
  },
  rotuloAtivo: {
    color: colors.primary,
    fontWeight: '800',
  },
});
