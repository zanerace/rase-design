/**
 * The Cloudflare/Vite build can copy `.dev.vars` into `dist/server/`, which ships your Resend key in the output folder.
 * Remove it after builds; use root `.dev.vars` for `vite dev` / local wrangler, and `wrangler secret put` for deploys.
 */
import { existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const candidate = join(root, "dist", "server", ".dev.vars");

if (existsSync(candidate)) {
  rmSync(candidate, { force: true });
  console.log(
    "[strip-dev-vars] Removed dist/server/.dev.vars (keep secrets in root .dev.vars only).",
  );
}
