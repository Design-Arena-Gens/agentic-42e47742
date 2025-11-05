export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  annotations?: Record<string, unknown>;
}

export interface ChatSettings {
  providerId: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  systemPrompt: string;
  responseFormat: "text" | "json";
}

export interface ChatRequestPayload {
  messages: Array<Pick<ChatMessage, "role" | "content">>;
  settings: ChatSettings;
}

export interface ChatCompletionResponse {
  message: Pick<ChatMessage, "role" | "content">;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    cost?: number;
    currency?: string;
  };
  raw?: unknown;
}
