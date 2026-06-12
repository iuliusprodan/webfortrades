import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import type { BatchApprovalDecision, BatchLeadSpec } from "./types.js";

const APPROVAL_PROMPT =
  /^(yes|no|yes-except\s+[\d,\s]+)$/i;

/**
 * Parse: yes | yes-except 3,5 | no
 */
export function parseBatchApprovalAnswer(
  answer: string,
  leadCount: number
): BatchApprovalDecision {
  const trimmed = answer.trim();
  if (!trimmed) return { action: "abort" };

  const lower = trimmed.toLowerCase();
  if (lower === "no") return { action: "abort" };
  if (lower === "yes") return { action: "proceed", skipIndices: new Set() };

  const exceptMatch = /^yes-except\s+(.+)$/i.exec(trimmed);
  if (exceptMatch) {
    const skipIndices = new Set<number>();
    for (const part of exceptMatch[1]!.split(/[,\s]+/)) {
      const n = Number(part.trim());
      if (!Number.isInteger(n) || n < 1 || n > leadCount) {
        throw new Error(
          `Invalid yes-except index "${part}". Use 1-${leadCount} (comma-separated).`
        );
      }
      skipIndices.add(n);
    }
    return { action: "proceed", skipIndices };
  }

  throw new Error(
    'Invalid approval. Reply: yes | yes-except <list> | no (e.g. yes-except 3,5)'
  );
}

export function batchApprovalPromptText(leadCount: number): string {
  return `Approve all ${leadCount} sends as drafted? (yes / yes-except <list> / no)`;
}

export async function askBatchApproval(
  leadCount: number,
  options?: { preApproved?: string }
): Promise<BatchApprovalDecision> {
  if (options?.preApproved !== undefined) {
    return parseBatchApprovalAnswer(options.preApproved, leadCount);
  }

  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(`${batchApprovalPromptText(leadCount)} `);
    if (!APPROVAL_PROMPT.test(answer.trim())) {
      console.log("Unrecognised answer. Treating as no.");
      return { action: "abort" };
    }
    return parseBatchApprovalAnswer(answer, leadCount);
  } finally {
    rl.close();
  }
}

export async function askPerSendApproval(
  lead: BatchLeadSpec,
  options?: { preApproved?: boolean }
): Promise<boolean> {
  if (options?.preApproved === true) return true;
  if (options?.preApproved === false) return false;

  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(
      `Approve send for #${lead.index} ${lead.slug}? (yes / no) `
    );
    return answer.trim().toLowerCase() === "yes";
  } finally {
    rl.close();
  }
}

export function leadsAfterBatchApproval(
  leads: BatchLeadSpec[],
  decision: BatchApprovalDecision
): BatchLeadSpec[] {
  if (decision.action === "abort") return [];
  return leads.map((lead) =>
    decision.skipIndices.has(lead.index)
      ? {
          ...lead,
          skip: true,
          skipReason: lead.skipReason ?? "excluded by batch approval (yes-except)",
        }
      : lead
  );
}
