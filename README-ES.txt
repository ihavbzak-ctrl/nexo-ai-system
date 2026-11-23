NEXO + GEMINI — PAQUETE DE INTEGRACIÓN
======================================

QUÉ INCLUYE
- La página NEXO original, ahora servida desde el mismo servidor que el tutor.
- Backend Node.js que conecta con Gemini usando el SDK oficial @google/genai.
- Tutor IA, generación de simulacros, tarjetas y resúmenes a través de /api/chat.
- Soporte para enviar una imagen de pizarra al modelo.
- Límite básico de solicitudes y clave fuera del navegador.

IMPORTANTE
Este paquete contiene el código preparado, pero NO está publicado en Internet y todavía no está conectado a tu cuenta de Gemini. Para obtener un enlace público hace falta desplegarlo en un servicio de hosting compatible con Node.js y configurar allí la variable secreta GEMINI_API_KEY. No pegues la clave en index.html ni en un chat.

REQUISITOS
- Node.js 22 o superior.
- Una clave de Gemini Developer API configurada como secreto del servidor.
- Un servicio de hosting Node.js para publicar NEXO en una URL.

PRUEBA LOCAL (para quien configure el servidor)
1. Descomprime la carpeta.
2. En una terminal dentro de NEXO-Gemini, ejecuta: npm install
3. Crea un archivo .env a partir de .env.example.
4. Configura GEMINI_API_KEY en .env (solo en tu equipo/servidor privado; no lo compartas).
5. Ejecuta: npm start
6. Abre http://localhost:3000 en el navegador.
7. En NEXO > Ajustes, pulsa “Probar conexión”.

PUBLICACIÓN
Al desplegar, configura estas variables en la sección de secretos/variables del hosting:
- GEMINI_API_KEY: tu clave privada.
- GEMINI_MODEL: gemini-3-flash-preview (o un modelo disponible para tu clave).
- PORT: normalmente lo asigna el hosting.
- APP_ORIGIN: el dominio HTTPS de NEXO, si tu plataforma lo requiere.

COSTES Y LÍMITES
No se garantiza uso ilimitado ni que todos los modelos tengan cuota gratuita. Los límites y condiciones dependen de Google AI Studio, del modelo y de la cuenta. Revisa el panel de uso antes de usarlo mucho.

SEGURIDAD
- .env está excluido de Git por .gitignore.
- Nunca subas .env al repositorio.
- Si una clave se expone, revócala y crea otra.
- Este backend incluye un límite básico de solicitudes; para un sitio público real conviene añadir autenticación y controles de abuso.
