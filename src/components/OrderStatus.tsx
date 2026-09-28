import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../styles/theme';

export type Etapa = {
  key: string;
  titulo: string;
  descricao: string;
};

export const ETAPAS_PADRAO: Etapa[] = [
  { key: 'confirmado', titulo: 'Pedido confirmado', descricao: 'Sua compra foi recebida!' },
  { key: 'preparando', titulo: 'Preparando', descricao: 'Seu lanche está sendo preparado pela nossa equipe.' },
  { key: 'pronto', titulo: 'Pronto para retirada', descricao: 'Seu pedido está pronto! É só vir buscar no IF.' },
];

type Props = {
  etapas?: Etapa[];
  /** Índice da etapa atual (0 = ainda não confirmou, 2 = pronto). */
  atual?: number;
  cancelado?: boolean;
};

/** Timeline visual de acompanhamento do pedido. */
export default function OrderStatus({ etapas = ETAPAS_PADRAO, atual = 0, cancelado = false }: Props) {
  return (
    <View style={styles.container}>
      {etapas.map((etapa, i) => {
        const concluida = i < atual;
        const ativa = i === atual && !cancelado;

        return (
          <View key={etapa.key} style={styles.linha}>
            <View style={styles.trilho}>
              <View
                style={[
                  styles.bola,
                  concluida && styles.bolaConcluida,
                  ativa && styles.bolaAtiva,
                  cancelado && styles.bolaCancelada,
                ]}
              >
                <Text style={styles.bolaTexto}>{concluida ? '✓' : i + 1}</Text>
              </View>
              {i < etapas.length - 1 && (
                <View style={[styles.conector, concluida && styles.conectorConcluido]} />
              )}
            </View>

            <View style={[styles.conteudo, i < etapas.length - 1 && styles.conteudoComEspaco]}>
              <Text
                style={[
                  styles.titulo,
                  concluida && styles.tituloConcluido,
                  ativa && styles.tituloAtivo,
                  cancelado && styles.tituloCancelado,
                ]}
              >
                {etapa.titulo}
              </Text>
              <Text style={styles.descricao}>{etapa.descricao}</Text>
              {ativa && !cancelado && (
                <View style={styles.tagAgora}>
                  <Text style={styles.tagAgoraTexto}>AGORA</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  linha: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  trilho: {
    alignItems: 'center',
    width: 30,
  },
  bola: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bolaConcluida: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  bolaAtiva: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  bolaCancelada: {
    borderColor: colors.danger,
  },
  bolaTexto: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  conector: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  conectorConcluido: {
    backgroundColor: colors.success,
  },
  conteudo: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  conteudoComEspaco: {
    marginBottom: spacing.lg,
  },
  titulo: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: '700',
  },
  tituloConcluido: {
    color: colors.textSecondary,
  },
  tituloAtivo: {
    color: colors.white,
  },
  tituloCancelado: {
    color: colors.danger,
  },
  descricao: {
    color: colors.textLight,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  tagAgora: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    backgroundColor: colors.glowSoft,
  },
  tagAgoraTexto: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
