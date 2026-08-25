import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermosDeUso() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.titulo}>Termos de Uso</Text>
        <Text style={styles.data}>Última atualização: Junho de 2026</Text>

        <Text style={styles.subtitulo}>1. Aceitação dos Termos</Text>
        <Text style={styles.texto}>
          Ao baixar, acessar ou utilizar o aplicativo "AL Lanches" (doravante denominado "Aplicativo"),
          você declara estar ciente e concorda integralmente com estes Termos de Uso. Caso não concorde,
          você não deve utilizar o Aplicativo.
        </Text>

        <Text style={styles.subtitulo}>2. Descrição do Serviço</Text>
        <Text style={styles.texto}>
          O Aplicativo permite que usuários realizem pré-encomendas de lanches artesanais de vendedores
          cadastrados, com retirada presencial. O Aplicativo atua
          como intermediário entre compradores e vendedores, não sendo responsável pela qualidade dos
          produtos.
        </Text>

        <Text style={styles.subtitulo}>3. Cadastro e Conta</Text>
        <Text style={styles.texto}>
          Para utilizar o Aplicativo, você deve criar uma conta fornecendo informações verdadeiras e atualizadas.
          Você é responsável por manter a confidencialidade de suas credenciais de login e por todas as atividades
          realizadas em sua conta. Em caso de uso não autorizado, você deve comunicar imediatamente o administrador.
        </Text>

        <Text style={styles.subtitulo}>4. Compras e Pagamentos</Text>
        <Text style={styles.texto}>
          4.1. Ao finalizar um pedido, você concorda em pagar o valor total indicado, incluindo eventuais descontos aplicados.
        </Text>
        <Text style={styles.texto}>
          4.2. Os pagamentos podem ser realizados presencialmente (no ato da retirada) ou via PIX, processados
          exclusivamente pelo Mercado Pago. O Aplicativo não armazena dados bancários ou de cartões de crédito.
        </Text>
        <Text style={styles.texto}>
          4.3. Em caso de pagamento via PIX, a confirmação da transação é de responsabilidade do Mercado Pago.
          O Aplicativo não se responsabiliza por atrasos ou falhas no processamento.
        </Text>

        <Text style={styles.subtitulo}>5. Cancelamento e Estorno</Text>
        <Text style={styles.texto}>
          5.1. O comprador pode cancelar um pedido enquanto o status for "pendente". Após a confirmação do
          pagamento ou início da preparação do lanche, o cancelamento poderá não ser aceito.
        </Text>
        <Text style={styles.texto}>
          5.2. Em caso de necessidade de estorno, este será tratado diretamente entre comprador e vendedor,
          ou via Mercado Pago (se aplicável). O Aplicativo não realiza transações financeiras diretamente.
        </Text>

        <Text style={styles.subtitulo}>6. Responsabilidades do Usuário</Text>
        <Text style={styles.texto}>
          Você concorda em utilizar o Aplicativo de forma ética e legal, não praticando atos que possam
          prejudicar outros usuários ou o funcionamento do serviço. É proibido:
        </Text>
        <Text style={styles.lista}>
          • Utilizar dados falsos ou de terceiros sem autorização.
        </Text>
        <Text style={styles.lista}>
          • Tentar acessar áreas restritas ou realizar engenharia reversa no Aplicativo.
        </Text>
        <Text style={styles.lista}>
          • Anunciar lanches proibidos ou que violem normas sanitárias.
        </Text>

        <Text style={styles.subtitulo}>7. Limitação de Responsabilidade</Text>
        <Text style={styles.texto}>
          O Aplicativo é fornecido "no estado em que se encontra". Não garantimos que o serviço seja
          ininterrupto, livre de erros ou completamente seguro. Em nenhuma circunstância o desenvolvedor
          será responsável por danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso
          ou da impossibilidade de uso do Aplicativo, incluindo perda de dados, lucros cessantes ou
          interrupção de negócios.
        </Text>

        <Text style={styles.subtitulo}>8. Propriedade Intelectual</Text>
        <Text style={styles.texto}>
          Todo o conteúdo do Aplicativo (código, design, logotipos, imagens) é protegido por direitos
          autorais e pertence ao desenvolvedor ou aos seus licenciantes. É proibida a reprodução,
          distribuição ou modificação sem autorização expressa.
        </Text>

        <Text style={styles.subtitulo}>9. Modificações nos Termos</Text>
        <Text style={styles.texto}>
          Reservamo‑nos o direito de alterar estes Termos a qualquer momento. As alterações serão
          publicadas no Aplicativo e entrarão em vigor imediatamente. O uso continuado do Aplicativo
          após as alterações constitui sua aceitação dos novos termos.
        </Text>

        <Text style={styles.subtitulo}>10. Lei Aplicável e Foro</Text>
        <Text style={styles.texto}>
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da
          comarca de Sapucaia do Sul – RS para dirimir quaisquer controvérsias, com renúncia a qualquer
          outro, por mais privilegiado que seja.
        </Text>

        <Text style={styles.contato}>
          Em caso de dúvidas sobre estes Termos, entre em contato pelo e‑mail: aldelicias44@gmail.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  content: { padding: 20, paddingBottom: 40 },
  titulo: { fontSize: 28, fontWeight: "bold", marginBottom: 8, textAlign: "center", color: "#333" },
  data: { fontSize: 14, color: "#999", textAlign: "center", marginBottom: 24 },
  subtitulo: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#FF6B6B" },
  texto: { fontSize: 14, color: "#666", lineHeight: 22, marginBottom: 10 },
  lista: { fontSize: 14, color: "#666", lineHeight: 22, marginLeft: 16, marginBottom: 6 },
  contato: { fontSize: 14, color: "#FF6B6B", textAlign: "center", marginTop: 30, marginBottom: 20, fontWeight: "500" },
});