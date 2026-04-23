// =============================================
//   Módulo de vacantes desde Google Sheets
// =============================================

const { google } = require("googleapis");

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_RANGE = "'Hoja 1'!A2:F100";// Columnas: Puesto, Area, Ciudad, Salario, Descripcion, Activa

let cachedVacantes = [];
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos de caché

async function obtenerVacantes() {
  const ahora = Date.now();

  // Usar caché si es reciente
  if (cachedVacantes.length > 0 && ahora - lastFetch < CACHE_TTL) {
    return cachedVacantes;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });

    const rows = response.data.values || [];
    cachedVacantes = rows
      .filter((row) => row[5]?.toUpperCase() === "SI") // Solo vacantes activas
      .map((row) => ({
        puesto: row[0] || "",
        area: row[1] || "",
        ciudad: row[2] || "",
        salario: row[3] || "",
        descripcion: row[4] || "",
      }));

    lastFetch = ahora;
    return cachedVacantes;
  } catch (error) {
    console.error("Error obteniendo vacantes de Sheets:", error.message);
    // Vacantes de respaldo en caso de error
    return [
      { puesto: "Gerente Comercial", area: "Ventas", ciudad: "Querétaro", salario: "$20,000", descripcion: "Liderar equipo de ventas" },
      { puesto: "Cajero", area: "Operaciones", ciudad: "Pachuca", salario: "$8,000", descripcion: "Atención en caja" },
      { puesto: "Desarrollador Jr", area: "TI", ciudad: "CDMX", salario: "$15,000", descripcion: "Desarrollo web" },
    ];
  }
}

async function buscarVacante(nombre) {
  const vacantes = await obtenerVacantes();
  const busqueda = nombre.toLowerCase();
  return vacantes.filter(
    (v) =>
      v.puesto.toLowerCase().includes(busqueda) ||
      v.area.toLowerCase().includes(busqueda)
  );
}

function formatearListaVacantes(vacantes) {
  if (vacantes.length === 0) return null;
  return vacantes
    .map((v, i) => `${i + 1}. *${v.puesto}* — ${v.area} | ${v.ciudad} | ${v.salario}`)
    .join("\n");
}

module.exports = { obtenerVacantes, buscarVacante, formatearListaVacantes };
