/**
 * Save Links Extension — Offscreen Color Extractor
 *
 * Runs in an offscreen document (has DOM/Canvas access).
 * Receives a favicon URL, loads it onto a canvas, samples pixels,
 * and returns the dominant color as a hex string.
 *
 * Color extraction strategy:
 *   1. Draw the favicon onto a 64×64 canvas
 *   2. Read all pixel data
 *   3. Skip transparent and near-white/near-black pixels
 *   4. Quantize remaining colors into buckets (rounding to nearest 16)
 *   5. Return the most frequent color bucket
 *   6. Darken the result if it's too light (for dark-theme card backgrounds)
 */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "extract-color") {
    extractDominantColor(message.imageUrl)
      .then((color) => sendResponse({ success: true, color }))
      .catch((err) => {
        console.warn("[Color Extractor]", err.message);
        sendResponse({ success: false, color: "#1e1e1e" });
      });
    return true; // async response
  }
});

/**
 * Loads an image and extracts its dominant color.
 */
async function extractDominantColor(imageUrl) {
  if (!imageUrl || imageUrl === "default.svg") {
    return "#1e1e1e";
  }

  const img = await loadImage(imageUrl);

  // Draw scaled to 64×64
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const pixels = imageData.data; // [r, g, b, a, r, g, b, a, ...]

  // Count quantized colors
  const colorCounts = {};
  let maxCount = 0;
  let dominantColor = null;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Skip transparent pixels
    if (a < 128) continue;

    // Skip near-white (background/padding)
    if (r > 240 && g > 240 && b > 240) continue;

    // Skip near-black (often outlines)
    if (r < 15 && g < 15 && b < 15) continue;

    // Skip very low saturation grays
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min < 20 && max > 50 && max < 200) continue;

    // Quantize: round to nearest 24 for better grouping
    const qr = Math.round(r / 24) * 24;
    const qg = Math.round(g / 24) * 24;
    const qb = Math.round(b / 24) * 24;

    const key = `${qr},${qg},${qb}`;
    colorCounts[key] = (colorCounts[key] || 0) + 1;

    if (colorCounts[key] > maxCount) {
      maxCount = colorCounts[key];
      dominantColor = { r: qr, g: qg, b: qb };
    }
  }

  if (!dominantColor) {
    return "#1e1e1e"; // fallback
  }

  // Darken the color for card backgrounds (target ~30-50% brightness)
  const darkened = darkenForBackground(dominantColor.r, dominantColor.g, dominantColor.b);

  return rgbToHex(darkened.r, darkened.g, darkened.b);
}

/**
 * Darkens a color so it works as a card background in a dark theme.
 * Targets luminance between 0.08 and 0.20.
 */
function darkenForBackground(r, g, b) {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  let factor;
  if (luminance > 0.5) {
    // Bright color → darken significantly
    factor = 0.30;
  } else if (luminance > 0.3) {
    // Medium color → moderate darkening
    factor = 0.50;
  } else if (luminance > 0.15) {
    // Already somewhat dark → light touch
    factor = 0.75;
  } else {
    // Already very dark — boost slightly so it's not invisible
    factor = 1.2;
  }

  return {
    r: Math.min(255, Math.max(10, Math.round(r * factor))),
    g: Math.min(255, Math.max(10, Math.round(g * factor))),
    b: Math.min(255, Math.max(10, Math.round(b * factor))),
  };
}

/**
 * Converts RGB values to a hex color string.
 */
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Loads an image from a URL, handling CORS via fetch + blob.
 */
function loadImage(url) {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch as blob to bypass CORS restrictions on canvas
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load favicon image"));
      };
      img.src = objectUrl;
    } catch {
      // Fallback: try loading directly (same-origin favicons)
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load favicon image"));
      img.src = url;
    }
  });
}
