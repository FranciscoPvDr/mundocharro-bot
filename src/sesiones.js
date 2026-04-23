// =============================================
//   Manejo de sesiones y estados
// =============================================

const ESTADOS = {
  INICIO: "INICIO",
  MENU_PRINCIPAL: "MENU_PRINCIPAL",

  // Colaborador
  COLABORADOR: "COLABORADOR",

  /** Espera a que el colaborador escriba *contactar* (o reinicie con Hola) */
  COLABORADOR_ESPERA_CONTACTO: "COLABORADOR_ESPERA_CONTACTO",

  // Prácticas
  PRACTICAS_MENU: "PRACTICAS_MENU",

  // Reclutamiento
  RECLUTAMIENTO_VACANTE: "RECLUTAMIENTO_VACANTE",
  RECLUTAMIENTO_TIENE_VACANTE: "RECLUTAMIENTO_TIENE_VACANTE",
  RECLUTAMIENTO_BUSCAR_VACANTE: "RECLUTAMIENTO_BUSCAR_VACANTE",
  RECLUTAMIENTO_CARTERA: "RECLUTAMIENTO_CARTERA",

  // Recolección de datos
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