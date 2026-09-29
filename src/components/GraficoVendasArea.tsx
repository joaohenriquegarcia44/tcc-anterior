import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, LayoutChangeEvent } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Line,
  Path,
  Rect,
  Stop,
  Text as TextoSvg,
  LinearGradient as GradienteSvg,
} from 'react-native-svg';
import { colors, borderRadius, spacing } from '../styles/theme';
import { formatarMoeda } from '../hooks/useVendasLogic';

type Ponto = { label: string; valor: number };

type Props = {
  dados: Ponto[];
  altura?: number;
};

const MARGEM_ESQUERDO = 48;
const MARGEM_DIREITA = 10;
const MARGEM_TOPO = 16;
const MARGEM_INFERIOR = 26;

const LARGURA_TOOLTIP = 116;
const ALTURA_TOOLTIP = 52;

const RetanguloAnimado = Animated.createAnimatedComponent(Rect);

/** Arredonda o topo do eixo Y para um número "redondo" com ~4 divisões. */
function escalaBonita(max: number) {
  if (!isFinite(max) || max <= 0) return { topo: 250, passo: 250 / 5 };

  const alvo = max / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(alvo)));
  const norm = alvo / magnitude;
  const multiplicador = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;

  const passo = multiplicador * magnitude;
  return { topo: Math.ceil(max / passo) * passo, passo };
}

/** Rótulo curto para caber na margem: R$ 0 · R$ 500 · R$ 2.500 · R$ 12,5k. */
function rotuloEixo(valor: number) {
  if (valor >= 10000) {
    const mil = valor / 1000;
    return `R$ ${mil >= 100 ? Math.round(mil) : mil.toFixed(1).replace('.', ',')}k`;
  }
  return `R$ ${Math.round(valor).toLocaleString('pt-BR')}`;
}

/**
 * Gráfico de linha/área desenhado com react-native-svg.
 * Linha e área em vermelho, grid discreto, pontos tocáveis e tooltip no toque.
 */
