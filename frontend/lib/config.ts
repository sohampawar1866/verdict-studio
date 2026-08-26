/**
 * Dynamic Application Configuration
 * Resolves Backend HTTP & WebSocket base URLs from environment variables
 * with sensible production fallback behaviors for Cloudflare Pages and Render.
 */

export const getApiBaseUrl = (): string => {
  if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  return "http://localhost:8000";
};

export const getWsBaseUrl = (): string => {
  if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL.replace(/\/+$/, "");
  }
  const apiUrl = getApiBaseUrl();
  if (apiUrl.startsWith("https://")) {
    return apiUrl.replace(/^https:\/\//, "wss://");
  }
  if (apiUrl.startsWith("http://")) {
    return apiUrl.replace(/^http:\/\//, "ws://");
  }
  return "ws://localhost:8000";
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = getWsBaseUrl();
