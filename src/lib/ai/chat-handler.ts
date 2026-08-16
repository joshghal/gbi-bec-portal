const ASI1_API_URL = 'https://api.asi1.ai/v1/chat/completions';
const ASI1_MODEL = 'asi1-mini';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResult {
  success: boolean;
  content?: string;
  error?: string;
  duration: number;
}

export async function callChatAI(options: {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<ChatCompletionResult> {
  const { messages, temperature = 0.2, maxTokens = 1500 } = options;

  const apiKey = process.env.ASI1_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'ASI1_API_KEY not configured', duration: 0 };
  }

  const start = Date.now();

  try {
    const response = await fetch(ASI1_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ASI1_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    const duration = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `ASI1 API error ${response.status}: ${errorText.substring(0, 200)}`,
        duration,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return { success: false, error: 'ASI1 returned empty response', duration };
    }

    return { success: true, content, duration };
  } catch (error) {
    return {
      success: false,
      error: `ASI1 request failed: ${error instanceof Error ? error.message : String(error)}`,
      duration: Date.now() - start,
    };
  }
}

/**
 * Same request as callChatAI, but with `stream: true` — invokes `onDelta` with
 * each raw token fragment as it arrives, and still resolves with the full
 * accumulated content so the caller can run the exact same parseJSONResponse
 * fallback chain used by the non-streaming path (clean JSON, code fences,
 * regex extraction, the ASI1 <tool_call> malformed-output shape). Streaming
 * changes delivery, not parsing.
 */
export async function streamChatAI(
  options: { messages: ChatMessage[]; temperature?: number; maxTokens?: number },
  onDelta: (text: string) => void,
): Promise<ChatCompletionResult> {
  const { messages, temperature = 0.2, maxTokens = 1500 } = options;

  const apiKey = process.env.ASI1_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'ASI1_API_KEY not configured', duration: 0 };
  }

  const start = Date.now();

  try {
    const response = await fetch(ASI1_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ASI1_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      const errorText = response.body ? await response.text() : 'no response body';
      return {
        success: false,
        error: `ASI1 stream error ${response.status}: ${errorText.substring(0, 200)}`,
        duration: Date.now() - start,
      };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let lineBuffer = '';
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      lineBuffer += decoder.decode(value, { stream: true });
      const lines = lineBuffer.split('\n');
      lineBuffer = lines.pop() ?? ''; // keep the trailing partial line for next read

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;

        try {
          const json = JSON.parse(payload);
          const delta: string | undefined = json.choices?.[0]?.delta?.content;
          if (delta) {
            full += delta;
            onDelta(delta);
          }
        } catch {
          // A single malformed SSE line must not kill the whole stream.
        }
      }
    }

    if (!full) {
      return { success: false, error: 'ASI1 returned empty streamed response', duration: Date.now() - start };
    }
    return { success: true, content: full, duration: Date.now() - start };
  } catch (error) {
    return {
      success: false,
      error: `ASI1 stream request failed: ${error instanceof Error ? error.message : String(error)}`,
      duration: Date.now() - start,
    };
  }
}

export function parseJSONResponse<T>(content: string): T | null {
  try {
    return JSON.parse(content);
  } catch {
    // Try extracting from code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[1].trim()); } catch { /* fall through */ }
    }
    // Try extracting JSON object
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try { return JSON.parse(objectMatch[0]); } catch { /* fall through */ }
      // LLM often outputs literal newlines inside JSON strings — sanitize them
      try {
        const sanitized = objectMatch[0].replace(/"([^"]*)"(\s*[:,\]}])/g, (match, str, after) =>
          `"${str.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}"${after}`
        );
        return JSON.parse(sanitized);
      } catch { /* fall through */ }
    }
    // Last resort: extract response and suggestedQuestions manually
    const responseMatch = content.match(/"response"\s*:\s*"([\s\S]*?)"\s*,\s*"suggestedQuestions"/);
    const questionsMatch = content.match(/"suggestedQuestions"\s*:\s*\[([\s\S]*?)\]/);
    if (responseMatch) {
      const response = responseMatch[1];
      const questions = questionsMatch
        ? questionsMatch[1].match(/"([^"]+)"/g)?.map(q => q.replace(/^"|"$/g, '')) || []
        : [];
      return { response, suggestedQuestions: questions } as T;
    }
    // Handle ASI1 Mini's malformed <tool_call> format:
    // e.g. "Response text<tool_call>response</arg_key><arg_value>Response text</arg_value><arg_key>suggestedQuestions: []</arg_key>..."
    if (content.includes('<tool_call>')) {
      const argValueMatch = content.match(/<arg_value>([\s\S]*?)<\/arg_value>/);
      const response = argValueMatch
        ? argValueMatch[1].trim()
        : content.split('<tool_call>')[0].trim();

      const sqMatch = content.match(/suggestedQuestions[:\s]*(\[[\s\S]*?\])/);
      let suggestedQuestions: string[] = [];
      if (sqMatch) {
        try { suggestedQuestions = JSON.parse(sqMatch[1]); } catch { /* empty */ }
      }

      const ftMatch = content.match(/formTrigger[:\s]*([^\s<\]]+)/);
      const formTrigger = (ftMatch && ftMatch[1] !== 'null') ? ftMatch[1] : null;

      if (response) return { response, suggestedQuestions, formTrigger } as T;
    }
    return null;
  }
}
