/**
 * In-memory Rate-Limiter. Ausreichend für Single-Instance Coolify-Deploy.
 * Für Multi-Instance wäre Redis/KV nötig.
 *
 * Default: 5 Versuche pro 15 Minuten pro Key (IP).
 * Automatisches Cleanup alter Einträge alle 5 Minuten.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

import { env } from "./env.ts";

const MAX = Number(env("RATE_LIMIT_MAX") ?? 5);
const WINDOW_MS = Number(env("RATE_LIMIT_WINDOW_MS") ?? 15 * 60 * 1000);
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

let cleanupHandle: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupHandle) return;
  cleanupHandle = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  if (typeof cleanupHandle.unref === "function") cleanupHandle.unref();
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

export function check(key: string): RateLimitResult {
  ensureCleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX - 1, resetAt: now + WINDOW_MS, retryAfterSec: 0 };
  }

  if (entry.count >= MAX) {
    return {
      ok: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    ok: true,
    remaining: MAX - entry.count,
    resetAt: entry.resetAt,
    retryAfterSec: 0,
  };
}

export function reset(key: string): void {
  store.delete(key);
}

export function getClientKey(request: Request, clientAddress?: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    if (first) return first.trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return clientAddress ?? "unknown";
}
