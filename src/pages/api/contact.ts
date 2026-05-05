/**
 * POST /api/contact
 * Body: { name: string, type?: "personal" | "consulting", captchaToken: string, captchaAnswer: string }
 *
 * Leichtes Name-Gate plus Math-Captcha. Liefert beide Mails zurück, damit der Client
 * nach erfolgreichem Submit zwischen "Persönlich" und "Consulting" wechseln kann
 * ohne neuen API-Roundtrip.
 */
import type { APIRoute } from "astro";
import { verifyChallenge } from "~/lib/captcha.ts";
import { getContact } from "~/lib/contact.ts";
import { check, getClientKey } from "~/lib/rate-limit.ts";

export const prerender = false;

function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...init.headers,
    },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const key = getClientKey(request, clientAddress);
  const rl = check(key);
  if (!rl.ok) {
    return json(
      {
        ok: false,
        error: `// Zu viele Anfragen. Warte ${Math.ceil(rl.retryAfterSec / 60)} Min.`,
        retryAfter: rl.retryAfterSec,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "// Ungültige Anfrage." }, { status: 400 });
  }

  const obj = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const name = typeof obj.name === "string" ? obj.name.trim() : "";
  const type = obj.type === "consulting" ? "consulting" : "personal";

  if (name.length < 2) {
    return json({ ok: false, error: "// Bitte Namen angeben (min. 2 Zeichen)." }, { status: 400 });
  }
  if (name.length > 120) {
    return json({ ok: false, error: "// Name zu lang." }, { status: 400 });
  }

  const captcha = verifyChallenge(obj.captchaToken, obj.captchaAnswer);
  if (!captcha.ok) {
    const msg =
      captcha.reason === "wrong_answer"
        ? "// Sicherheitscheck stimmt nicht. Versuch's nochmal."
        : captcha.reason === "expired"
          ? "// Sicherheitscheck abgelaufen. Lade die Seite neu."
          : "// Sicherheitscheck fehlgeschlagen.";
    return json({ ok: false, error: msg, captchaFailed: true }, { status: 400 });
  }

  const contact = getContact();
  const email = type === "consulting" ? contact.emailConsulting : contact.email;
  return json({
    ok: true,
    type,
    email,
    emails: {
      personal: contact.email,
      consulting: contact.emailConsulting,
    },
  });
};

export const GET: APIRoute = () =>
  json({ ok: false, error: "Method not allowed" }, { status: 405 });