export default function GraficoVendasArea({ dados, altura = 200 }: Props) {
  const [largura, setLargura] = useState(0);
  const [indice, setIndice] = useState<number | null>(null);

  const progresso = useRef(new Animated.Value(0)).current;
  const fadeTooltip = useRef(new Animated.Value(0)).current;

  // Desenho progressivo da esquerda para a direita.
  useEffect(() => {
    progresso.setValue(0);
    Animated.timing(progresso, {
      toValue: 1,
      duration: 850,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [dados, progresso]);

  useEffect(() => {
    Animated.timing(fadeTooltip, {
      toValue: indice === null ? 0 : 1,
      duration: 140,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [indice, fadeTooltip]);

  const geometria = useMemo(() => {
    const seguro = dados.length > 0 ? dados : [{ label: '', valor: 0 }];
    const maxValor = Math.max(...seguro.map((d) => d.valor), 0);
    const { topo, passo } = escalaBonita(maxValor);

    const larguraPlot = Math.max(0, largura - MARGEM_ESQUERDO - MARGEM_DIREITA);
    const alturaPlot = Math.max(0, altura - MARGEM_TOPO - MARGEM_INFERIOR);
    const stepX = seguro.length > 1 ? larguraPlot / (seguro.length - 1) : 0;

    const px = (i: number) => MARGEM_ESQUERDO + i * stepX;
    const py = (v: number) => MARGEM_TOPO + alturaPlot - (topo > 0 ? v / topo : 0) * alturaPlot;

    const linha = seguro
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(2)},${py(d.valor).toFixed(2)}`)
      .join(' ');

    const base = MARGEM_TOPO + alturaPlot;
    const area =
      seguro.length > 0
        ? `${linha} L${px(seguro.length - 1).toFixed(2)},${base.toFixed(2)} ` +
          `L${px(0).toFixed(2)},${base.toFixed(2)} Z`
        : '';

    const grade: { y: number; valor: number }[] = [];
    for (let v = 0; v <= topo + 0.001; v += passo) {
      grade.push({ y: py(v), valor: v });
    }

    return { pontos: seguro, topo, px, py, linha, area, grade, base, stepX };
  }, [dados, largura, altura]);

  function selecionarEm(x: number) {
    const { stepX, pontos } = geometria;
    if (!stepX || pontos.length < 2) return;

    const bruto = Math.round((x - MARGEM_ESQUERDO) / stepX);
    const alvo = Math.max(0, Math.min(pontos.length - 1, bruto));
    setIndice(alvo);
  }

  function aoMedir(e: LayoutChangeEvent) {
    const nova = e.nativeEvent.layout.width;
    if (nova > 0 && Math.abs(nova - largura) > 1) setLargura(nova);
  }

  const selecionado = indice !== null ? geometria.pontos[indice] : null;
  const larguraRevelada = progresso.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, largura - MARGEM_DIREITA)],
  });

  const rotulosX = useMemo(() => {
    const total = geometria.pontos.length;
    if (total === 0) return [];
    const quantos = Math.min(7, total);
    return Array.from({ length: quantos }, (_, i) =>
      Math.round((i * (total - 1)) / (quantos - 1 || 1))
    );
  }, [geometria.pontos]);

  const totalPontos = geometria.pontos.length;
  const raioPonto = totalPontos > 20 ? 2 : 2.8;

  return (
    <View
      style={styles.container}
      onLayout={aoMedir}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => selecionarEm(e.nativeEvent.locationX)}
      onResponderMove={(e) => selecionarEm(e.nativeEvent.locationX)}
    >
      {largura > 0 && (
        <Svg width={largura} height={altura}>
          <Defs>
            <GradienteSvg id="preenchimentoVendas" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0.42} />
              <Stop offset="0.65" stopColor={colors.primary} stopOpacity={0.10} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
            </GradienteSvg>
            <ClipPath id="revelacao">
              <RetanguloAnimado x={0} y={0} height={altura} width={larguraRevelada} />
            </ClipPath>
          </Defs>

          {/* Grid discreto + rótulos do eixo Y */}
          {geometria.grade.map((linha) => (
            <React.Fragment key={`grade-${linha.valor}`}>
              <Line
                x1={MARGEM_ESQUERDO}
                y1={linha.y}
                x2={largura - MARGEM_DIREITA}
                y2={linha.y}
                stroke={colors.border}
                strokeWidth={1}
              />
              <TextoSvg
                x={MARGEM_ESQUERDO - 8}
                y={linha.y + 3}
                fill={colors.textLight}
                fontSize={9}
                textAnchor="end"
              >
                {rotuloEixo(linha.valor)}
              </TextoSvg>
            </React.Fragment>
          ))}

          {/* Área + linha + pontos, revelados progressivamente */}
          <G clipPath="url(#revelacao)">
            <Path d={geometria.area} fill="url(#preenchimentoVendas)" />
            <Path
              d={geometria.linha}
              stroke={colors.primary}
              strokeWidth={2.4}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
            {geometria.pontos.map((p, i) => (
              <Circle
                key={`ponto-${i}`}
                cx={geometria.px(i)}
                cy={geometria.py(p.valor)}
                r={i === indice ? 5 : raioPonto}
                fill={i === indice ? colors.white : colors.primary}
                stroke={i === indice ? colors.primary : 'none'}
                strokeWidth={i === indice ? 2.5 : 0}
              />
            ))}
          </G>

          {/* Rótulos do eixo X (aprox. 7 datas) */}
          {rotulosX.map((i, ordem) => {
            const ancoragem = ordem === 0 ? 'start' : ordem === rotulosX.length - 1 ? 'end' : 'middle';
            return (
              <TextoSvg
                key={`x-${i}`}
                x={geometria.px(i)}
                y={altura - 8}
                fill={colors.textLight}
                fontSize={9}
                textAnchor={ancoragem as 'start' | 'end' | 'middle'}
              >
                {geometria.pontos[i]?.label}
              </TextoSvg>
            );
          })}
        </Svg>
      )}

      {/* Tooltip flutuante do ponto selecionado */}
      {selecionado && indice !== null && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tooltip,
            {
              opacity: fadeTooltip,
              left: Math.max(
                0,
                Math.min(largura - LARGURA_TOOLTIP, geometria.px(indice) - LARGURA_TOOLTIP / 2)
              ),
              top: Math.max(0, geometria.py(selecionado.valor) - ALTURA_TOOLTIP - 12),
            },
          ]}
        >
          <Text style={styles.tooltipData}>{selecionado.label}</Text>
          <Text style={styles.tooltipValor}>{formatarMoeda(selecionado.valor)}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tooltip: {
    position: 'absolute',
    width: LARGURA_TOOLTIP,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#0D0B0C',
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  tooltipData: {
    color: colors.textLight,
    fontSize: 10,
    fontWeight: '700',
  },
  tooltipValor: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
});
