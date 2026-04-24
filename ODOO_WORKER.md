# Worker de Cloudflare para Integración con Odoo CRM

Este documento describe cómo crear y configurar el worker de Cloudflare que permitirá crear leads en Odoo CRM cuando un usuario solicite contacto a través del chatbot de WhatsApp.

## 📋 Descripción

Cuando un usuario escribe "contactar" en el chatbot, el sistema:
1. Genera un ID de caso único
2. Envía los datos al worker de Cloudflare
3. El worker crea un lead en el módulo CRM de Odoo
4. El chatbot responde al usuario con el número de caso

## 🚀 Creación del Worker

### Paso 1: Crear nuevo worker en Cloudflare

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navega a **Workers & Pages**
3. Haz clic en **Create Application**
4. Selecciona **Create Worker**
5. Nómbralo: `mundocharro-rrhh-leads` (o el nombre que prefieras)

### Paso 2: Reemplazar el código del worker

Copia y pega el siguiente código en el editor del worker:

```javascript
// ============================================================
// WORKER RRHH - Chatbot Mundo Charro
// Endpoints: crear_lead_chatbot
// ============================================================

const ODOO_COMPANY_ID = 1;
const ODOO_COMPANY_CONTEXT = {
  allowed_company_ids: [ODOO_COMPANY_ID],
  company_id: ODOO_COMPANY_ID,
};

// ── helpers ──────────────────────────────────────────────────

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function odooJsonRpc(odooUrl, payload) {
  const res = await fetch(`${odooUrl}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

function odooErrorMessage(rpcJson) {
  const msg =
    rpcJson?.error?.data?.message ||
    rpcJson?.error?.message ||
    (rpcJson?.error ? JSON.stringify(rpcJson.error) : "") ||
    JSON.stringify(rpcJson || {});
  return String(msg).slice(0, 500);
}

// ── worker ───────────────────────────────────────────────────

const worker = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
    
    if (request.method !== "POST") {
      return new Response("Método no permitido", { status: 405 });
    }

    try {
      // ── Credenciales Odoo ──────────────────────────────────
      // NOTA: En producción, usa Secrets de Cloudflare para estas credenciales
      const ODOO_URL     = "https://mundocharro.odoo.com";
      const ODOO_DB      = "mundocharro";
      const ODOO_USER    = "francisco.pavana@mundocharro.mx";
      const ODOO_API_KEY = "b306bcb620c0bee09270bb814723d83977cf88d4";

      const data = await request.json();
      const tipo = data?.tipo || "";

      // ── Autenticar en Odoo ──────────────────────────────────
      const authJson = await odooJsonRpc(ODOO_URL, {
        jsonrpc: "2.0",
        method: "call",
        id: 1,
        params: {
          service: "common",
          method: "authenticate",
          args: [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}],
        },
      });

      const uid = authJson?.result;
      if (!uid || uid === false) {
        throw new Error(`Auth fallida: ${odooErrorMessage(authJson)}`);
      }

      // ── ENDPOINT: crear_lead_chatbot ────────────────────────
      if (tipo === "crear_lead_chatbot") {
        const { casoId, telefono, area, nombre, email, horario } = data;

        if (!casoId || !area) {
          return json({ ok: false, error: "casoId y area son requeridos" }, 400);
        }

        // Crear lead en CRM de Odoo
        const leadData = {
          name: `Caso ${casoId} - ${area}`,
          contact_name: nombre || `Usuario ${telefono}`,
          phone: telefono.replace(/^52/, ""), // Quitar prefijo 52 si existe
          email_from: email || null,
          description: `Solicitud de contacto desde chatbot WhatsApp.\n\nÁrea solicitada: ${area}\nHorario preferido: ${horario || "No especificado"}\n\nTeléfono: ${telefono}`,
          user_id: false, // Sin asignar - queda en pool para GT
        };

        const leadR = await odooJsonRpc(ODOO_URL, {
          jsonrpc: "2.0",
          method: "call",
          id: 200,
          params: {
            service: "object",
            method: "execute_kw",
            args: [
              ODOO_DB, uid, ODOO_API_KEY,
              "crm.lead",
              "create",
              [leadData],
              { context: ODOO_COMPANY_CONTEXT },
            ],
          },
        });

        if (leadR?.error) {
          throw new Error(`Error al crear lead: ${odooErrorMessage(leadR)}`);
        }

        return json({
          ok: true,
          lead_id: leadR?.result,
          casoId,
          area,
          mensaje: "Lead creado exitosamente en Odoo CRM"
        }, 200);
      }

      return json({
        ok: false,
        error: `tipo "${tipo}" no reconocido`,
        tipos_validos: ["crear_lead_chatbot"],
      }, 400);

    } catch (err) {
      return json({ ok: false, error: err.message }, 500);
    }
  },
};

