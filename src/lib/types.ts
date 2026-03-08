export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedQuestions?: string[];
  sources?: string[];
  timestamp: number;
  isError?: boolean;
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
