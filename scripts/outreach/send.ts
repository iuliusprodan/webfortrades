/**
 * Outreach batch send orchestrator with per_send or batch approval modes.
 *
 * Usage:
 *   npm run send:outreach-batch -- --preflight --batch-file <manifest.json>
 *   npm run send:outreach-batch -- --live --batch-file <manifest.json> --approval-mode batch --approve yes
 *   npm run send:outreach-batch -- --live --slug <slug> --approval-mode per_send --approve yes
 *
 * Never sends without --live. Use --preflight for table + drafts only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertValidApprovalMode,
  loadWebsiteConfig,
  readSafetyFlags,
  safetyFlagsDrifted,
  WEBSITE_ROOT,
} from "./config.js";
import {
  askBatchApproval,
  askPerSendApproval,
  batchApprovalPromptText,
  leadsAfterBatchApproval,
  parseBatchApprovalAnswer,
} from "./batch_approval.js";
import { formatHardStop, shouldHaltBatch } from "./hard_stops.js";
import {
  loadBatchManifest,
  preflightLead,
  printAllDrafts,
  printPreflightTable,
} from "./preflight.js";
import {
  batchCooldownMs,
  sendDraftEmailLead,
  sendDraftWhatsAppLead,
} from "./send_one.js";
import {
  enableLiveOutreach,
  resetOutreachSafety,
} from "../test_recipient.js";
import type {
  BatchLeadSpec,
  BatchRunReport,
  HardStopReason,
  LeadSendResult,
  OutreachApprovalMode,
} from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(): {
  live: boolean;
  preflight: boolean;
  batchFile: string | null;
  slug: string | null;
  approvalMode: OutreachApprovalMode | null;
  approve: string | null;
  approveLead: boolean;
  runLogPath: string | null;
} {
  const argv = process.argv.slice(2);
  let batchFile: string | null = null;
  let slug: string | null = null;
  let approvalMode: OutreachApprovalMode | null = null;
  let approve: string | null = null;
  let approveLead = false;
  let runLogPath: string | null = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--batch-file" && argv[i + 1]) batchFile = argv[++i]!;
    else if (arg === "--slug" && argv[i + 1]) slug = argv[++i]!;
    else if (arg === "--approval-mode" && argv[i + 1]) {
      approvalMode = assertValidApprovalMode(argv[++i]!);
    } else if (arg === "--approve" && argv[i + 1]) approve = argv[++i]!;
    else if (arg === "--approve-lead") approveLead = true;
    else if (arg === "--run-log" && argv[i + 1]) runLogPath = argv[++i]!;
  }

  return {
    live: argv.includes("--live"),
    preflight: argv.includes("--preflight"),
    batchFile,
    slug,
    approvalMode,
    approve,
    approveLead: argv.includes("--approve-lead"),
    runLogPath,
  };
}

function appendRunLog(runLogPath: string | null, line: string): void {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  if (runLogPath) {
    fs.mkdirSync(path.dirname(runLogPath), { recursive: true });
    fs.appendFileSync(runLogPath, `${stamped}\n`, "utf8");
  }
}

function resolveLeads(args: ReturnType<typeof parseArgs>): {
  batch_id: string | null;
  leads: BatchLeadSpec[];
} {
  if (args.batchFile) {
    return loadBatchManifest(path.resolve(WEBSITE_ROOT, args.batchFile));
  }
  if (args.slug) {
    return {
      batch_id: null,
      leads: [{ index: 1, slug: args.slug, channel: "whatsapp" }],
    };
  }
  throw new Error("Provide --batch-file <manifest.json> or --slug <slug>.");
}

function streamStatus(result: LeadSendResult, runLogPath: string | null): void {
  const detail = result.detail ? ` (${result.detail})` : "";
  appendRunLog(
    runLogPath,
    `${result.slug} — ${result.outcome}${detail}`
  );
}

async function runBatch(args: ReturnType<typeof parseArgs>): Promise<BatchRunReport> {
  const config = loadWebsiteConfig();
  const approvalMode: OutreachApprovalMode =
    args.approvalMode ?? config.outreach.approval_mode;

  const { batch_id, leads: rawLeads } = resolveLeads(args);
  const preflightRows = await Promise.all(
    rawLeads.map((lead) => preflightLead(lead))
  );

  printPreflightTable(preflightRows);
  printAllDrafts(preflightRows);

  const sendableCount = preflightRows.filter((r) => !r.skip).length;
  console.log(`\noutreach.approval_mode: ${approvalMode} (config default: ${config.outreach.approval_mode})`);
  console.log(`Sendable leads: ${sendableCount} / ${preflightRows.length}`);

  if (args.preflight || !args.live) {
    console.log("\nPreflight only. No sends. Pass --live to send after approval.");
    return {
      batch_id,
      approval_mode: approvalMode,
      results: [],
      halted: false,
      halt_reason: null,
      failure_count: 0,
    };
  }

  let leads = rawLeads;

  if (approvalMode === "batch") {
    console.log(`\n${batchApprovalPromptText(rawLeads.length)}`);
    const decision = args.approve
      ? parseBatchApprovalAnswer(args.approve, rawLeads.length)
      : await askBatchApproval(rawLeads.length);
    if (decision.action === "abort") {
      console.log("Batch aborted. No sends.");
      return {
        batch_id,
        approval_mode: approvalMode,
        results: [],
        halted: false,
        halt_reason: null,
        failure_count: 0,
      };
    }
    leads = leadsAfterBatchApproval(rawLeads, decision);
  }

  console.log("OUTREACH IS NOW LIVE");
  enableLiveOutreach();
  const expectedFlags = readSafetyFlags();
  const cfgAfter = loadWebsiteConfig();
  if (
    !cfgAfter.outreach.sending_enabled ||
    cfgAfter.outreach.test_recipient_only !== false
  ) {
    resetOutreachSafety();
    throw new Error("Could not enable live outreach flags.");
  }

  const results: LeadSendResult[] = [];
  let failureCount = 0;
  let halted = false;
  let haltReason: HardStopReason | null = null;
  let firstSend = true;

  try {
    for (const lead of leads) {
      if (approvalMode === "per_send" && !lead.skip) {
        const ok = args.approveLead || args.approve === "yes"
          ? true
          : await askPerSendApproval(lead, {
              preApproved: args.approve === "yes",
            });
        if (!ok) {
          const skipped: LeadSendResult = {
            index: lead.index,
            slug: lead.slug,
            channel: lead.channel,
            outcome: "skipped",
            detail: "not approved (per_send)",
          };
          results.push(skipped);
          streamStatus(skipped, args.runLogPath);
          continue;
        }
      }

      if (safetyFlagsDrifted(expectedFlags)) {
        halted = true;
        haltReason = "safety_flag_drift";
        appendRunLog(
          args.runLogPath,
          `HALT — ${formatHardStop(haltReason)}`
        );
        break;
      }

      if (!firstSend) {
        await batchCooldownMs();
        if (safetyFlagsDrifted(expectedFlags)) {
          halted = true;
          haltReason = "safety_flag_drift";
          appendRunLog(
            args.runLogPath,
            `HALT — ${formatHardStop(haltReason)}`
          );
          break;
        }
      }
      firstSend = false;

      const result =
        lead.channel === "email"
          ? await sendDraftEmailLead(lead, { batchTiming: true })
          : await sendDraftWhatsAppLead(lead, { batchTiming: true });

      results.push(result);
      streamStatus(result, args.runLogPath);

      if (result.outcome === "failed") {
        failureCount++;
        if (result.hardStop) {
          halted = true;
          haltReason = result.hardStop;
          appendRunLog(
            args.runLogPath,
            `HALT — ${formatHardStop(result.hardStop)}`
          );
          break;
        }
        if (shouldHaltBatch(failureCount)) {
          halted = true;
          haltReason = "cumulative_failures";
          appendRunLog(
            args.runLogPath,
            `HALT — ${formatHardStop(haltReason)}`
          );
          break;
        }
      }
    }
  } finally {
    const safety = resetOutreachSafety();
    appendRunLog(
      args.runLogPath,
      `Safety reset: sending_enabled=${safety.sendingReset ? "false" : "unchanged"}, test_recipient_only=${safety.testOnlyReset ? "true" : "unchanged"}`
    );
  }

  return {
    batch_id,
    approval_mode: approvalMode,
    results,
    halted,
    halt_reason: haltReason,
    failure_count: failureCount,
  };
}

function printFinalReport(report: BatchRunReport): void {
  console.log("\n--- Batch report ---");
  console.log(`batch_id: ${report.batch_id ?? "(none)"}`);
  console.log(`approval_mode: ${report.approval_mode}`);
  console.log(`halted: ${report.halted}${report.halt_reason ? ` (${report.halt_reason})` : ""}`);
  console.log(`failures: ${report.failure_count}`);
  const sent = report.results.filter((r) => r.outcome === "sent").length;
  const skipped = report.results.filter((r) => r.outcome === "skipped").length;
  const failed = report.results.filter((r) => r.outcome === "failed").length;
  console.log(`sent: ${sent} skipped: ${skipped} failed: ${failed}`);
  for (const r of report.results) {
    console.log(`  #${r.index} ${r.slug}: ${r.outcome}${r.detail ? ` — ${r.detail}` : ""}`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs();
  if (!args.live && !args.preflight) {
    console.error("Refusing to run without --preflight or --live.");
    process.exit(1);
  }

  const report = await runBatch(args);
  printFinalReport(report);

  if (report.halted || report.failure_count > 0) {
    process.exit(1);
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((err) => {
    console.error(err);
    resetOutreachSafety();
    process.exit(1);
  });
}

export { runBatch, parseArgs };
