# 🤠 Mundo Charro - Bot de RRHH para WhatsApp

## Estructura del proyecto

```
mundocharro-bot/
├── src/
│   ├── index.js       ← Servidor Express + Webhook
│   ├── bot.js         ← Lógica del flujo de conversación
│   ├── sesiones.js    ← Manejo de estado por usuario
│   └── evaluador.js   ← Evaluación con Claude AI
├── .env.example       ← Plantilla de variables de entorno
├── .env               ← TUS claves (no subir a GitHub)
├── .gitignore
└── package.json
```

---

## Paso 1 — Instalar dependencias

```bash
cd mundocharro-bot
npm install
```

---

## Paso 2 — Configurar variables de entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Abre `.env` y llena tus credenciales:

   **Twilio** (en https://console.twilio.com):
   - `TWILIO_ACCOUNT_SID` → Account SID (empieza con AC...)
   - `TWILIO_AUTH_TOKEN` → Auth Token

   **Anthropic** (en https://console.anthropic.com):
   - `ANTHROPIC_API_KEY` → Tu API Key (empieza con sk-ant-...)

   > Para el Sandbox de WhatsApp, el número ya está configurado como:
   > `whatsapp:+14155238886` (déjalo así)

---

## Paso 3 — Levantar el servidor

```bash
npm start
```

Deberías ver:
```
🤠 ========================================
   MUNDO CHARRO - BOT DE RRHH
   Servidor corriendo en puerto 3000
   Webhook: http://localhost:3000/webhook
========================================
```

---

## Paso 4 — Exponer tu servidor con ngrok

Twilio necesita una URL pública para enviarte mensajes.

1. Descarga ngrok: https://ngrok.com/download
2. En una terminal nueva:
   ```bash
   ngrok http 3000
   ```
3. Copia la URL que aparece, algo como:
   ```
   https://abc123.ngrok.io
   ```

---

## Paso 5 — Configurar el Sandbox de Twilio

1. Ve a **Twilio Console → Messaging → Try it out → Send a WhatsApp message**
2. En la sección **Sandbox Settings**, en el campo:
   - **"When a message comes in"** pega:
     ```
     https://abc123.ngrok.io/webhook
     ```
   - Método: **HTTP POST**
3. Guarda los cambios.

---

## Paso 6 — Conectar tu WhatsApp al Sandbox

1. En la consola de Twilio verás un código como:
   ```
   join plenty-tiger
   ```
2. Desde tu WhatsApp personal, envía ese mensaje al número:
   ```
   +1 415 523 8886
   ```
3. Recibirás confirmación de Twilio.

---

## Paso 7 — ¡Probar el bot!

Escribe **"Hola"** al número del Sandbox y sigue el flujo.

---

## Flujo del bot

```
Hola
 └─> Menú Principal
      ├── 1. Colaborador        → Atención GT (FIN)
      ├── 2. Practicante        → Vinculación (FIN)
      └── 3. Candidato
           ├── 1. Vacante localizada
           │    └─> Recolección de datos (nombre, edad, ciudad,
           │        puesto, experiencia, escolaridad, horario, salario)
           │         └─> Evaluación IA (3 preguntas generadas por Claude)
           │              ├── VIABLE    → Agenda entrevista
           │              ├── MEDIO     → Revisión RRHH
           │              └── NO VIABLE → Agradecimiento
           ├── 2. Cartera de talento  → Registro (FIN)
           └── 3. Dar seguimiento     → Atención AT (FIN)
```

---

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el bot |
| `npm run dev` | Inicia con auto-reload (nodemon) |
| Escribe "hola" | Reinicia la conversación en cualquier momento |

---

## Notas importantes

- Las sesiones se guardan **en memoria**. Si reinicias el servidor, se borran.
- Para producción considera usar una base de datos (MongoDB, PostgreSQL) para persistir sesiones.
- Cuando estés listo para producción, necesitarás un número de WhatsApp Business aprobado por Meta/Twilio.
