export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedQuestions?: string[];
  sources?: string[];
  timestamp: number;
  isError?: boolean;
  // Form-specific fields
  formCards?: { type: string; title: string; description: string; icon: string }[];
  formOptions?: string[];
  formSummary?: { label: string; field: string; value: string; type: string; options?: string[] }[];
  formWhatsApp?: { churchUrl: string; selfUrl?: string; editUrl: string; formTitle: string; name: string };
}

export interface ChatRequest {
  message: string;
  history: { role: 'user' | 'assistant'; content: string }[];
}

export interface ChatResponse {
  response: string;
  suggestedQuestions: string[];
  sources: string[];
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    category: string;
    source: string;
    type: string;
  };
}
