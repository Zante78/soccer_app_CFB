/**
 * Visual Regression Engine — pixelmatch-based screenshot comparison
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { dirname } from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { logger } from './logger.js';

export type VisualDiffResult = {
  diff_score: number;
  pixel_count_total: number;
  pixel_count_diff: number;
  threshold_exceeded: boolean;
  tolerance: number;
  screenshot_actual_path: string;
  screenshot_baseline_path: string;
  diff_image_path?: string;
};

type CompareOptions = {
  /** pixelmatch color threshold (0-1, default: 0.1) */
  colorThreshold?: number;
  /** Diff score threshold for failure (default: 0.002 = 0.2%) */
  diffThreshold?: number;
  /** Path to write the diff overlay image */
  outputDiffPath?: string;
};

/**
 * Compare two screenshots using pixelmatch.
 *
 * - If baseline doesn't exist: returns score 0 with warning
 * - If dimensions mismatch: pads smaller image to match
 * - Generates diff overlay image (red = differences)
 */
export async function compareScreenshots(
  actualPath: string,
  baselinePath: string,
  options: CompareOptions = {}
): Promise<VisualDiffResult> {
  const { colorThreshold = 0.1, diffThreshold = 0.002, outputDiffPath } = options;

  // Handle missing baseline
  if (!existsSync(baselinePath)) {
    logger.warn(`No baseline found at ${baselinePath} — skipping comparison`);
    return {
      diff_score: 0,
      pixel_count_total: 0,
      pixel_count_diff: 0,
      threshold_exceeded: false,
      tolerance: diffThreshold,
      screenshot_actual_path: actualPath,
      screenshot_baseline_path: baselinePath,
    };
  }

  // Load images
  const actualImg = PNG.sync.read(readFileSync(actualPath));
  const baselineImg = PNG.sync.read(readFileSync(baselinePath));

  // Normalize dimensions (pad smaller image with white)
  const width = Math.max(actualImg.width, baselineImg.width);
  const height = Math.max(actualImg.height, baselineImg.height);

  const actualNorm = normalizeSize(actualImg, width, height);
  const baselineNorm = normalizeSize(baselineImg, width, height);

  // Create diff output buffer
  const diff = new PNG({ width, height });

  // Run pixelmatch
  const diffPixels = pixelmatch(
    actualNorm.data,
    baselineNorm.data,
    diff.data,
    width,
    height,
    { threshold: colorThreshold }
  );

  const totalPixels = width * height;
  const diffScore = totalPixels > 0 ? diffPixels / totalPixels : 0;
  const thresholdExceeded = diffScore > diffThreshold;

  // Save diff image if requested
  const diffImagePath = outputDiffPath ?? actualPath.replace('.png', '_diff.png');
  if (diffPixels > 0) {
    const diffDir = dirname(diffImagePath);
    if (!existsSync(diffDir)) mkdirSync(diffDir, { recursive: true });
    writeFileSync(diffImagePath, PNG.sync.write(diff));
    logger.info(`Diff image saved: ${diffImagePath}`);
  }

  const result: VisualDiffResult = {
    diff_score: diffScore,
    pixel_count_total: totalPixels,
    pixel_count_diff: diffPixels,
    threshold_exceeded: thresholdExceeded,
    tolerance: diffThreshold,
    screenshot_actual_path: actualPath,
    screenshot_baseline_path: baselinePath,
    diff_image_path: diffPixels > 0 ? diffImagePath : undefined,
  };

  logger.info(
    `Visual regression: ${(diffScore * 100).toFixed(3)}% diff ` +
    `(${diffPixels}/${totalPixels} pixels) — ${thresholdExceeded ? 'FAILED' : 'PASSED'}`
  );

  return result;
}

/**
 * Copy a screenshot as a new baseline reference.
 */
export function createBaseline(
  screenshotPath: string,
  baselineDir: string,
  baselineName: string
): string {
  if (!existsSync(baselineDir)) mkdirSync(baselineDir, { recursive: true });

  const baselinePath = `${baselineDir}/${baselineName}`;
  copyFileSync(screenshotPath, baselinePath);
  logger.info(`New baseline created: ${baselinePath}`);
  return baselinePath;
}

/**
 * Pad/crop a PNG to target dimensions (fills with white pixels).
 */
function normalizeSize(img: PNG, targetWidth: number, targetHeight: number): PNG {
  if (img.width === targetWidth && img.height === targetHeight) {
    return img;
  }

  const normalized = new PNG({ width: targetWidth, height: targetHeight, fill: true });

  // Fill with white (RGBA: 255, 255, 255, 255)
  for (let i = 0; i < normalized.data.length; i += 4) {
    normalized.data[i] = 255;     // R
    normalized.data[i + 1] = 255; // G
    normalized.data[i + 2] = 255; // B
    normalized.data[i + 3] = 255; // A
  }

  // Copy original image data into normalized buffer
  for (let y = 0; y < img.height && y < targetHeight; y++) {
    for (let x = 0; x < img.width && x < targetWidth; x++) {
      const srcIdx = (y * img.width + x) * 4;
      const dstIdx = (y * targetWidth + x) * 4;
      normalized.data[dstIdx] = img.data[srcIdx];
      normalized.data[dstIdx + 1] = img.data[srcIdx + 1];
      normalized.data[dstIdx + 2] = img.data[srcIdx + 2];
      normalized.data[dstIdx + 3] = img.data[srcIdx + 3];
    }
  }

  return normalized;
}
