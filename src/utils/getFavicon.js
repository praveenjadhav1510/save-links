const FAVICON_API_URL =
  "https://favicon-api-rho.vercel.app/api/favicon?x-api-key=3dc7403302f4b8eccbe9465f0aae978c7e2bb661754a71f9e6ad88a81a9a7a0e";

const EXTENSION_TIMEOUT_MS = 3000;

export const DEFAULT_ICON = `${process.env.PUBLIC_URL || ""}/default.svg`;

// Stored fallback value is the environment-independent sentinel "default.svg".
// Resolve it (and any missing icon) to the real asset path at render time so it
// works regardless of the deployed base path (e.g. GitHub Pages /save-links/).
export function resolveIconUrl(iconUrl) {
  if (!iconUrl || iconUrl === "default.svg") return DEFAULT_ICON;
  return iconUrl;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

async function getFromExtension(url) {
  try {
    if (!window.__savelinksExtension) return null;

    const result = await Promise.race([
      window.__savelinksExtension({ action: "get-favicon", url }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("extension-timeout")), EXTENSION_TIMEOUT_MS)
      ),
    ]);

    return result?.faviconUrl || null;
  } catch {
    return null;
  }
}

async function getFromApi(url) {
  try {
    const response = await fetch(FAVICON_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    if (data.success && data.favicon?.href) {
      return data.favicon.href;
    }
  } catch (error) {
    console.error("Favicon API error:", error);
  }
  return "default.svg";
}

export async function getFaviconUrl(url) {
  if (!url || !isValidUrl(url)) return "default.svg";

  const extensionResult = await getFromExtension(url);
  if (extensionResult) return extensionResult;

  return await getFromApi(url);
}
