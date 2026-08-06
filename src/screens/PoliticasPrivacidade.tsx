// src/screens/PoliticasPrivacidade.tsx
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PoliticasPrivacidade() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.titulo}>Política de Privacidade e Isenção de Responsabilidade</Text>

        <Text style={styles.subtitulo}>1. Coleta e Uso de Informações</Text>
        <Text style={styles.texto}>
          O aplicativo "AL Lanches" coleta apenas os dados estritamente necessários para o funcionamento do serviço: nome, e-mail, telefone e endereço de entrega (quando fornecido). As informações de pagamento (PIX, cartão, etc.) são processadas exclusivamente pelo Mercado Pago, e o aplicativo não armazena nenhum dado bancário ou de cartão de crédito.
        </Text>

        <Text style={styles.subtitulo}>2. Compartilhamento de Dados</Text>
        <Text style={styles.texto}>
          Não compartilhamos seus dados pessoais com terceiros, exceto quando necessário para a execução do serviço (ex.: envio do endereço ao vendedor para entrega) ou por exigência legal. Os dados de pagamento são enviados diretamente ao Mercado Pago, que possui sua própria política de privacidade.
        </Text>

        <Text style={styles.subtitulo}>3. Segurança dos Dados</Text>
        <Text style={styles.texto}>
          Empregamos medidas de segurança razoáveis para proteger suas informações, mas nenhum sistema é 100% invulnerável. O usuário reconhece que a transmissão de dados pela Internet pode estar sujeita a interceptação ou violação.
        </Text>

        <Text style={styles.subtitulo}>4. Isenção de Responsabilidade (Disclaimer)</Text>
        <Text style={styles.textoDestaque}>
          O desenvolvedor do aplicativo não se responsabiliza por quaisquer danos, perdas ou prejuízos decorrentes de:
        </Text>
        <Text style={styles.lista}>
          • Acesso não autorizado aos seus dados por terceiros, incluindo ataques hackers, phishing, ou violação de segurança no seu dispositivo ou na conexão de Internet.
        </Text>
        <Text style={styles.lista}>
          • Falhas ou indisponibilidade do serviço de pagamento Mercado Pago, incluindo erros no processamento de PIX, cartão de crédito, ou qualquer outro meio de pagamento.
        </Text>
        <Text style={styles.lista}>
          • Uso indevido do aplicativo por terceiros que obtenham seu login e senha.
        </Text>
        <Text style={styles.lista}>
          • Problemas na entrega dos produtos decorrentes de informações incorretas fornecidas pelo comprador (endereço, horário, etc.).
        </Text>
        <Text style={styles.lista}>
          • Danos morais, diretos ou indiretos, resultantes do uso do aplicativo ou da impossibilidade de uso.
        </Text>

        <Text style={styles.subtitulo}>5. Responsabilidade sobre Pagamentos</Text>
        <Text style={styles.texto}>
          O aplicativo apenas gera um QR Code PIX via integração com a API do Mercado Pago. O processamento, a confirmação e a segurança do pagamento são de **responsabilidade exclusiva do Mercado Pago**. O desenvolvedor do aplicativo não tem acesso ao saldo, extratos ou qualquer informação bancária do usuário ou do vendedor. Em caso de cobrança indevida, estorno ou falha no pagamento, o usuário deve resolver diretamente com o Mercado Pago.
        </Text>

        <Text style={styles.subtitulo}>6. Consentimento</Text>
        <Text style={styles.texto}>
          Ao usar este aplicativo, você declara ter lido e concordado com esta política de privacidade e com os termos de isenção de responsabilidade aqui contidos.
        </Text>

        <Text style={styles.subtitulo}>7. Alterações nesta Política</Text>
        <Text style={styles.texto}>
          Reservamo-nos o direito de modificar esta política a qualquer momento. As alterações entram em vigor imediatamente após a publicação no aplicativo. Recomendamos que o usuário revise esta página periodicamente.
        </Text>

        <Text style={styles.ultimaLinha}>Última atualização: Junho de 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  content: { padding: 20 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#333" },
  subtitulo: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#FF6B6B" },
  texto: { fontSize: 14, color: "#666", lineHeight: 22, marginBottom: 10 },
  textoDestaque: { fontSize: 14, fontWeight: "bold", color: "#e74c3c", marginBottom: 10, marginTop: 10 },
  lista: { fontSize: 14, color: "#666", lineHeight: 22, marginLeft: 16, marginBottom: 6 },
  ultimaLinha: { fontSize: 12, color: "#999", textAlign: "center", marginTop: 30, marginBottom: 40 },
});