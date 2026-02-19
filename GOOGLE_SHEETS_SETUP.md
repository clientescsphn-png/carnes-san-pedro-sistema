# Configuración de Google Sheets

Esta guía te explica paso a paso cómo configurar la sincronización con Google Sheets.

## ¿Qué necesitas?

- Una cuenta de Google (Gmail)
- 10 minutos de tu tiempo

## Pasos

### 1. Crear un proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. En la parte superior, haz click en el selector de proyecto y luego en **"Nuevo proyecto"**
4. Ponle un nombre (ej: "Ventas App") y haz click en **"Crear"**

### 2. Habilitar la API de Google Sheets

1. En el menú lateral, ve a **"APIs y servicios" > "Biblioteca"**
2. Busca **"Google Sheets API"**
3. Haz click en **"Habilitar"**

### 3. Crear credenciales OAuth 2.0

1. Ve a **"APIs y servicios" > "Credenciales"**
2. Haz click en **"Crear credenciales" > "ID de cliente de OAuth"**
3. Si te pide configurar la pantalla de consentimiento:
   - Selecciona **"Externo"** (cualquier usuario con cuenta de Google)
   - Completa la información básica (nombre de la app, email de soporte)
   - En **"Alcance"** agrega: `.../auth/spreadsheets`
   - Guarda y continúa
4. En **"Tipo de aplicación"** selecciona **"Aplicación web"**
5. Ponle un nombre (ej: "Ventas Web App")
6. En **"Orígenes autorizados de JavaScript"** agrega:
   - `http://localhost:5173` (para pruebas locales)
   - `https://tu-dominio.com` (tu dominio de producción)
7. Haz click en **"Crear"**
8. **Copia el "ID de cliente"** (se ve como: `123456789-abc123.apps.googleusercontent.com`)

### 4. Configurar la aplicación

#### Opción A: Variables de entorno (Recomendado)

1. Crea un archivo `.env` en la raíz del proyecto
2. Agrega:
   ```
   VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
   ```
3. Reinicia el servidor de desarrollo

#### Opción B: Editar archivo directamente

1. Abre `src/config/google.ts`
2. Reemplaza el valor de `CLIENT_ID`:
   ```typescript
   CLIENT_ID: 'tu-client-id.apps.googleusercontent.com',
   ```

### 5. Probar la sincronización

1. Abre la aplicación
2. Ve a la pestaña **"Nube"**
3. Haz click en **"Iniciar sesión con Google"**
4. Selecciona tu cuenta de Google y acepta los permisos
5. Crea una nueva hoja de cálculo o conecta una existente
6. ¡Listo! Tus ventas se sincronizarán automáticamente

## ¿Dónde encuentro el ID de una hoja existente?

El ID está en la URL de Google Sheets:

```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                           Este es el ID
```

O simplemente pega la URL completa en el campo "ID de la hoja" y la app lo extraerá automáticamente.

## Solución de problemas

### "Error 400: redirect_uri_mismatch"

- Verifica que hayas agregado el dominio correcto en los orígenes autorizados
- Si estás en desarrollo, asegúrate de usar `http://localhost:5173`

### "La API no está habilitada"

- Ve a la Biblioteca de APIs y asegúrate de que "Google Sheets API" esté habilitada

### "Error de autorización"

- Asegúrate de haber copiado el ID de cliente completo (incluye `.apps.googleusercontent.com`)

## Privacidad y seguridad

- La aplicación solo puede acceder a las hojas de cálculo que tú autorices
- No almacenamos tus credenciales en ningún servidor
- Los datos se guardan localmente en tu navegador y en tu propia cuenta de Google
