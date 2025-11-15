import { api } from "./client";

export async function getAiResponse(prompt: string, timeoutMs: number = 15000): Promise<string> {
  if (!prompt) {
    throw new Error('prompt is required');
  }
  const path = `/api/v1/ai?prompt=${encodeURIComponent(prompt)}`;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    // use shared api helper which handles headers/auth and response parsing
    const res = await api<string>(path, { method: "GET", signal: controller.signal });
    return res as string;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`AI request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
