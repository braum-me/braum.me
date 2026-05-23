/**
 * Lightweight math captcha. Server issues `a + b` challenge with HMAC-signed token,
 * client submits answer + token, server verifies. Stateless, no session needed.
 *
 * Token format: `${b64Payload}.${b64Sig}` where payload = JSON.stringify({a, b, exp}).
 */

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "./env.ts";

const TTL_MS = 10 * 60 * 1000;

function getSecret(): string {
  const secret = env("CAPTCHA_SECRET");
  if (!secret) {
    throw new Error("CAPTCHA_SECRET is not set. Generate one with `openssl rand -hex 32` and set it in your environment.");
  }
  return secret;
}

function b64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf) : buf;
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", getSecret()).update(payload).digest());
}

export interface Challenge {
  a: number;
  b: number;
  prompt: string;
  token: string;
}

export function issueChallenge(): Challenge {
  const a = randomInt(1, 10);
  const b = randomInt(1, 10);
  const exp = Date.now() + TTL_MS;
  const payload = JSON.stringify({ a, b, exp });
  const encoded = b64url(payload);
  const signature = sign(encoded);
  return {
    a,
    b,
    prompt: `${a} + ${b}`,
    token: `${encoded}.${signature}`,
  };
}

export interface VerifyResult {
  ok: boolean;
  reason?: "malformed" | "bad_signature" | "expired" | "wrong_answer";
}

export function verifyChallenge(token: unknown, answer: unknown): VerifyResult {
  if (typeof token !== "string" || token.length === 0) return { ok: false, reason: "malformed" };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [encoded, sig] = parts;
  if (!encoded || !sig) return { ok: false, reason: "malformed" };

  const expected = sign(encoded);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }

  let payload: { a: number; b: number; exp: number };
  try {
    payload = JSON.parse(fromB64url(encoded).toString());
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (typeof payload.exp !== "number" || payload.exp < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const expectedAnswer = payload.a + payload.b;
  const userAnswer = typeof answer === "string" ? Number(answer.trim()) : Number(answer);
  if (!Number.isFinite(userAnswer) || userAnswer !== expectedAnswer) {
    return { ok: false, reason: "wrong_answer" };
  }
  return { ok: true };
}
