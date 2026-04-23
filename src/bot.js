// =============================================
//   Lógica principal del chatbot Mundo Charro
//   Flujo actualizado por RRHH v2
// =============================================

const { ESTADOS, obtenerSesion, actualizarSesion } = require("./sesiones");
const { generarPreguntas, evaluarCandidato } = require("./evaluador");
const { obtenerVacantes, buscarVacante, formatearListaVacantes } = require("./vacantes");

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

  practicasMenu: `¡Qué gusto que te intereses en nuestras prácticas! 🙌

¿Qué deseas hacer?

1️⃣ 📋 Ver información sobre prácticas
2️⃣ 💬 Contactar al área de Vinculación

Responde con el número de tu opción.`,

  practicasInfo: `📋 *Información sobre Prácticas Profesionales en Mundo Charro*

• Duración: 6 meses
• Modalidad: Presencial
• Áreas disponibles: Ventas, Administración, TI, RRHH
• Apoyo económico: A convenir
• Requisitos: Ser estudiante activo con carta de presentación institucional

Para más información o para iniciar tu proceso, escribe *contactar* y nuestro equipo de *Vinculación* se pondrá en contacto contigo.

Escribe *Hola* para volver al inicio.`,

  practicasContacto: `✅ Listo, hemos registrado tu interés en prácticas profesionales.

El equipo de *Vinculación* se pondrá en contacto contigo pronto. 📬

¡Mucho éxito! 🌟

Escribe *Hola* para volver al inicio.`,

  reclutamientoInicio: `¡Genial! 🙌 Vamos a conocer tu perfil.

¿Ya tienes alguna vacante en mente?

1️⃣ ✅ Sí, ya tengo una vacante en mente
2️⃣ ❓ No, quiero ver las opciones disponibles

Responde con el número de tu opción.`,

  soloInfo: `🤠 Bienvenido a Mundo Charro, el verdadero corazón de México 🇲🇽
Somos un destino único donde la cultura, las tradiciones y el entretenimiento mexicano cobran vida con orgullo y pasión. Aquí celebramos lo que nos hace mexicanos: nuestras raíces, nuestra gente y nuestras historias.

🌐 Sitio web: www.mundocharro.com
📧 Contacto: rrhh@mundocharro.com
📍 Ubicación: Singuilucan,Hidalgo,México.

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

  errorOpcion: `❌ No entendí tu respuesta. Por favor elige una opción válida escribiendo el número correspondiente.`,
};

// ─── PROCESADOR PRINCIPAL ──────────────────────────────────────────
async function procesarMensaje(telefono, mensaje) {
  const sesion = obtenerSesion(telefono);
  const texto = mensaje.trim().toLowerCase();
  const textoOriginal = mensaje.trim();

  // Reinicio en cualquier momento
  if (texto === "hola" || texto === "inicio" || texto === "reiniciar") {
    actualizarSesion(telefono, { estado: ESTADOS.INICIO, datos: {}, respuestasEval: [] });
    return MSG.bienvenida;
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
          actualizarSesion(telefono, { estado: ESTADOS.COLABORADOR });
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
    case ESTADOS.COLABORADOR:
      actualizarSesion(telefono, { estado: ESTADOS.FIN });
      return MSG.cierre;

    // ─── PRÁCTICAS ─────────────────────────────────────────────────
    case ESTADOS.PRACTICAS_MENU:
      switch (texto) {
        case "1":
          actualizarSesion(telefono, { estado: ESTADOS.FIN });
          return MSG.practicasInfo;
        case "2":
          actualizarSesion(telefono, { estado: ESTADOS.FIN });
          return MSG.practicasContacto;
        default:
          return MSG.errorOpcion + "\n\n" + MSG.practicasMenu;
      }

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
        // Mostrar todas las vacantes disponibles
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

    // ─── RECOLECCIÓN DE DATOS ──────────────────────────────────────
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

      // Log para RRHH
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