import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, borderRadius, spacing } from '../styles/theme';

const { width, height } = Dimensions.get('window');

/**
 * Abertura do Al-lanches.
 * Mostra enquanto o Firebase resolve a sessão (ver App.tsx).
 */
export default function Splash() {
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const subir = useRef(new Animated.Value(24)).current;
  const brilho = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(subir, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(brilho, {
            toValue: 0.7,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(brilho, {
            toValue: 0.35,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, [fade, subir, brilho]);

  return (
    <View style={styles.container}>
      {/* brilho vermelho de fundo */}
      <Animated.View style={[styles.brilho, { opacity: brilho }]} pointerEvents="none" />
      <LinearGradient
        colors={['rgba(181,0,18,0.35)', 'transparent']}
        style={[styles.visor, { top: -height * 0.12 }]}
        pointerEvents="none"
      />

      <Animated.View
        style={[styles.centro, { opacity: fade, transform: [{ translateY: subir }] }]}
      >
        <LinearGradient
          colors={['#FF5A63', '#FF1E2D', '#B50012']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoCaixa}
        >
          <Image source={require('../../assets/icon.png')} style={styles.logoImagem} resizeMode="cover" />
          <View style={styles.burgerBadge}>
            <Text style={styles.burgerEmoji}>🍔</Text>
          </View>
        </LinearGradient>

        <Text style={styles.nome}>
          Al<Text style={styles.nomeDestaque}>-lanches</Text>
        </Text>

        <View style={styles.sloganCaixa}>
          <Text style={styles.slogan}>SABOR NO IF</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.rodape, { paddingBottom: insets.bottom + spacing.xl, opacity: fade }]}>
        <Text style={styles.frase}>
          Seus lanches favoritos,{'\n'}mais perto de você!
        </Text>
        <Text style={styles.instituto}>Instituto Federal</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  brilho: {
    position: 'absolute',
    top: -140,
    alignSelf: 'center',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: colors.primary,
  },
  visor: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: width,
  },
  centro: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoCaixa: {
    width: 118,
    height: 118,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImagem: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  burgerBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  burgerEmoji: {
    fontSize: 19,
  },
  nome: {
    marginTop: spacing.xl,
    color: colors.white,
    fontFamily: fonts.logo,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nomeDestaque: {
    color: colors.primary,
  },
  sloganCaixa: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 5,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  slogan: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 5,
  },
  rodape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  frase: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
  },
  instituto: {
    color: colors.textLight,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
});
