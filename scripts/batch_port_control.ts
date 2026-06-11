import fs from "node:fs";
import path from "node:path";

export function batchDir(batchId: string, root: string): string {
  return path.join(root, "data", "batches", batchId);
}

export function pauseFilePath(batchId: string, root: string): string {
  return path.join(batchDir(batchId, root), "pause");
}

export function bailFilePath(batchId: string, slug: string, root: string): string {
  return path.join(batchDir(batchId, root), "jobs", `${slug}.bail`);
}

export function portLogPath(batchId: string, slug: string, root: string): string {
  return path.join(batchDir(batchId, root), "jobs", `${slug}.port.log`);
}

export function isBatchPaused(batchId: string, root: string): boolean {
  return fs.existsSync(pauseFilePath(batchId, root));
}

export function isSlugBailed(batchId: string, slug: string, root: string): boolean {
  return fs.existsSync(bailFilePath(batchId, slug, root));
}

export function writePause(batchId: string, root: string, reason?: string): void {
  const p = pauseFilePath(batchId, root);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(
    p,
    reason?.trim()
      ? `# paused ${new Date().toISOString()}\n${reason.trim()}\n`
      : `# paused ${new Date().toISOString()}\n`
  );
}

export function clearPause(batchId: string, root: string): boolean {
  const p = pauseFilePath(batchId, root);
  if (!fs.existsSync(p)) return false;
  fs.unlinkSync(p);
  return true;
}

export function writeBail(
  batchId: string,
  slug: string,
  root: string,
  reason?: string
): void {
  const p = bailFilePath(batchId, slug, root);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(
    p,
    `# bail ${new Date().toISOString()}\n${reason?.trim() ?? "operator bail"}\n`
  );
}

export function appendPortLog(
  batchId: string,
  slug: string,
  root: string,
  event: string,
  detail?: string
): void {
  const p = portLogPath(batchId, slug, root);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const line = detail
    ? `${new Date().toISOString()} ${event} ${detail}\n`
    : `${new Date().toISOString()} ${event}\n`;
  fs.appendFileSync(p, line);
}

export function countDataSectionIds(html: string): number {
  const matches = html.match(/data-section-id=/gi);
  return matches?.length ?? 0;
}

export function validatePortSectionIds(html: string, min = 3): { ok: boolean; count: number } {
  const count = countDataSectionIds(html);
  return { ok: count >= min, count };
}
