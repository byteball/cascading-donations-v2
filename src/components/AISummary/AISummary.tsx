"use server";

import { FC } from "react";
import { getRepositorySummary } from "@/services/summary.server";

interface IAISummaryProps {
  owner: string;
  repo: string;
}

const AISummary: FC<IAISummaryProps> = async ({ owner, repo }) => {
  const summary = await getRepositorySummary(`${owner}/${repo}`);

  if (!summary) return null;

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
      <p className="text-sm leading-6 text-gray-700">{summary}</p>
    </div>
  );
};

export default AISummary;
