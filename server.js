import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3000);
const here = path.dirname(fileURLToPath(import.meta.url));
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '12mb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use(express.static(path.join(here, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, configured: Boolean(ai), model });
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!ai) return res.status(503).json({ error: 'Falta configurar GEMINI_API_KEY en el servidor.' });
    const { message, context = {}, image } = req.body ?? {};
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Escribe una pregunta para el tutor.' });
    }
    if (message.length > 12000) return res.status(413).json({ error: 'La pregunta es demasiado larga.' });

    const system = [
      'Eres NEXO, un tutor académico amable, paciente y claro.',
      'Explica en español, adaptándote al grado y materia indicados.',
      'Enseña paso a paso, sin hacer sentir mal al estudiante. Usa ejemplos sencillos y comprueba comprensión cuando ayude.',
      'Si recibes una imagen de una pizarra o ejercicio, analiza solo lo que se vea y señala si algo no se distingue.',
      'No inventes datos ni afirmes haber visto información que no aparece en la imagen.',
      'Cuando el contexto pida JSON, devuelve JSON válido sin bloques Markdown.'
    ].join(' ');
    const prompt = `${system}\n\nContexto de NEXO: ${JSON.stringify(context).slice(0, 5000)}\n\nMensaje del estudiante: ${message}`;
    const parts = [{ text: prompt }];
    if (image) {
      const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(image);
      if (!match) return res.status(400).json({ error: 'La imagen debe ser PNG, JPEG o WEBP en formato base64.' });
      if (match[2].length > 10_000_000) return res.status(413).json({ error: 'La imagen supera el tamaño permitido.' });
      parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
    const response = await ai.models.generateContent({ model, contents: [{ role: 'user', parts }] });
    const reply = response.text?.trim();
    if (!reply) return res.status(502).json({ error: 'Gemini no devolvió texto. Inténtalo otra vez.' });
    res.json({ reply, model });
  } catch (error) {
    console.error('Gemini request failed:', error?.message || error);
    const status = Number(error?.status) || 502;
    res.status(status >= 400 && status < 600 ? status : 502).json({ error: 'No se pudo completar la consulta con Gemini. Revisa la configuración y vuelve a intentarlo.' });
  }
});

app.listen(port, () => {
  console.log(`NEXO disponible en http://localhost:${port}`);
  if (!apiKey) console.warn('Falta GEMINI_API_KEY. Configúrala como variable secreta del servidor.');
});
