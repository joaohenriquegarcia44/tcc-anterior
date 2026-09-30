import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../styles/theme";

interface StarRatingProps {
  rating: number;
  onRatingPress?: (rating: number) => void;
  readonly?: boolean;
  /** Tamanho da estrela em px. Menor em linhas apertadas (ex.: cartão de avaliação). */
  tamanho?: number;
  style?: ViewStyle;
}

export default function StarRating({
  rating,
  onRatingPress,
  readonly = false,
  tamanho = 32,
  style,
}: StarRatingProps) {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => !readonly && onRatingPress && onRatingPress(i)}
          disabled={readonly}
          style={[styles.star, { marginHorizontal: tamanho * 0.12 }]}
        >
          <Text style={[styles.starIcon, tamanho !== 32 && { fontSize: tamanho }, i <= rating ? styles.starFilled : styles.starEmpty]}>
            {i <= rating ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  // `flexShrink` impede que a linha de estrelas estoure o card quando o
  // usuário aumenta a fonte do sistema.
  return <View style={[styles.container, style]}>{renderStars()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  star: {
    marginHorizontal: 4,
  },
  starIcon: {
    fontSize: 32,
  },
  starFilled: {
    color: colors.warning,
  },
  starEmpty: {
    color: colors.border,
  },
});
