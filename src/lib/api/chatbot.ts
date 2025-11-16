import { api } from "./client";

export type ChatbotApiResponse = {
  response: string;
  tokens: { available: number; used: number };
};

export async function getAiResponse(
  prompt: string,
  timeoutMs: number = 30000
): Promise<ChatbotApiResponse> {
  if (!prompt) {
    throw new Error('prompt is required');
  }
  const path = `/api/v1/chatbot?prompt=${encodeURIComponent(prompt)}`;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    // use shared api helper which handles headers/auth and response parsing
    const res = await api<unknown>(path, { method: "GET", signal: controller.signal });

    // Expecting JSON shape: { response: string, tokens: { available, used } }
    if (res && typeof res === 'object') {
      const obj = res as Record<string, unknown>;
      const response = typeof obj.response === 'string' ? obj.response : JSON.stringify(obj);
      const tokensObj = obj.tokens as Record<string, unknown> | undefined;
      const tokens = {
        available: tokensObj && typeof tokensObj.available === 'number' ? tokensObj.available : 0,
        used: tokensObj && typeof tokensObj.used === 'number' ? tokensObj.used : 0,
      };
      return { response, tokens };
    }

    // Fallback: convert to string
    return { response: String(res), tokens: { available: 0, used: 0 } };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`AI request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
