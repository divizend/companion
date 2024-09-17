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

export function trimPunctuation(text: string): string {
  return text.replace(
    /^[.,\/#!$%\^&\*;:{}=\-_`~()]+|[.,\/#!$%\^&\*;:{}=\-_`~()]+$/g,
    ""
  );
}

export function splitPascalCase(text: string): string {
  return text.replace(/([A-Z])/g, " $1").trim();
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function applyStringFixes(
  text: string,
  fixes: ((text: string) => string)[]
) {
  for (const fix of fixes) {
    text = fix(text);
  }
  return text;
}
