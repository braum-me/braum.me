/**
 * GET /api/captcha
 * Issues a lightweight HMAC-signed math challenge.
 */
import type { APIRoute } from "astro";
import { issueChallenge } from "~/lib/captcha.ts";

export const prerender = false;

export const GET: APIRoute = () => {
  const c = issueChallenge();
  return new Response(JSON.stringify({ ok: true, prompt: c.prompt, token: c.token }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};
