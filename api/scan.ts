// Server-side photo scan for Blood Buddy.
//
// The browser sends the photo here instead of calling Gemini directly, so the
// Gemini API key stays on the server (Vercel environment variable
// GEMINI_API_KEY) and is never included in the public website code.
//
// Only logged-in Blood Buddy users can use this endpoint: the request must carry
// the user's Supabase access token, which is verified before Gemini is called.

import { GoogleGenAI, Type } from '@google/genai';

// Public Supabase project details (same values the website already uses — these are safe to be public).
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://oflvshjkdgyxvcjgxftl.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbHZzaGprZGd5eHZjamd4ZnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzQxNTgsImV4cCI6MjA3NTg1MDE1OH0.8F9Gw220NxNdiLEQZct_QS9bpg6dkpP6Qw6ooWsVxF8';

// ~4 MB of base64 text. Photos are shrunk in the browser first, so real requests are far smaller.
const MAX_IMAGE_CHARS = 4_000_000;

const PROMPT =
  "Analyze the image of a blood pressure monitor. Extract the systolic (SYS), diastolic (DIA), and pulse (PUL) values. Return the result as a JSON object with numeric keys: 'systolic', 'diastolic', and 'pulse'. If a value is not visible or cannot be determined, return null for that key.";

async function isLoggedInUser(token: string): Promise<boolean> {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return false;
    const user = await r.json();
    return Boolean(user && user.id);
  } catch {
    return false;
  }
}

const toNumberOrNull = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error('scan: GEMINI_API_KEY is not set on the server');
    return res.status(500).json({ error: 'Scanner is not configured' });
  }

  // 1. Only logged-in users
  const auth = String(req.headers?.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token || !(await isLoggedInUser(token))) {
    return res.status(401).json({ error: 'Please log in again' });
  }

  // 2. Validate the photo
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const image = body?.image;
  const mimeType = body?.mimeType;
  if (typeof image !== 'string' || image.length === 0 || image.length > MAX_IMAGE_CHARS) {
    return res.status(400).json({ error: 'Invalid or too large image' });
  }
  if (typeof mimeType !== 'string' || !mimeType.startsWith('image/')) {
    return res.status(400).json({ error: 'Invalid image type' });
  }

  // 3. Ask Gemini (same model, prompt and schema as before)
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ inlineData: { data: image, mimeType } }, { text: PROMPT }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            systolic: { type: Type.NUMBER, description: 'Systolic blood pressure value' },
            diastolic: { type: Type.NUMBER, description: 'Diastolic blood pressure value' },
            pulse: { type: Type.NUMBER, description: 'Pulse rate value' },
          },
          required: ['systolic', 'diastolic', 'pulse'],
        },
      },
    });

    const data = JSON.parse((response.text || '{}').trim());
    return res.status(200).json({
      systolic: toNumberOrNull(data?.systolic),
      diastolic: toNumberOrNull(data?.diastolic),
      pulse: toNumberOrNull(data?.pulse),
    });
  } catch (error) {
    console.error('scan: Gemini request failed', error);
    return res.status(502).json({ error: 'Could not read the image' });
  }
}
