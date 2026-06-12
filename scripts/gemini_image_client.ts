const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export const MODEL_COST_USD: Record<string, number> = {
  "gemini-3-pro-image-preview": 0.134,
  "gemini-3-flash-image-preview": 0.101,
};

export interface GenerateImageOptions {
  apiKey: string;
  model: string;
  prompt: string;
  aspectRatio: "4:3" | "3:4";
  imageSize?: "1K" | "2K" | "4K";
}

export interface GenerateImageResult {
  imageBuffer: Buffer;
  mimeType: string;
  model: string;
  estimatedCostUsd: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function estimatedCost(model: string): number {
  return MODEL_COST_USD[model] ?? 0.134;
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxAttempts = 3
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (res.status >= 500 || res.status === 429) {
        const body = await res.text();
        lastError = new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
        if (attempt < maxAttempts) {
          await sleep(500 * 2 ** (attempt - 1));
          continue;
        }
      }
      const body = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${body.slice(0, 500)}`);
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await sleep(500 * 2 ** (attempt - 1));
        continue;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function generateGeminiImage(
  opts: GenerateImageOptions
): Promise<GenerateImageResult> {
  const url = `${GEMINI_API_BASE}/models/${encodeURIComponent(opts.model)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: opts.aspectRatio,
        imageSize: opts.imageSize ?? "2K",
      },
    },
  };

  const cost = estimatedCost(opts.model);
  console.log(`  API call: model=${opts.model} aspect=${opts.aspectRatio} est=$${cost.toFixed(3)}`);

  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { mimeType?: string; data?: string };
        }>;
      };
    }>;
    error?: { message?: string };
  };

  if (json.error?.message) {
    throw new Error(`Gemini API: ${json.error.message}`);
  }

  const parts = json.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData;
    if (inline?.data) {
      return {
        imageBuffer: Buffer.from(inline.data, "base64"),
        mimeType: inline.mimeType ?? "image/png",
        model: opts.model,
        estimatedCostUsd: cost,
      };
    }
  }

  throw new Error("Gemini API returned no image data in response.");
}

export function logEstimatedCost(model: string, imageCount: number): number {
  const unit = estimatedCost(model);
  const total = unit * imageCount;
  console.log(`Estimated cost: $${unit.toFixed(3)} x ${imageCount} = $${total.toFixed(3)} USD`);
  return total;
}
