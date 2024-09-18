import { apiFetch } from "./api";

export async function ask<T>(
  prompt: string,
  responseType: "string" | "string_array" = "string"
): Promise<T> {
  const response = await apiFetch("/ai-chat/ask", {
    method: "POST",
    body: JSON.stringify({ prompt, responseType }),
  });
  return response.response;
}

export async function askForString(prompt: string): Promise<string> {
  return ask<string>(prompt, "string");
}

export async function askForStringArray(prompt: string): Promise<string[]> {
  return ask<string[]>(prompt, "string_array");
}
