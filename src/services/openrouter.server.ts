"use server";

import appConfig from "@/appConfig";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const models = [
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "upstage/solar-pro-3:free",
  "arcee-ai/trinity-large-preview:free",
  "stepfun/step-3.5-flash:free",
];

let lastSuccessfulModel: string | null = null;

interface OpenRouterResponse {
  choices?: { message?: { content?: string } }[];
}

const MAX_TOKENS_CONTENT = 10_000;
const MAX_README_LENGTH = MAX_TOKENS_CONTENT * 4; // account for tokenization overhead

function getOrderedModels(): string[] {
  if (!lastSuccessfulModel || !models.includes(lastSuccessfulModel)) {
    return models;
  }

  const idx = models.indexOf(lastSuccessfulModel);
  return [lastSuccessfulModel, ...models.toSpliced(idx, 1)];
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

  const truncatedReadme = readmeContent.slice(0, MAX_README_LENGTH);

  const prompt = `You are given information about a GitHub repository. Write a concise 2-3 sentence summary of what this project does and who it's for.

Repository: ${repoFullName} (https://github.com/${repoFullName})
${description ? `Description: ${description}` : ""}

README:
${truncatedReadme}`;

  const orderedModels = getOrderedModels();

  for (const model of orderedModels) {
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
        const body = await res.text();
        if (res.status === 404) {
          const idx = models.indexOf(model);
          if (idx !== -1) models.splice(idx, 1);
          console.warn(`openrouter: MODEL NOT FOUND — "${model}" removed from the list. Remaining: ${models.length}`);
        } else {
          console.error(`openrouter: HTTP ${res.status} for ${model}: ${body}`);
        }
        continue;
      }

      const data: OpenRouterResponse = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      if (content) {
        lastSuccessfulModel = model;
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
