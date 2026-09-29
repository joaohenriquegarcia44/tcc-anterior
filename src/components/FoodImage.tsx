import React from 'react';
import { View, Text, StyleSheet, Image, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius } from '../styles/theme';

type Props = {
  /** URL remota (string) ou imagem local via require() (number). */
  uri?: string | number | null;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  radius?: number;
  /** Ícone/emoji exibido quando não há foto. */
  fallbackIcon?: string;
  /** Escurece a base da foto para o texto ficar legível por cima. */
  overlay?: boolean;
  children?: React.ReactNode;
};

/**
 * Foto de comida com placeholder elegante.
 * Regra 22: se a imagem do produto não existir, mostramos um visual de fallback
 * em vez de um espaço quebrado.
 */
export default function FoodImage({
  uri,
  style,
  imageStyle,
  radius = borderRadius.lg,
  fallbackIcon = '🍔',
  overlay = false,
  children,
}: Props) {
  const [erro, setErro] = React.useState(false);
  const semFoto = !uri || erro;
  // require() devolve um número; URL vem como string.
  const source = typeof uri === 'number' ? uri : { uri: uri as string };

  return (
    <View style={[styles.container, { borderRadius: radius }, style]}>
      {semFoto ? (
        <LinearGradient
          colors={['#241416', '#0D0A0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.placeholder, { borderRadius: radius }]}
        >
          <Text style={styles.placeholderIcon}>{fallbackIcon}</Text>
        </LinearGradient>
      ) : (
        <Image
          source={source as any}
          style={[styles.image, { borderRadius: radius }, imageStyle]}
          resizeMode="cover"
          onError={() => setErro(true)}
        />
      )}

      {overlay && !semFoto && (
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.92)']}
          locations={[0, 0.45, 1]}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          pointerEvents="none"
        />
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 44,
    opacity: 0.65,
  },
});
