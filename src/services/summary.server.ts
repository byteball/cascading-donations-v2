"use server";

import { Octokit } from "@octokit/rest";

import { getCachedSummary, setCachedSummary } from "@/db/summaryCache";
import { getMetaInformation } from "@/services/github.server";
import { generateSummary } from "@/services/openrouter.server";
import { getActiveToken } from "@/utils/getActiveToken";

export async function getRepositorySummary(
  fullName: string
): Promise<string | null> {
  try {
    const cached = getCachedSummary(fullName);
    if (cached) {
      console.log("ai-summary: cache hit for", fullName);
      return cached;
    }

    const [owner, repo] = fullName.split("/");
    if (!owner || !repo) return null;

    const meta = await getMetaInformation(fullName);

    const token = await getActiveToken("request");
    const octokit = new Octokit({ auth: token });

    let readmeContent: string;
    try {
      const { data } = await octokit.rest.repos.getReadme({ owner, repo });
      readmeContent = Buffer.from(data.content, "base64").toString("utf-8");
    } catch {
      console.log("ai-summary: no README found for", fullName);
      return null;
    }

    const summary = await generateSummary(
      fullName,
      meta?.description || null,
      readmeContent
    );

    if (summary) {
      setCachedSummary(fullName, summary);
      console.log("ai-summary: generated and cached for", fullName);
    }

    return summary;
  } catch (error) {
    console.error("ai-summary: error for", fullName, error);
    return null;
  }
}
