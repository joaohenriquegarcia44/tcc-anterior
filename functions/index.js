const {defineSecret} = require('firebase-functions/params');
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const mercadopagoToken = defineSecret('MERCADOPAGO_TOKEN');

exports.createPreference = functions.https.onRequest(async (req, res) => {
  try {
    // ===== CORS =====
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    if (req.method !== 'POST') {
      return res.status(405).json({error: 'Method not allowed'});
    }

    // ===== Importação dinâmica do SDK =====
    const {MercadoPagoConfig, Preference} = require('mercadopago');

    // ===== Token =====
    const accessToken = mercadopagoToken.value();
    console.log('🔑 Token obtido?', !!accessToken);
    if (!accessToken) {
      console.error('❌ Token do Mercado Pago não configurado');
      return res.status(500).json({error: 'Token não configurado'});
    }

    // ===== Validação do body =====
    const {total, itens, pedidoId} = req.body;
    console.log('📦 Body recebido:', {total, itens, pedidoId});
    if (!total || !itens || !itens.length || !pedidoId) {
      return res.status(400).json({error: 'Dados incompletos'});
    }

    // ===== Cliente Mercado Pago =====
    const client = new MercadoPagoConfig({accessToken});
    const preference = new Preference(client);

    const body = {
      items: itens.map(item => ({
        title: item.nome,
        quantity: Number(item.quantidade),
        unit_price: Number(item.preco),
        currency_id: 'BRL',
      })),
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 1,
      },
      point_of_interaction: {
        type: 'CHECKOUT_PIX',
      },
      back_urls: {
        success: `allanches://pagamento?status=approved&pedidoId=${pedidoId}`,
        failure: `allanches://pagamento?status=rejected&pedidoId=${pedidoId}`,
        pending: `allanches://pagamento?status=pending&pedidoId=${pedidoId}`,
      },
      auto_return: 'approved',
      external_reference: pedidoId,
      notification_url: 'https://us-central1-appcaradasrapaduras.cloudfunctions.net/webhook',
    };

    console.log('📤 Enviando preferência para MP...');
    const response = await preference.create({body});
    console.log('✅ Preferência criada:', response.id);
    console.log('🔍 Resposta completa do MP:', JSON.stringify(response, null, 2));

    const transactionData = response.point_of_interaction?.transaction_data || {};
    const qrCodeBase64 = transactionData.qr_code_base64 || null;
    const qrCodeText = transactionData.qr_code || null;

    if (!qrCodeBase64) {
      console.error('❌ QR Code não gerado. Resposta do MP:', JSON.stringify(response, null, 2));
      return res.status(500).json({error: 'QR Code não gerado'});
    }

    res.status(200).json({
      preferenceId: response.id,
      qrCode: `data:image/png;base64,${qrCodeBase64}`,
      qrCodeText,
      externalReference: pedidoId,
    });

  } catch (error) {
    console.error('❌ Erro na função createPreference:', error);
    res.status(500).json({error: error.message || 'Erro interno ao criar pagamento'});
  }
});

exports.webhook = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method not allowed');
    }

    const {MercadoPagoConfig, Payment} = require('mercadopago');

    const accessToken = mercadopagoToken.value();
    if (!accessToken) {
      console.error('❌ Token do Mercado Pago não configurado');
      return res.status(500).send('Token não configurado');
    }

    const client = new MercadoPagoConfig({accessToken});
    const paymentResource = new Payment(client);

    const notification = req.body;
    console.log('📬 Webhook recebido:', JSON.stringify(notification, null, 2));

    if (notification.type === 'payment') {
      const paymentId = notification.data.id;
      const {body} = await paymentResource.get({id: paymentId});
      const {status, external_reference} = body;

      if (status === 'approved') {
        const pedidoRef = db.collection('pedidos').doc(external_reference);
        const pedidoSnap = await pedidoRef.get();
        if (!pedidoSnap.exists) {
          console.log(`⚠️ Pedido ${external_reference} não encontrado`);
          return res.status(200).send('OK');
        }

        const pedido = pedidoSnap.data();
        const batch = db.batch();
        batch.update(pedidoRef, {
          status: 'pago',
          pagoEm: admin.firestore.FieldValue.serverTimestamp(),
        });

        if (pedido.lanches && Array.isArray(pedido.lanches)) {
          for (const item of pedido.lanches) {
            const lancheRef = db.collection('lanches').doc(item.id);
            batch.update(lancheRef, {
              quantidadeDisponivel: admin.firestore.FieldValue.increment(-item.quantidade),
            });
          }
        }

        await batch.commit();
        console.log(`✅ Pedido ${external_reference} atualizado para PAGO.`);
      } else {
        console.log(`ℹ️ Pagamento ${paymentId} status: ${status}`);
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).send('Erro interno no webhook');
  }
});