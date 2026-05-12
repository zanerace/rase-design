/**
 * First-time dev: create `.dev.vars` from the example so Wrangler / Vite loads RESEND_API_KEY locally.
 * Replace the placeholder key with a real one from https://resend.com/api-keys
 */
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dest = join(root, ".dev.vars");
const example = join(root, "dev.vars.example");

if (existsSync(dest)) {
  process.exit(0);
}

try {
  copyFileSync(example, dest);
  console.log(
    "\n[Race Digital] Created `.dev.vars` from `dev.vars.example`.\n" +
      "Open `.dev.vars`, replace `RESEND_API_KEY` with your real key from https://resend.com/api-keys,\n" +
      "save, then restart `npm run dev`.\n\n",
  );
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.warn("[Race Digital] Could not create `.dev.vars`:", msg);
}
