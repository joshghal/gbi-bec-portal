/**
 * Poster image helpers that don't involve JSX/Satori — safe to import anywhere
 * (kept separate from poster.tsx so they can be unit-tested without the React runtime).
 */

const CLOUD_NAME = 'dap2zavrb';
const UPLOAD_PRESET = 'unsigned-upload';

// Varied building blocks so every poster looks distinct (not the same worship-beam each time).
const SCENES = [
  'silhouettes of a vast congregation with hands raised high in worship',
  'a single silhouetted worshipper kneeling with arms outstretched',
  'a crowd of worshippers beneath towering shafts of light',
  'hands lifted toward heaven in surrender, seen from below',
  'a lone figure standing on a hill facing a radiant sky',
  'a worship gathering with soft bokeh lights and raised hands',
  'an open field at dawn with a solitary cross on the horizon',
  'misty mountains with light pouring through clouds over a valley',
];
const PALETTES = [
  'warm gold and amber tones over deep teal-black shadows',
  'soft cyan and turquoise glow over near-black',
  'rich royal purple and magenta light over dark indigo',
  'warm orange ember glow over charcoal',
  'cool sapphire-blue divine light over deep midnight tones',
  'rose-gold and peach light over dusky brown shadows',
];
const LIGHTING = [
  'a single dramatic beam of light from above',
  'soft volumetric god-rays fanning outward',
  'a glowing sunrise breaking over the horizon',
  'radiant light bursting from the center',
  'gentle haze with scattered floating light particles',
  'shafts of light piercing through clouds',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Generate a cinematic worship background (16:9, no text) via Gemini image model. */
export async function generateBackground(theme: string): Promise<Buffer> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not configured');

  const scene = pick(SCENES);
  const palette = pick(PALETTES);
  const lighting = pick(LIGHTING);

  const prompt = `A cinematic, atmospheric Christian worship background image in 16:9 widescreen landscape. Scene: ${scene}. Lighting: ${lighting}. Color grading: ${palette}. Ethereal mist and soft floating embers evoke the presence of the Holy Spirit. Dark, moody, reverent, holy mood inspired by the sermon theme "${theme}". The top and bottom thirds are noticeably darker (vignette) to leave clean space for overlaid text, while the focal area glows. Professional church media aesthetic, ultra high detail, photographic, dramatic depth. ABSOLUTELY NO text, no words, no letters, no captions, no logos anywhere in the image.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini image error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find(
    (p: { inlineData?: { data: string }; inline_data?: { data: string } }) => p.inlineData || p.inline_data,
  );
  const b64 = (img?.inlineData || img?.inline_data)?.data;
  if (!b64) throw new Error('Gemini returned no image');
  return Buffer.from(b64, 'base64');
}

/** Upload a PNG buffer to Cloudinary (unsigned) and return an optimized delivery URL. */
export async function uploadPoster(png: Buffer, publicHint = 'khotbah-cover'): Promise<string> {
  const fd = new FormData();
  fd.append('file', new Blob([new Uint8Array(png)], { type: 'image/png' }), `${publicHint}.png`);
  fd.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`Cloudinary upload failed ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  // Deliver as WebP (q_auto for size). Cloudinary transcodes the stored PNG to .webp on request.
  return (data.secure_url as string)
    .replace('/image/upload/', '/image/upload/q_auto/')
    .replace(/\.png$/i, '.webp');
}
