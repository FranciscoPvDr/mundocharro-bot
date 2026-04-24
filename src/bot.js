// =============================================
//   Lógica principal del chatbot Mundo Charro
//   Flujo actualizado por RRHH v3 - Prácticas mejoradas
// =============================================

const crypto = require("crypto");
const { ESTADOS, MODO, obtenerSesion, actualizarSesion } = require("./sesiones");
const { obtenerVacantes, buscarVacante, formatearListaVacantes } = require("./vacantes");
const { crearLeadOdoo } = require("./odoo");

// ─── MENSAJES ──────────────────────────────────────────────────────
const MSG = {
  bienvenida: `👋 ¡Hola! Bienvenido/a a *Mundo Charro*.

Te atiende el área de *Gestión de Talento* 🤠

Te haré unas preguntas rápidas _(menos de 3 minutos)_.

👉 Escribe *1* para Comenzar`,

  menuPrincipal: `Para ayudarte mejor, elige una opción:

1️⃣ 👤 Soy colaborador/a
2️⃣ 🎓 Busco prácticas profesionales
3️⃣ 💼 Quiero trabajar en Mundo Charro
4️⃣ ℹ️ Solo quiero información

Responde con el número de tu opción.`,

  colaborador: `¡Hola! Te ayudamos con temas internos 👍

👉 Te canalizamos con el área correspondiente.

Escribe *contactar* para que un agente de *Atención GT* se comunique contigo, o escribe *Hola* para volver al inicio.`,

  // ─── PRÁCTICAS ───────────────────────────────────────────
  practicasMenu: `¡Qué gusto que te intereses en nuestras prácticas! 🙌

¿Qué deseas hacer?

1️⃣ 📋 Ver información sobre prácticas
2️⃣ 🎓 Quiero hacer mis prácticas aquí

Responde con el número de tu opción.`,

  practicasInfo: `📋 *Información sobre Prácticas Profesionales en Mundo Charro*

• Duración: 6 meses
• Modalidad: Presencial
• Áreas disponibles: Ventas, Administración, TI, RRHH
• Apoyo económico: A convenir
• Requisitos: Ser estudiante activo con carta de presentación institucional

Para iniciar tu proceso escribe *registrar*, o escribe *Hola* para volver al inicio.`,

  practicasPedirNombre: `¡Perfecto! 🎓 Vamos a registrar tu perfil.

*¿Cuál es tu nombre completo?*`,

  practicasPedirEmail: (nombre) => `👤 Mucho gusto, *${nombre}*!

*¿Cuál es tu correo electrónico?*`,

  practicasPedirUniversidad: `📧 ¡Gracias!

*¿En qué universidad o institución estudias?*`,

  practicasPedirCarrera: `🏫 ¡Anotado!

*¿Qué carrera estudias?*`,

  practicasPedirArea: `📚 ¡Excelente!

*¿En qué área te gustaría realizar tus prácticas?*

1️⃣ 💼 Ventas
2️⃣ 🗂️ Administración
3️⃣ 💻 TI
4️⃣ 👥 RRHH

Responde con el número de tu opción.`,

  practicasPedirCarta: `¿Cuentas con *carta de presentación* de tu institución?

1️⃣ ✅ Sí, ya la tengo
2️⃣ 🔄 Aún no, pero la estoy tramitando
3️⃣ ❌ No la tengo aún`,

  practicasRegistrado: (nombre) => `✅ *¡Gracias ${nombre}!*

Tu perfil ha sido registrado exitosamente. 🎉

El equipo de *Vinculación* revisará tu información y se pondrá en contacto contigo pronto. 📬

---

¿Te gustaría hablar ahora con alguien del área de *Vinculación*?

1️⃣ 💬 Sí, quiero hablar con alguien
2️⃣ 👍 No, está bien así`,

  practicasCierre: `🌟 ¡Perfecto! Estaremos en contacto muy pronto.

¡Mucho éxito en tu proceso! 🤠

Escribe *Hola* si necesitas algo más.`,

  // ─── RECLUTAMIENTO ───────────────────────────────────────
  reclutamientoInicio: `¡Genial! 🙌 Vamos a conocer tu perfil.

¿Ya tienes alguna vacante en mente?

1️⃣ ✅ Sí, ya tengo una vacante en mente
2️⃣ ❓ No, quiero ver las opciones disponibles

Responde con el número de tu opción.`,

  soloInfo: `🤠 Bienvenido a Mundo Charro, el verdadero corazón de México 🇲🇽
Somos un destino único donde la cultura, las tradiciones y el entretenimiento mexicano cobran vida con orgullo y pasión. Aquí celebramos lo que nos hace mexicanos: nuestras raíces, nuestra gente y nuestras historias.

🌐 Sitio web: www.mundocharro.com
📧 Contacto: rrhh@mundocharro.com
📍 Ubicación: Singuilucan, Hidalgo, México.

Si tienes alguna duda o quieres conocer más sobre esta experiencia auténticamente mexicana, escríbenos… será un gusto atenderte como se recibe a los buenos invitados: con calidez y respeto.

Escribe *Hola* para volver al inicio.`,

  pedirVacante: `¿Cuál es el nombre o área de la vacante que te interesa?

_(Ej: Gerente, Ventas, Cajero, TI...)_`,

  vacantesDisponibles: (lista) => `📋 *Vacantes disponibles en Mundo Charro:*

${lista}

Escribe el *número* de la vacante que te interesa, o escribe *0* para agregar tu perfil a nuestra cartera de talento.`,

  sinVacantes: `😔 Por el momento no tenemos vacantes activas que coincidan con tu búsqueda.

¿Te gustaría formar parte de nuestra *Cartera de Talento*? Así podremos considerarte para futuras oportunidades.

1️⃣ 👍 Sí, guardar mi perfil
2️⃣ ❌ No por ahora`,

  invitarCartera: `¡Podemos guardar tu perfil en nuestra *Cartera de Talento*! 🌟

Cuando tengamos una vacante que se adapte a ti, te contactaremos.

1️⃣ 👍 Sí, guardar mi perfil
2️⃣ ❌ No por ahora`,

  noCartera: `Entendido 👍 

Si en el futuro te interesa, escríbenos aquí.

¡Mucho éxito! 🌟

Escribe *Hola* para volver al inicio.`,

  pedirNombre: `¡Perfecto! Empecemos 📋

*¿Cuál es tu nombre completo?*`,

  pedirEmail: (nombre) => `👤 Mucho gusto, *${nombre}*!

*¿Cuál es tu correo electrónico?*`,

  pedirHorario: `📧 ¡Gracias!

*¿En qué horario podemos contactarte?*

1️⃣ 🌅 Mañana
2️⃣ 🌞 Tarde
3️⃣ 🌙 Noche
4️⃣ 🕒 Cualquier horario`,

  confirmacion: (nombre) => `👍 ¡Gracias *${nombre}*!

Estamos revisando tu información...

_📌 Te contactaremos si avanzas en el proceso._

Escribe *Hola* si tienes algo más en qué podamos ayudarte.`,

  cierre: `🙌 *¡Gracias por tu tiempo!*

Si tienes dudas, puedes escribirnos aquí.

¡Te deseamos mucho éxito! 🤠`,

  handoffHumano: (casoId, area) => `✅ Entendido. Pronto se unirá alguien del equipo de *${area}* a esta conversación.

🧾 *Número de caso:* ${casoId}

Mientras tanto, puedes escribir aquí los detalles de tu solicitud.

_Si necesitas volver al menú automático, escribe *Hola*._`,

  agentesOcupados: `⏳ En este momento nuestros agentes están atendiendo otras conversaciones.

Tu caso ha sido registrado y nos pondremos en contacto contigo a la brevedad posible:

📧 Por correo electrónico
📱 Por este mismo WhatsApp

¡Gracias por tu paciencia! 🤠

_Si necesitas volver al menú automático, escribe *Hola*._`,

  errorOpcion: `❌ No entendí tu respuesta. Por favor elige una opción válida escribiendo el número correspondiente.`,
};

