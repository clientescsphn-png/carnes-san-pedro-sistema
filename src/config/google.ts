// Configuración de Google Cloud Platform
//
// Para usar la sincronización con Google Sheets, necesitas:
//
// 1. Crear un proyecto en Google Cloud Console: https://console.cloud.google.com/
// 2. Habilitar la API de Google Sheets
// 3. Crear credenciales OAuth 2.0
// 4. Obtener tu Client ID y API Key
//
// Guía paso a paso:
// https://developers.google.com/sheets/api/quickstart/js

// Reemplaza estos valores con tus credenciales de Google Cloud
export const GOOGLE_CONFIG = {
  CLIENT_ID:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "279092010656-mh4ts7ejud7bfp5vplu01k38nvvaro1f.apps.googleusercontent.com",

  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || "",

  SCOPES: "https://www.googleapis.com/auth/spreadsheets",

  DISCOVERY_DOC: "https://sheets.googleapis.com/$discovery/rest?version=v4",
};

// Verificar si la configuración está completa
export function isGoogleConfigValid(): boolean {
  return !!GOOGLE_CONFIG.CLIENT_ID;
}

// Instrucciones para configurar:
/*
1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto (o usa uno existente)
3. En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
4. Busca "Google Sheets API" y habilítala
5. Ve a "APIs y servicios" > "Credenciales"
6. Click en "Crear credenciales" > "ID de cliente de OAuth"
7. Selecciona "Aplicación web"
8. En "Orígenes autorizados de JavaScript" agrega:
   - http://localhost:5173 (para desarrollo)
   - https://tu-dominio.com (para producción)
9. Copia el "ID de cliente" y pégalo arriba en CLIENT_ID
10. Opcional: Crea una "Clave de API" y pégala en API_KEY

Para variables de entorno (recomendado):
Crea un archivo .env en la raíz del proyecto:

VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=tu-api-key
*/
