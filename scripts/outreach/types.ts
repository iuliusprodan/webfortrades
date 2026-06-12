/** Outreach send approval: per lead vs one-shot batch. */
export type OutreachApprovalMode = "per_send" | "batch";

export type OutreachChannel = "whatsapp" | "email";

export interface BatchLeadSpec {
  /** 1-based row index in the batch table (stable for yes-except). */
  index: number;
  slug: string;
  channel: OutreachChannel;
  siteUrl?: string;
  waiveContactability?: boolean;
  /** Required when channel=email. */
  emailTo?: string;
  /** Pre-marked skip (e.g. no email address). */
  skip?: boolean;
  skipReason?: string;
}

export interface OutreachBatchManifest {
  batch_id?: string;
  leads: BatchLeadSpec[];
}

export type BatchApprovalDecision =
  | { action: "abort" }
  | { action: "proceed"; skipIndices: Set<number> };

export type HardStopReason =
  | "gateway_unreachable"
  | "http_client_error"
  | "http_server_error"
  | "recipient_unavailable"
  | "cumulative_failures"
  | "safety_flag_drift";

export type LeadSendOutcome = "sent" | "skipped" | "failed";

export interface LeadSendResult {
  index: number;
  slug: string;
  channel: OutreachChannel;
  outcome: LeadSendOutcome;
  detail?: string;
  hardStop?: HardStopReason;
}

export interface BatchRunReport {
  batch_id: string | null;
  approval_mode: OutreachApprovalMode;
  results: LeadSendResult[];
  halted: boolean;
  halt_reason: HardStopReason | null;
  failure_count: number;
}
