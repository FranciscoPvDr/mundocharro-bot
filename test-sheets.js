require('dotenv').config();
const { google } = require('googleapis');

async function test() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const r = await sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SHEET_ID });
    console.log('✅ Conexión exitosa!');
    console.log('Hojas encontradas:', r.data.sheets.map(s => s.properties.title));
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
