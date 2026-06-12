import sharp from "sharp";

export interface QualityTarget {
  width: number;
  height: number;
  aspectRatio: string;
  minBytes: number;
  maxBytes: number;
}

export interface QualityCheckResult {
  passed: boolean;
  checks: Record<string, { passed: boolean; detail: string }>;
  failures: string[];
}

const LUMINANCE_MIN = 18;
const LUMINANCE_MAX = 238;
const LUMINANCE_STDEV_MIN = 12;
const SKIN_PIXEL_RATIO_MAX = 0.028;
const TEXT_BLOCK_RATIO_MAX = 0.14;

function parseAspectRatio(ratio: string): number {
  const [w, h] = ratio.split(":").map(Number);
  return w / h;
}

function isSkinTone(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 40 || max > 245) return false;
  if (max - min < 15) return false;
  return r > 95 && g > 40 && b > 20 && r > g && r > b && r - g > 12;
}

/** Heuristic face proxy: clustered skin-tone pixels in the upper-centre region. */
async function detectFaceHeuristic(data: Buffer, width: number, height: number): Promise<number> {
  const x0 = Math.floor(width * 0.2);
  const x1 = Math.floor(width * 0.8);
  const y0 = Math.floor(height * 0.05);
  const y1 = Math.floor(height * 0.65);
  let skin = 0;
  let region = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 3;
      region++;
      if (isSkinTone(data[i]!, data[i + 1]!, data[i + 2]!)) skin++;
    }
  }
  return region === 0 ? 0 : skin / region;
}

/** Heuristic text proxy: high horizontal edge density in small blocks. */
async function detectTextHeuristic(data: Buffer, width: number, height: number): Promise<number> {
  const block = 24;
  let textLikeBlocks = 0;
  let totalBlocks = 0;
  for (let by = 0; by + block <= height; by += block) {
    for (let bx = 0; bx + block <= width; bx += block) {
      totalBlocks++;
      let hEdges = 0;
      let vEdges = 0;
      for (let y = by + 1; y < by + block - 1; y++) {
        for (let x = bx + 1; x < bx + block - 1; x++) {
          const i = (y * width + x) * 3;
          const l = (data[i]! + data[i + 1]! + data[i + 2]!) / 3;
          const lRight = (data[i + 3]! + data[i + 4]! + data[i + 5]!) / 3;
          const lDown = (data[(y + 1) * width + x]! + data[(y + 1) * width + x + 1]! + data[(y + 1) * width + x + 2]!) / 3;
          hEdges += Math.abs(l - lRight);
          vEdges += Math.abs(l - lDown);
        }
      }
      const area = (block - 2) * (block - 2);
      const hMean = hEdges / area;
      const vMean = vEdges / area;
      if (hMean > 22 && hMean > vMean * 1.35) textLikeBlocks++;
    }
  }
  return totalBlocks === 0 ? 0 : textLikeBlocks / totalBlocks;
}

export async function runQualityChecks(
  imageBuffer: Buffer,
  target: QualityTarget
): Promise<QualityCheckResult> {
  const checks: Record<string, { passed: boolean; detail: string }> = {};
  const failures: string[] = [];

  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const widthOk =
    width >= target.width * 0.98 && width <= target.width * 1.02;
  checks.dimensions = {
    passed: widthOk && height >= target.height * 0.98 && height <= target.height * 1.02,
    detail: `${width}x${height} (target ${target.width}x${target.height})`,
  };
  if (!checks.dimensions.passed) failures.push("dimension_mismatch");

  const actualRatio = width / Math.max(height, 1);
  const expectedRatio = parseAspectRatio(target.aspectRatio);
  const ratioOk = Math.abs(actualRatio - expectedRatio) / expectedRatio <= 0.02;
  checks.aspect_ratio = {
    passed: ratioOk,
    detail: `${actualRatio.toFixed(3)} vs ${expectedRatio.toFixed(3)}`,
  };
  if (!ratioOk) failures.push("aspect_ratio_mismatch");

  const stats = await sharp(imageBuffer).grayscale().stats();
  const mean = stats.channels[0]?.mean ?? 0;
  const stdev = stats.channels[0]?.stdev ?? 0;
  const meanOk = mean >= LUMINANCE_MIN && mean <= LUMINANCE_MAX;
  checks.luminance_mean = {
    passed: meanOk,
    detail: `mean=${mean.toFixed(1)}`,
  };
  if (mean < LUMINANCE_MIN) failures.push("luminance_low");
  if (mean > LUMINANCE_MAX) failures.push("luminance_high");

  const stdevOk = stdev >= LUMINANCE_STDEV_MIN;
  checks.luminance_stdev = {
    passed: stdevOk,
    detail: `stdev=${stdev.toFixed(1)}`,
  };
  if (!stdevOk) failures.push("flat_blob");

  const { data, info } = await sharp(imageBuffer)
    .resize(512, 512, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const skinRatio = await detectFaceHeuristic(data, info.width, info.height);
  checks.face_heuristic = {
    passed: skinRatio <= SKIN_PIXEL_RATIO_MAX,
    detail: `skin_ratio=${(skinRatio * 100).toFixed(2)}%`,
  };
  if (skinRatio > SKIN_PIXEL_RATIO_MAX) failures.push("face_detected");

  const textRatio = await detectTextHeuristic(data, info.width, info.height);
  checks.text_heuristic = {
    passed: textRatio <= TEXT_BLOCK_RATIO_MAX,
    detail: `text_blocks=${(textRatio * 100).toFixed(1)}%`,
  };
  if (textRatio > TEXT_BLOCK_RATIO_MAX) failures.push("text_detected");

  const bytes = imageBuffer.length;
  const sizeOk = bytes >= target.minBytes && bytes <= target.maxBytes;
  checks.file_size = {
    passed: sizeOk,
    detail: `${Math.round(bytes / 1024)}KB`,
  };
  if (!sizeOk) failures.push("file_size_out_of_range");

  return {
    passed: failures.length === 0,
    checks,
    failures,
  };
}

export async function normalizeToJpeg(
  imageBuffer: Buffer,
  width: number,
  height: number
): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(width, height, { fit: "cover" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}
