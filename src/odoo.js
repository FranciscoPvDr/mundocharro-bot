// =============================================
//   Integración con Odoo CRM vía Cloudflare Worker
//   Para crear leads automáticamente cuando un usuario solicita contacto
// =============================================

const axios = require("axios");

/**
 * Crea un lead en Odoo CRM a través del worker de Cloudflare
 * @param {Object} datos - Datos del lead
 * @param {string} datos.casoId - ID único del caso
 * @param {string} datos.telefono - Teléfono del usuario
 * @param {string} datos.casoArea - Área solicitada (Atención GT, Vinculación, etc.)
 * @param {string} [datos.nombre] - Nombre del usuario (opcional)
 * @param {string} [datos.email] - Email del usuario (opcional)
 * @param {string} [datos.horario] - Horario preferido (opcional)
 * @returns {Promise<Object|null>} Resultado de la creación del lead
 */
async function crearLeadOdoo(datos) {
  const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL;

  console.log(`🔍 DEBUG - WORKER_URL: "${WORKER_URL}"`);
  console.log(`🔍 DEBUG - Todas las env vars: ${JSON.stringify(Object.keys(process.env).filter(k => k.includes('CLOUDFLARE') || k.includes('META')).reduce((obj, key) => { obj[key] = process.env[key]; return obj; }, {}))}`);

  if (!WORKER_URL) {
    console.error("❌ FALTA CLOUDFLARE_WORKER_URL en variables de entorno");
    return null;
  }

  try {
    console.log(`📡 Enviando POST a: ${WORKER_URL}`);
    console.log(`📦 Datos: ${JSON.stringify(datos)}`);
    
    const response = await axios.post(WORKER_URL, {
      tipo: "crear_lead_chatbot",
      casoId: datos.casoId,
      telefono: datos.telefono,
      area: datos.casoArea,
      nombre: datos.nombre,
      email: datos.email,
      horario: datos.horario,
    });

    const resultado = response.data;

    if (resultado.ok) {
      console.log(`✅ Lead creado en Odoo:`);
      console.log(`   Lead ID: ${resultado.lead_id}`);
      console.log(`   Caso: ${resultado.casoId}`);
      console.log(`   Área: ${resultado.area}`);
    } else {
      console.error(`❌ Error al crear lead en Odoo: ${resultado.error}`);
    }

    return resultado;
  } catch (error) {
    console.error(`❌ Error de conexión con worker:`);
    console.error(`   URL: ${WORKER_URL}`);
    console.error(`   Error: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error(`   Request: ${JSON.stringify(error.request)}`);
    }
    return null;
  }
}

module.exports = { crearLeadOdoo };