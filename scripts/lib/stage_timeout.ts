import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";

export const STAGE_TIMEOUT_MS = {
  portInvoke: 25 * 60_000,
  nextBuild: 10 * 60_000,
  vercelDeploy: 8 * 60_000,
} as const;

export interface TimedCommandResult {
  ok: boolean;
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  stage: string;
}

/**
 * Run a subprocess with a hard kill after timeoutMs. Logs BAILED_TIMEOUT on timeout.
 */
export function runCommandWithHardTimeout(
  command: string,
  args: string[],
  stage: string,
  timeoutMs: number,
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    logFile?: string;
    onTimeout?: (child: ChildProcess) => void;
  } = {}
): Promise<TimedCommandResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    const logStream = options.logFile
      ? fs.createWriteStream(options.logFile, { flags: "a" })
      : null;

    const finish = (result: TimedCommandResult): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (logStream) logStream.end();
      resolve(result);
    };

    const handle = (buf: Buffer, isErr: boolean): void => {
      const text = buf.toString();
      if (isErr) stderr += text;
      else stdout += text;
      if (logStream) logStream.write(text);
    };

    child.stdout.on("data", (b) => handle(b, false));
    child.stderr.on("data", (b) => handle(b, true));

    const timer = setTimeout(() => {
      const msg = `BAILED_TIMEOUT ${stage} exceeded ${Math.round(timeoutMs / 60_000)}m\n`;
      if (logStream) logStream.write(msg);
      options.onTimeout?.(child);
      try {
        child.kill("SIGTERM");
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        try {
          if (!child.killed) child.kill("SIGKILL");
        } catch {
          /* ignore */
        }
        finish({
          ok: false,
          code: null,
          stdout,
          stderr: stderr + msg,
          timedOut: true,
          stage,
        });
      }, 5000);
    }, timeoutMs);

    child.on("close", (code) => {
      finish({ ok: code === 0, code, stdout, stderr, timedOut: false, stage });
    });
    child.on("error", (err) => {
      finish({
        ok: false,
        code: null,
        stdout,
        stderr: stderr + String(err),
        timedOut: false,
        stage,
      });
    });
  });
}
