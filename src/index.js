// =============================================
//   Servidor principal - Mundo Charro Bot
//   Adaptado para Meta WhatsApp Cloud API
// =============================================

require("dotenv").config({ override: true });
const express = require("express");
const axios = require("axios");
const { procesarMensaje } = require("./bot");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "mundocharro2024";

// ─── VERIFICACIÓN DEL WEBHOOK (Meta lo llama 1 vez al configurar) ──
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado por Meta");
    res.status(200).send(challenge);
  } else {
    console.error("❌ Token de verificación incorrecto");
    res.sendStatus(403);
  }
});

// ─── RECEPCIÓN DE MENSAJES ──────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  // Meta espera siempre un 200 rápido
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // Ignorar notificaciones que no son mensajes (ej: status de entrega)
    if (!value?.messages) return;

    const mensaje = value.messages[0];

    // Solo procesar mensajes de texto
    if (mensaje.type !== "text") return;

    const telefono = mensaje.from; // Ej: 5217713900155
    const telefonoMeta = telefono.replace(/^521/, "52"); // Convierte 5217... a 527...
    const textoEntrante = mensaje.text.body;

    console.log(`📩 [${telefono}]: ${textoEntrante}`);

    const respuesta = await procesarMensaje(telefono, textoEntrante);

    // `null` = silencio del bot (ej. soporte humano en curso)
    if (!respuesta) {
      console.log(`🤫 [Bot silenciado → ${telefonoMeta}] (sin respuesta automática)`);
      return;
    }

    await enviarMensaje(telefonoMeta, respuesta);

    console.log(`📤 [Bot → ${telefonoMeta}]: ${respuesta.substring(0, 80)}...`);
  } catch (error) {
    console.error("❌ Error en webhook:", error.response?.data || error.message);
  }
});

// ─── FUNCIÓN PARA ENVIAR MENSAJES ──────────────────────────────────
async function enviarMensaje(telefono, texto) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: telefono,
      type: "text",
      text: { body: texto },
    },
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ─── HEALTH CHECK ───────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "✅ Mundo Charro Bot activo (Meta API)",
    timestamp: new Date().toISOString(),
  });
});

// ─── INICIO ─────────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🤠 ========================================
   MUNDO CHARRO - BOT DE RRHH
   Servidor corriendo en puerto ${PORT}
   Webhook: http://localhost:${PORT}/webhook
   Plataforma: Meta WhatsApp Cloud API
========================================
  `);
});
