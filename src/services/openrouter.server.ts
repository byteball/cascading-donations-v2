"use server";

import appConfig from "@/appConfig";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "google/gemma-3-27b-it:free",
  "qwen/qwen3-4b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
];

interface OpenRouterResponse {
  choices?: { message?: { content?: string } }[];
}

export async function generateSummary(
  repoFullName: string,
  description: string | null,
  readmeContent: string
): Promise<string | null> {
  const apiKey = appConfig.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("openrouter: OPENROUTER_API_KEY is not set");
    return null;
  }

  const truncatedReadme = readmeContent.slice(0, 8000);

  const prompt = `You are given information about a GitHub repository. Write a concise 2-3 sentence summary of what this project does and who it's for.

Repository: ${repoFullName}
${description ? `Description: ${description}` : ""}

README:
${truncatedReadme}`;

  for (const model of MODELS) {
    try {
      console.log(`openrouter: trying model ${model}`);

      const res = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 256,
        }),
      });

      if (!res.ok) {
        console.error(`openrouter: HTTP ${res.status} for ${model}: ${await res.text()}`);
        continue;
      }

      const data: OpenRouterResponse = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      if (content) {
        console.log(`openrouter: success with model ${model}`);
        return content;
      }

      console.error(`openrouter: empty response from ${model}`);
    } catch (error) {
      console.error(`openrouter: request failed for ${model}`, error);
    }
  }

  console.error("openrouter: all models failed");
  return null;
}
