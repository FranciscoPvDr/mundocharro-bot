// =============================================
//   Manejo de sesiones y estados
// =============================================

const ESTADOS = {
  INICIO: "INICIO",
  MENU_PRINCIPAL: "MENU_PRINCIPAL",

  // Colaborador
  COLABORADOR: "COLABORADOR",
  COLABORADOR_ESPERA_CONTACTO: "COLABORADOR_ESPERA_CONTACTO",

  // Prácticas
  PRACTICAS_MENU: "PRACTICAS_MENU",
  PRACTICAS_INFO: "PRACTICAS_INFO",

  // Prácticas - recolección de datos
  PRACTICAS_NOMBRE: "PRACTICAS_NOMBRE",
  PRACTICAS_EMAIL: "PRACTICAS_EMAIL",
  PRACTICAS_UNIVERSIDAD: "PRACTICAS_UNIVERSIDAD",
  PRACTICAS_CARRERA: "PRACTICAS_CARRERA",
  PRACTICAS_AREA: "PRACTICAS_AREA",
  PRACTICAS_CARTA: "PRACTICAS_CARTA",
  PRACTICAS_CONFIRMACION: "PRACTICAS_CONFIRMACION", // ¿Quiere hablar con alguien?

  // Reclutamiento
  RECLUTAMIENTO_VACANTE: "RECLUTAMIENTO_VACANTE",
  RECLUTAMIENTO_TIENE_VACANTE: "RECLUTAMIENTO_TIENE_VACANTE",
  RECLUTAMIENTO_BUSCAR_VACANTE: "RECLUTAMIENTO_BUSCAR_VACANTE",
  RECLUTAMIENTO_CARTERA: "RECLUTAMIENTO_CARTERA",

  // Recolección de datos (reclutamiento)
  DATOS_NOMBRE: "DATOS_NOMBRE",
  DATOS_EMAIL: "DATOS_EMAIL",
  DATOS_HORARIO: "DATOS_HORARIO",

  // Solo información
  SOLO_INFO: "SOLO_INFO",

  // Evaluación IA
  EVALUACION_P1: "EVALUACION_P1",
  EVALUACION_P2: "EVALUACION_P2",
  EVALUACION_P3: "EVALUACION_P3",
  EVALUACION_RESULTADO: "EVALUACION_RESULTADO",

  FIN: "FIN",
};

/** Bot automático vs. soporte humano (misma conversación en WhatsApp) */
const MODO = {
  BOT: "BOT",
  HUMANO: "HUMANO",
};

const sesiones = new Map();

function obtenerSesion(telefono) {
  if (!sesiones.has(telefono)) {
    sesiones.set(telefono, {
      estado: ESTADOS.INICIO,
      modo: MODO.BOT,
      datos: {},
      respuestasEval: [],
    });
  }
  return sesiones.get(telefono);
}

function actualizarSesion(telefono, cambios) {
  const sesion = obtenerSesion(telefono);
  sesiones.set(telefono, { ...sesion, ...cambios });
}

function eliminarSesion(telefono) {
  sesiones.delete(telefono);
}

module.exports = { ESTADOS, MODO, obtenerSesion, actualizarSesion, eliminarSesion };