function generarCasoId() {
  return String(crypto.randomInt(100_000_000, 1_000_000_000));
}

async function registrarHandoffHumano(telefono, sesion, area) {
  const casoId = generarCasoId();
  const datos = {
    ...sesion.datos,
    casoId,
    casoArea: area,
    casoAbiertoEn: new Date().toISOString(),
  };

  crearLeadOdoo(datos).then(resultado => {
    if (resultado?.ok) {
      console.log(`✅ Lead creado en Odoo | Caso: ${casoId} | Área: ${area} | Lead ID: ${resultado.lead_id}`);
    } else {
      console.warn(`⚠️ Lead no creado en Odoo | Caso: ${casoId} | Error: ${resultado?.error}`);
    }
  }).catch(err => {
    console.error(`❌ Error al crear lead en Odoo para caso ${casoId}:`, err.message);
  });

  console.log(`\n🧑‍💼 HANDOFF A HUMANO:`);
  console.log(`   Caso: ${casoId}`);
  console.log(`   Área: ${area}`);
  console.log(`   Estado bot: ${sesion.estado}`);
  console.log(`   Teléfono: ${telefono}\n`);

  return datos;
}

async function registrarLeadPracticas(telefono, sesion) {
  const casoId = generarCasoId();
  const datos = {
    ...sesion.datos,
    casoId,
    casoArea: "Vinculación",
    casoAbiertoEn: new Date().toISOString(),
  };

  crearLeadOdoo(datos).then(resultado => {
    if (resultado?.ok) {
      console.log(`✅ Lead prácticas creado en Odoo | Caso: ${casoId} | Lead ID: ${resultado.lead_id}`);
    } else {
      console.warn(`⚠️ Lead prácticas no creado | Caso: ${casoId} | Error: ${resultado?.error}`);
    }
  }).catch(err => {
    console.error(`❌ Error al crear lead de prácticas para caso ${casoId}:`, err.message);
  });

  console.log(`\n🎓 NUEVO PRACTICANTE REGISTRADO:`);
  console.log(`   Caso: ${casoId}`);
  console.log(`   Nombre: ${datos.nombre}`);
  console.log(`   Universidad: ${datos.universidad}`);
  console.log(`   Carrera: ${datos.carrera}`);
  console.log(`   Área: ${datos.areaInteres}`);
  console.log(`   Carta: ${datos.cartaPresentacion}`);
  console.log(`   Teléfono: ${telefono}\n`);

  return datos;
}

