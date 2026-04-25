/**
 * Thin fetch wrapper that prefixes all API paths with the FastAPI backend URL.
 *
 * Usage:
 *   import { apiFetch } from "@/lib/api";
 *   const res = await apiFetch("/api/trips", { method: "GET" });
 *
 * When NEXT_PUBLIC_API_BASE_URL is empty (not set), apiFetch falls back to
 * relative paths — which means the Next.js API routes are used instead.
 * This lets you run either backend transparently.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`${API_BASE}${path}`, init);
}
