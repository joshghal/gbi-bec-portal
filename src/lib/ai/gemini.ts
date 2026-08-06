// Gemini client (classic generateContent REST) for the Slide Ibadah feature.
//
// Two modes:
//   grounding: true  → adds the `google_search` tool so answers come from real
//                      web pages, with source links in groundingMetadata.
//                      NOTE: on gemini-2.5-flash, grounding CANNOT be combined
//                      with responseSchema (400) — so we always prompt for JSON
//                      and parse it leniently instead of using structured output.
//   grounding: false → plain generation (used for tidy/segment/polish).

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface GeminiSource {
  title: string;
  url: string;
}

export interface GeminiResult {
  success: boolean;
  text?: string;
  sources?: GeminiSource[];
  error?: string;
}

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export async function callGemini(opts: {
  prompt: string;
  system?: string;
  grounding?: boolean;
  temperature?: number;
}): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false, error: 'GEMINI_API_KEY not configured' };

  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
    generationConfig: { temperature: opts.temperature ?? 0.2 },
  };
  if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };
  if (opts.grounding) body.tools = [{ google_search: {} }];

  try {
    const res = await fetch(`${BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const t = await res.text();
      return { success: false, error: `Gemini ${res.status}: ${t.slice(0, 300)}` };
    }

    const data = await res.json();
    const cand = data?.candidates?.[0];
    const parts = cand?.content?.parts || [];
    const text = parts
      .map((p: { text?: string }) => p.text || '')
      .join('')
      .trim();

    const chunks = cand?.groundingMetadata?.groundingChunks || [];
    const sources: GeminiSource[] = chunks
      .map((c: { web?: { uri?: string; title?: string } }) => ({
        title: c.web?.title || '',
        url: c.web?.uri || '',
      }))
      .filter((s: GeminiSource) => s.url);

    // De-dupe sources by url.
    const seen = new Set<string>();
    const uniqueSources: GeminiSource[] = [];
    for (const s of sources) {
      if (!seen.has(s.url)) {
        seen.add(s.url);
        uniqueSources.push(s);
      }
    }

    return { success: true, text, sources: uniqueSources };
  } catch (error) {
    return {
      success: false,
      error: `Gemini request failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/** Lenient JSON extraction — models wrap JSON in prose or code fences. */
export function parseGeminiJson<T>(content: string): T | null {
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    const fence = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) {
      try {
        return JSON.parse(fence[1].trim()) as T;
      } catch {
        /* fall through */
      }
    }
    const obj = content.match(/\{[\s\S]*\}/);
    if (obj) {
      try {
        return JSON.parse(obj[0]) as T;
      } catch {
        /* fall through */
      }
    }
    return null;
  }
}
