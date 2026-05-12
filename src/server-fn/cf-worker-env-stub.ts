/**
 * Vercel/vite (Nitro) cannot resolve Workers virtual `cloudflare:workers`.
 * This stub is swapped in via `vite.config.ts` only when `VERCEL=1`.
 * Mail secrets are read from normal env (`process.env` / dashboard env vars).
 */

export default {};
export const env: Record<string, never> = {};