export default worker;
```

### Paso 3: Configurar Secrets (Recomendado para producción)

Por seguridad, es mejor usar **Secrets** de Cloudflare en lugar de hardcodear las credenciales:

1. En el dashboard del worker, ve a **Settings** → **Variables**
2. Agrega las siguientes variables como **Secrets** (encrypted):
   - `ODOO_URL` = `https://mundocharro.odoo.com`
   - `ODOO_DB` = `mundocharro`
   - `ODOO_USER` = `francisco.pavana@mundocharro.mx`
   - `ODOO_API_KEY` = `b306bcb620c0bee09270bb814723d83977cf88d4`

3. Luego modifica el código para usar `env.ODOO_URL`, `env.ODOO_DB`, etc.:

```javascript
const ODOO_URL     = env.ODOO_URL;
const ODOO_DB      = env.ODOO_DB;
const ODOO_USER    = env.ODOO_USER;
const ODOO_API_KEY = env.ODOO_API_KEY;
```

### Paso 4: Deploy

1. Haz clic en **Deploy** en la esquina superior derecha
2. El worker estará disponible en: `https://mundocharro-rrhh-leads.[tu-username].workers.dev`

## 🔗 Configuración del Chatbot

### Paso 1: Actualizar variables de entorno en Render

Ve a tu proyecto en Render y agrega la variable de entorno:

```
CLOUDFLARE_WORKER_URL=https://mundocharro-rrhh-leads.[tu-username].workers.dev
```

### Paso 2: Reiniciar el servicio en Render

Después de actualizar las variables, reinicia el servicio para que tome los nuevos valores.

## 🧪 Pruebas

### Probar el worker directamente:

```bash
curl -X POST https://mundocharro-rrhh-leads.[tu-username].workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "crear_lead_chatbot",
    "casoId": "123456789",
    "telefono": "5217713900155",
    "area": "Atención GT",
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "horario": "Mañana"
  }'
```

Respuesta exitosa:
```json
{
  "ok": true,
  "lead_id": 123,
  "casoId": "123456789",
  "area": "Atención GT",
  "mensaje": "Lead creado exitosamente en Odoo CRM"
}
```

### Probar el flujo completo:

1. Escribe "Hola" al chatbot de WhatsApp
2. Selecciona opción 1 (Soy colaborador/a)
3. Escribe "contactar"
4. El chatbot responderá con un número de caso
5. Verifica en Odoo CRM que se haya creado el lead

## 📊 Campos del Lead en Odoo

El lead se crea con los siguientes campos:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `name` | Título del lead | "Caso 123456789 - Atención GT" |
| `contact_name` | Nombre del contacto | "Juan Pérez" o "Usuario 5217713900155" |
| `phone` | Teléfono (sin prefijo 52) | "17713900155" |
| `email_from` | Email (si está disponible) | "juan@email.com" |
| `description` | Descripción detallada | Incluye área, horario y teléfono |
| `user_id` | Usuario asignado | `false` (sin asignar) |

## 🔧 Personalización

### Cambiar el modelo de Odoo

Si usas un modelo diferente a `crm.lead`, modifica la línea:

```javascript
"crm.lead",
```

Por el nombre de tu modelo (ej: `x_lead_chatbot`, `sale.lead`, etc.)

### Agregar campos personalizados

Si tienes campos personalizados en Odoo (que empiezan con `x_`), agrégalos al objeto `leadData`:

```javascript
const leadData = {
  name: `Caso ${casoId} - ${area}`,
  // ... campos estándar ...
  x_origen: "WhatsApp",
  x_prioridad: "Alta",
  // ... tus campos personalizados ...
};
```

## 🚨 Solución de Problemas

### Error: "Auth fallida"
- Verifica que las credenciales de Odoo sean correctas
- Asegúrate de que el usuario tenga permisos para crear leads en CRM

### Error: "crm.lead no existe"
- Verifica que el módulo CRM esté instalado en Odoo
- Confirma el nombre correcto del modelo

### Error: "CORS" o "Network"
- Verifica que la URL del worker sea correcta
- Asegúrate de que el worker esté desplegado y activo

### El lead no se crea
- Revisa los logs del worker en Cloudflare Dashboard
- Verifica que el teléfono tenga el formato correcto

## 📝 Notas Importantes

1. **Seguridad**: Las credenciales de Odoo están hardcodeadas en el ejemplo. En producción, usa Secrets de Cloudflare.
2. **Rendimiento**: La creación del lead se hace en background para no retrasar la respuesta del chatbot.
3. **Errores**: Si falla la creación del lead, el chatbot igual responde al usuario (no bloquea la experiencia).
4. **Logs**: Todos los intentos de creación de leads se registran en la consola del chatbot.

## 📞 Soporte

Si tienes problemas con:
- **Worker de Cloudflare**: Revisa la documentación de [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- **API de Odoo**: Consulta la [documentación de Odoo JSON-RPC](https://www.odoo.com/documentation/16.0/developer/reference/backend/orm.html)
- **Chatbot**: Revisa los logs en Render o ejecuta `npm run dev` localmente para debugging