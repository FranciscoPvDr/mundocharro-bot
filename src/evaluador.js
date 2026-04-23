// =============================================
//   Módulo de evaluación con Gemini AI
// =============================================

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Genera 3 preguntas situacionales según el puesto
 */
async function generarPreguntas(puesto, experiencia) {
  const prompt = `Eres un reclutador experto de Mundo Charro. 
Genera exactamente 3 preguntas situacionales breves (máx 2 líneas cada una) para evaluar a un candidato al puesto de "${puesto}" con ${experiencia} de experiencia.
Las preguntas deben ser prácticas y revelar competencias clave.
Responde SOLO con las 3 preguntas numeradas, sin introducción ni comentarios.
Formato:
1. [pregunta]
2. [pregunta]
3. [pregunta]`;

  const resultado = await model.generateContent(prompt);
  const texto = resultado.response.text();

  const preguntas = texto
    .split("\n")
    .filter((l) => l.match(/^\d\./))
    .map((l) => l.replace(/^\d\.\s*/, "").trim());

  return preguntas;
}

/**
 * Evalúa las 3 respuestas del candidato con IA
 * Devuelve: { nivel: "viable"|"medio"|"no_viable", resumen: string }
 */
async function evaluarCandidato(datos, preguntas, respuestas) {
  const historial = preguntas
    .map((p, i) => `Pregunta ${i + 1}: ${p}\nRespuesta: ${respuestas[i] || "(sin respuesta)"}`)
    .join("\n\n");

  const prompt = `Eres un evaluador de RRHH de Mundo Charro. Evalúa al siguiente candidato:

PERFIL:
- Nombre: ${datos.nombre}
- Puesto: ${datos.puesto}
- Experiencia: ${datos.experiencia}
- Escolaridad: ${datos.escolaridad}
- Disponibilidad: ${datos.horario}
- Pretensión salarial: ${datos.salario}

EVALUACIÓN SITUACIONAL:
${historial}

Basándote en todo lo anterior, clasifica al candidato en UNO de estos niveles:
- VIABLE: Perfil sólido, pasa a entrevista
- MEDIO: Perfil con potencial, requiere revisión humana
- NO_VIABLE: Perfil no cumple requisitos mínimos

Responde SOLO con este formato JSON (sin markdown ni backticks):
{"nivel":"VIABLE|MEDIO|NO_VIABLE","resumen":"máximo 2 oraciones explicando la decisión"}`;

  const resultado = await model.generateContent(prompt);
  const texto = resultado.response.text().trim();

  try {
    // Limpiar posibles backticks que Gemini a veces agrega
    const limpio = texto.replace(/```json|```/g, "").trim();
    const json = JSON.parse(limpio);
    return json;
  } catch {
    return { nivel: "MEDIO", resumen: "Perfil requiere revisión manual por parte de RRHH." };
  }
}

module.exports = { generarPreguntas, evaluarCandidato };