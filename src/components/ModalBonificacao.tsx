import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Modal, Alert, ScrollView } from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../database/database";
import { colors, spacing, borderRadius, typography } from "../styles/theme";
import PrimaryButton from "./PrimaryButton";
import {
  DESCONTO_COMBO_PADRAO,
  MAX_PERCENTUAL_COMBO,
  MAX_TETO_COMBO,
  guardarDescontoCombo,
  normalizarDescontoCombo,
} from "../services/descontoCombo";

type Props = {
  visivel: boolean;
  onFechar: () => void;
};

/** Define a bonificação de fidelidade e o desconto que o vendedor dá no combo. */
export default function ModalBonificacao({ visivel, onFechar }: Props) {
  const [reaisGasto, setReaisGasto] = useState("5");
  const [reaisDesconto, setReaisDesconto] = useState("0.5");
  const [percentualCombo, setPercentualCombo] = useState(String(DESCONTO_COMBO_PADRAO.percentual));
  const [tetoCombo, setTetoCombo] = useState(String(DESCONTO_COMBO_PADRAO.teto));
  const [salvando, setSalvando] = useState(false);

  async function carregarBonificacao() {
    if (!auth.currentUser) return;
    try {
      const userSnap = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
      const dados = userSnap.data();
      const bonificacao = dados?.bonificacao;
      if (bonificacao) {
        setReaisGasto(String(bonificacao.reaisGasto ?? 5));
        setReaisDesconto(String(bonificacao.reaisDesconto ?? 0.5));
      }
      const combo = normalizarDescontoCombo(dados?.descontoCombo);
      setPercentualCombo(String(combo.percentual));
      setTetoCombo(String(combo.teto));
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (visivel) carregarBonificacao();
  }, [visivel]);

  async function salvarBonificacao() {
    if (!auth.currentUser) return;
    const gasto = parseFloat(reaisGasto.replace(",", "."));
    const desconto = parseFloat(reaisDesconto.replace(",", "."));
    if (isNaN(gasto) || gasto <= 0) {
      Alert.alert("Erro", "Informe um valor de gasto válido maior que zero");
      return;
    }
    if (isNaN(desconto) || desconto < 0) {
      Alert.alert("Erro", "Informe um valor de desconto válido");
      return;
    }

    const percentual = parseFloat(percentualCombo.replace(",", "."));
    if (isNaN(percentual) || percentual < 0) {
      Alert.alert("Erro", "Informe um percentual de desconto válido para o combo");
      return;
    }
    const teto = parseFloat(tetoCombo.replace(",", "."));
    if (isNaN(teto) || teto < 0) {
      Alert.alert("Erro", "Informe um teto de desconto válido para o combo");
      return;
    }

    const combo = normalizarDescontoCombo({ percentual, teto });

    setSalvando(true);
    try {
      await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
        bonificacao: { reaisGasto: gasto, reaisDesconto: desconto },
        descontoCombo: combo,
      });
      guardarDescontoCombo(auth.currentUser.uid, combo);
      Alert.alert("Sucesso", "Bonificação e desconto de combo atualizados!");
      onFechar();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar as configurações");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar}>
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>🎁 Bonificação e combo</Text>
          <Text style={styles.subtitle}>
            Defina quanto o cliente ganha de desconto a cada valor gasto e quanto desconto dá no
            combo dos seus lanches.
          </Text>

          <Text style={styles.label}>A cada R$ gasto</Text>
          <TextInput
            style={styles.input}
            value={reaisGasto}
            onChangeText={setReaisGasto}
            keyboardType="numeric"
            placeholder="Ex: 5"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.label}>gera R$ de desconto</Text>
          <TextInput
            style={styles.input}
            value={reaisDesconto}
            onChangeText={setReaisDesconto}
            keyboardType="numeric"
            placeholder="Ex: 0,5"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.hint}>
            Ex: a cada R$ {reaisGasto || "X"} gasto, o cliente acumula R$ {reaisDesconto || "Y"} de desconto
            de fidelidade.
          </Text>

          <View style={styles.divisor} />

          <Text style={styles.subtituloCombo}>Desconto do combo</Text>

          <Text style={styles.label}>Desconto de {percentualCombo || "0"}% no combo</Text>
          <TextInput
            style={styles.input}
            value={percentualCombo}
            onChangeText={setPercentualCombo}
            keyboardType="numeric"
            placeholder={`Ex: ${DESCONTO_COMBO_PADRAO.percentual}`}
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.label}>Teto de R$ por combo</Text>
          <TextInput
            style={styles.input}
            value={tetoCombo}
            onChangeText={setTetoCombo}
            keyboardType="numeric"
            placeholder={`Ex: ${DESCONTO_COMBO_PADRAO.teto}`}
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.hint}>
            No combo, o cliente paga menos o percentual, nunca passando do teto em reais. Limites:{" "}
            {MAX_PERCENTUAL_COMBO}% e R$ {MAX_TETO_COMBO.toFixed(2)}.
          </Text>

          <PrimaryButton
            title="Salvar"
            onPress={salvarBonificacao}
            loading={salvando}
            disabled={salvando}
            style={styles.salvar}
          />
          <PrimaryButton title="Cancelar" onPress={onFechar} variant="ghost" disabled={salvando} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", padding: spacing.xl },
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  title: { ...typography.h2, color: colors.white, marginBottom: spacing.sm, textAlign: "center" },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  divisor: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  subtituloCombo: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 15,
    backgroundColor: colors.input,
    color: colors.text,
    minHeight: 48,
  },
  hint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: spacing.lg,
    fontStyle: "italic",
    textAlign: "center",
  },
  salvar: { marginTop: spacing.xl, marginBottom: spacing.sm },
});
