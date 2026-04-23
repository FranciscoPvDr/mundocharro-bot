# 📊 Configurar Google Sheets para Vacantes

## Paso 1 — Crear la hoja de cálculo

1. Ve a https://sheets.google.com
2. Crea una nueva hoja llamada **"Vacantes Mundo Charro"**
3. En la primera hoja, renómbrala como **"Vacantes"** (clic derecho en la pestaña)
4. Agrega estos encabezados en la fila 1:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Puesto | Area | Ciudad | Salario | Descripcion | Activa |

5. Agrega tus vacantes a partir de la fila 2. Ejemplo:

| Gerente Comercial | Ventas | Querétaro | $20,000 | Liderar equipo de ventas regional | SI |
| Cajero | Operaciones | Pachuca | $8,000 | Atención en punto de venta | SI |
| Desarrollador Jr | TI | CDMX | $15,000 | Desarrollo de aplicaciones web | NO |

> ⚠️ La columna **Activa** debe decir exactamente **SI** o **NO** (mayúsculas)

---

## Paso 2 — Obtener el ID de la hoja

La URL de tu hoja se ve así:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
```

El ID es la parte larga en medio:
```
1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
```

Copia ese ID y agrégalo a tu `.env`:
```
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
```

---

## Paso 3 — Crear credenciales de Google

1. Ve a https://console.cloud.google.com
2. Crea un proyecto nuevo llamado "MundoCharroBot"
3. En el menú, busca **"APIs y servicios"** → **"Biblioteca"**
4. Busca **"Google Sheets API"** y actívala
5. Ve a **"APIs y servicios"** → **"Credenciales"**
6. Clic en **"Crear credenciales"** → **"Cuenta de servicio"**
7. Nombre: `mundocharro-bot`
8. Clic en **"Crear y continuar"** → **"Listo"**
9. Haz clic en la cuenta de servicio recién creada
10. Ve a la pestaña **"Claves"** → **"Agregar clave"** → **"Crear clave nueva"** → **JSON**
11. Se descargará un archivo `.json` — ábrelo y copia TODO su contenido

---

## Paso 4 — Agregar credenciales al .env

En tu `.env` agrega:
```
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"...todo el JSON en una línea..."}
```

> ⚠️ El JSON debe estar en UNA SOLA LÍNEA sin saltos de línea

---

## Paso 5 — Compartir la hoja con la cuenta de servicio

1. Abre el archivo JSON de credenciales
2. Busca el campo `"client_email"` — se ve así:
   ```
   mundocharro-bot@mundocharro-bot.iam.gserviceaccount.com
   ```
3. Ve a tu Google Sheet
4. Clic en **"Compartir"** (arriba a la derecha)
5. Pega ese email y dale permiso de **"Lector"**
6. Clic en **"Enviar"**

---

## Paso 6 — Instalar dependencias

```bash
npm install googleapis
```

---

## Paso 7 — Copiar el archivo

Copia `vacantes.js` a la carpeta `src/` de tu proyecto.

---

## ¿Cómo actualizar vacantes?

Solo abre la hoja de Google Sheets y:
- **Agregar vacante**: Agrega una fila nueva con SI en la columna Activa
- **Desactivar vacante**: Cambia SI por NO en la columna Activa
- **Editar vacante**: Modifica cualquier celda

Los cambios se reflejan en el bot en máximo **5 minutos** (tiempo de caché).
