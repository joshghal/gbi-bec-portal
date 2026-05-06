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
