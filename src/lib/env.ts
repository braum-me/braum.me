/**
 * Env-Helper. Liest zuerst aus process.env (Docker/Prod), Fallback import.meta.env (Astro dev).
 * So funktioniert der Code sowohl im `pnpm dev` als auch im Docker-Container.
 */

export function env(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  const m = import.meta.env as Record<string, string | undefined>;
  return m[key];
}