// ─── PROCESADOR PRINCIPAL ──────────────────────────────────────────
async function procesarMensaje(telefono, mensaje) {
  const sesion = obtenerSesion(telefono);
  const texto = mensaje.trim().toLowerCase();
  const textoOriginal = mensaje.trim();

  // Reinicio en cualquier momento
  if (texto === "hola" || texto === "inicio" || texto === "reiniciar") {
    actualizarSesion(telefono, { estado: ESTADOS.INICIO, modo: MODO.BOT, datos: {}, respuestasEval: [] });
    return MSG.bienvenida;
  }

  // Durante soporte humano el bot no interviene,
  // pero si llevan más de 30 minutos sin respuesta, avisa
  if (sesion.modo === MODO.HUMANO) {
    const abierto = sesion.datos?.casoAbiertoEn ? new Date(sesion.datos.casoAbiertoEn) : null;
    const minutosEspera = abierto ? (Date.now() - abierto.getTime()) / 60000 : 0;
    if (minutosEspera > 30) {
      return MSG.agentesOcupados;
    }
    return null;
  }

  switch (sesion.estado) {

    // ─── BIENVENIDA ────────────────────────────────────────────────
    case ESTADOS.INICIO:
      if (texto === "1" || texto === "comenzar") {
        actualizarSesion(telefono, { estado: ESTADOS.MENU_PRINCIPAL });
        return MSG.menuPrincipal;
      }
      return MSG.bienvenida;

    // ─── MENÚ PRINCIPAL ────────────────────────────────────────────
    case ESTADOS.MENU_PRINCIPAL:
      switch (texto) {
        case "1":
          actualizarSesion(telefono, { estado: ESTADOS.COLABORADOR_ESPERA_CONTACTO });
          return MSG.colaborador;
        case "2":
          actualizarSesion(telefono, { estado: ESTADOS.PRACTICAS_MENU });
          return MSG.practicasMenu;
        case "3":
          actualizarSesion(telefono, { estado: ESTADOS.RECLUTAMIENTO_VACANTE });
          return MSG.reclutamientoInicio;
        case "4":
          actualizarSesion(telefono, { estado: ESTADOS.SOLO_INFO });
          return MSG.soloInfo;
        default:
          return MSG.errorOpcion + "\n\n" + MSG.menuPrincipal;
      }

    // ─── COLABORADOR ───────────────────────────────────────────────
    case ESTADOS.COLABORADOR_ESPERA_CONTACTO:
      if (texto === "contactar") {
        const datos = await registrarHandoffHumano(telefono, sesion, "Atención GT");
        actualizarSesion(telefono, { modo: MODO.HUMANO, estado: ESTADOS.FIN, datos });
        return MSG.handoffHumano(datos.casoId, "Atención GT");
      }
      return (
        `Para canalizarte con un agente, escribe la palabra *contactar*.\n\n` +
        `Si quieres reiniciar, escribe *Hola*.`
      );

    // ─── PRÁCTICAS: MENÚ ───────────────────────────────────────────
    case ESTADOS.PRACTICAS_MENU:
      switch (texto) {
        case "1":
          actualizarSesion(telefono, { estado: ESTADOS.PRACTICAS_INFO });
          return MSG.practicasInfo;
        case "2":
          actualizarSesion(telefono, { estado: ESTADOS.PRACTICAS_NOMBRE });
          return MSG.practicasPedirNombre;
        default:
          return MSG.errorOpcion + "\n\n" + MSG.practicasMenu;
      }

    // ─── PRÁCTICAS: INFO ───────────────────────────────────────────
    case ESTADOS.PRACTICAS_INFO:
      if (texto === "registrar" || texto === "contactar") {
        actualizarSesion(telefono, { estado: ESTADOS.PRACTICAS_NOMBRE });
        return MSG.practicasPedirNombre;
      }
      return `Para iniciar tu registro escribe *registrar*.\n\nSi quieres reiniciar, escribe *Hola*.`;

    // ─── PRÁCTICAS: RECOLECCIÓN DE DATOS ──────────────────────────
    case ESTADOS.PRACTICAS_NOMBRE:
      actualizarSesion(telefono, {
        estado: ESTADOS.PRACTICAS_EMAIL,
        datos: { ...sesion.datos, nombre: textoOriginal }
      });
      return MSG.practicasPedirEmail(textoOriginal);

    case ESTADOS.PRACTICAS_EMAIL:
      actualizarSesion(telefono, {
        estado: ESTADOS.PRACTICAS_UNIVERSIDAD,
        datos: { ...sesion.datos, email: textoOriginal }
      });
      return MSG.practicasPedirUniversidad;

    case ESTADOS.PRACTICAS_UNIVERSIDAD:
      actualizarSesion(telefono, {
        estado: ESTADOS.PRACTICAS_CARRERA,
        datos: { ...sesion.datos, universidad: textoOriginal }
      });
      return MSG.practicasPedirCarrera;

    case ESTADOS.PRACTICAS_CARRERA:
      actualizarSesion(telefono, {
        estado: ESTADOS.PRACTICAS_AREA,
        datos: { ...sesion.datos, carrera: textoOriginal }
      });
      return MSG.practicasPedirArea;

    case ESTADOS.PRACTICAS_AREA: {
      const areas = { "1": "Ventas", "2": "Administración", "3": "TI", "4": "RRHH" };
      const areaInteres = areas[texto];
      if (!areaInteres) return MSG.errorOpcion + "\n\n" + MSG.practicasPedirArea;
      actualizarSesion(telefono, {
        estado: ESTADOS.PRACTICAS_CARTA,
        datos: { ...sesion.datos, areaInteres }
      });
      return MSG.practicasPedirCarta;
    }

    case ESTADOS.PRACTICAS_CARTA: {
      const cartas = {
        "1": "✅ Sí la tiene",
        "2": "🔄 En trámite",
        "3": "❌ No la tiene aún"
      };
      const cartaPresentacion = cartas[texto];
      if (!cartaPresentacion) return MSG.errorOpcion + "\n\n" + MSG.practicasPedirCarta;

      const datosActualizados = { ...sesion.datos, cartaPresentacion };
      actualizarSesion(telefono, {
        estado: ESTADOS.PRACTICAS_CONFIRMACION,
        datos: datosActualizados
      });

      // Crear lead en Odoo con todos los datos
      const sesionActualizada = { ...sesion, datos: datosActualizados };
      await registrarLeadPracticas(telefono, sesionActualizada);

      return MSG.practicasRegistrado(datosActualizados.nombre);
    }

    // ─── PRÁCTICAS: ¿QUIERE HABLAR CON ALGUIEN? ───────────────────
    case ESTADOS.PRACTICAS_CONFIRMACION:
      if (texto === "1") {
        const datos = await registrarHandoffHumano(telefono, sesion, "Vinculación");
        actualizarSesion(telefono, { modo: MODO.HUMANO, estado: ESTADOS.FIN, datos });
        return MSG.handoffHumano(datos.casoId, "Vinculación");
      } else if (texto === "2") {
        actualizarSesion(telefono, { estado: ESTADOS.FIN });
        return MSG.practicasCierre;
      }
      return MSG.errorOpcion + "\n\n" + MSG.practicasRegistrado(sesion.datos.nombre);

    // ─── SOLO INFO ─────────────────────────────────────────────────
    case ESTADOS.SOLO_INFO:
      actualizarSesion(telefono, { estado: ESTADOS.FIN });
      return MSG.cierre;

    // ─── RECLUTAMIENTO: ¿TIENE VACANTE? ───────────────────────────
    case ESTADOS.RECLUTAMIENTO_VACANTE:
      if (texto === "1") {
        actualizarSesion(telefono, { estado: ESTADOS.RECLUTAMIENTO_TIENE_VACANTE });
        return MSG.pedirVacante;
      } else if (texto === "2") {
        const vacantes = await obtenerVacantes();
        const lista = formatearListaVacantes(vacantes);
        if (lista) {
          actualizarSesion(telefono, { estado: ESTADOS.RECLUTAMIENTO_BUSCAR_VACANTE, datos: { ...sesion.datos, vacantesDisponibles: vacantes } });
          return MSG.vacantesDisponibles(lista);
        } else {
          actualizarSesion(telefono, { estado: ESTADOS.RECLUTAMIENTO_CARTERA });
          return MSG.sinVacantes;
        }
      }
      return MSG.errorOpcion + "\n\n" + MSG.reclutamientoInicio;

    // ─── RECLUTAMIENTO: BUSCAR VACANTE ─────────────────────────────
    case ESTADOS.RECLUTAMIENTO_TIENE_VACANTE: {
      const resultados = await buscarVacante(textoOriginal);
      const lista = formatearListaVacantes(resultados);
      if (lista) {
        actualizarSesion(telefono, { estado: ESTADOS.RECLUTAMIENTO_BUSCAR_VACANTE, datos: { ...sesion.datos, vacantesDisponibles: resultados } });
        return `🔍 Encontré estas vacantes relacionadas:\n\n${lista}\n\nEscribe el *número* de la que te interesa, o *0* para agregar tu perfil a nuestra cartera.`;
      } else {
        actualizarSesion(telefono, { estado: ESTADOS.RECLUTAMIENTO_CARTERA });
        return MSG.sinVacantes;
      }
    }

    // ─── SELECCIÓN DE VACANTE ──────────────────────────────────────
    case ESTADOS.RECLUTAMIENTO_BUSCAR_VACANTE: {
      if (texto === "0") {
        actualizarSesion(telefono, { estado: ESTADOS.RECLUTAMIENTO_CARTERA });
        return MSG.invitarCartera;
      }
      const idx = parseInt(texto) - 1;
      const vacantes = sesion.datos.vacantesDisponibles || [];
      if (idx >= 0 && idx < vacantes.length) {
        const vacante = vacantes[idx];
        actualizarSesion(telefono, { estado: ESTADOS.DATOS_NOMBRE, datos: { ...sesion.datos, vacanteSeleccionada: vacante.puesto } });
        return `✅ ¡Excelente elección!\n\n*${vacante.puesto}* — ${vacante.area} | ${vacante.ciudad} | ${vacante.salario}\n\n${vacante.descripcion}\n\n` + MSG.pedirNombre;
      }
      return MSG.errorOpcion;
    }

    // ─── CARTERA DE TALENTO ────────────────────────────────────────
    case ESTADOS.RECLUTAMIENTO_CARTERA:
      if (texto === "1") {
        actualizarSesion(telefono, { estado: ESTADOS.DATOS_NOMBRE });
        return MSG.pedirNombre;
      } else if (texto === "2") {
        actualizarSesion(telefono, { estado: ESTADOS.FIN });
        return MSG.noCartera;
      }
      return MSG.errorOpcion + "\n\n" + MSG.invitarCartera;

    // ─── RECOLECCIÓN DE DATOS (RECLUTAMIENTO) ─────────────────────
    case ESTADOS.DATOS_NOMBRE:
      actualizarSesion(telefono, { estado: ESTADOS.DATOS_EMAIL, datos: { ...sesion.datos, nombre: textoOriginal } });
      return MSG.pedirEmail(textoOriginal);

    case ESTADOS.DATOS_EMAIL:
      actualizarSesion(telefono, { estado: ESTADOS.DATOS_HORARIO, datos: { ...sesion.datos, email: textoOriginal } });
      return MSG.pedirHorario;

    case ESTADOS.DATOS_HORARIO: {
      const horarios = { "1": "🌅 Mañana", "2": "🌞 Tarde", "3": "🌙 Noche", "4": "🕒 Cualquier horario" };
      const horario = horarios[texto] || textoOriginal;
      const datosFinal = { ...sesion.datos, horario };
      actualizarSesion(telefono, { estado: ESTADOS.FIN, datos: datosFinal });

      console.log(`\n📋 NUEVO CANDIDATO REGISTRADO:`);
      console.log(`   Nombre: ${datosFinal.nombre}`);
      console.log(`   Email: ${datosFinal.email}`);
      console.log(`   Horario: ${horario}`);
      console.log(`   Vacante: ${datosFinal.vacanteSeleccionada || "Cartera de talento"}`);
      console.log(`   Teléfono: ${telefono}\n`);

      return MSG.confirmacion(datosFinal.nombre) + "\n\n" + MSG.cierre;
    }

    default:
      actualizarSesion(telefono, { estado: ESTADOS.MENU_PRINCIPAL });
      return MSG.menuPrincipal;
  }
}

module.exports = { procesarMensaje };