// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));

/**
 * Miniflare often hydrates Worker secrets from `.dev.vars`, while the tooling process may not.
 * Mirrors Wrangler-compatible KEY=value lines (quotes supported) into `process.env` before startup.
 */
function mergeDotDevVarsIntoProcessEnv() {
  const filePath = join(rootDir, ".dev.vars");
  if (!existsSync(filePath)) return;
  let content: string;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    return;
  }
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = line.slice(0, eqIndex).trim();
    if (!/^[A-Za-z_]\w*$/.test(key)) continue;
    let value = line.slice(eqIndex + 1).trim();
    const dq = value.startsWith('"') && value.endsWith('"') && value.length >= 2;
    const sq = value.startsWith("'") && value.endsWith("'") && value.length >= 2;
    const bt = value.startsWith("`") && value.endsWith("`") && value.length >= 2;
    if (dq || sq || bt) {
      value = value.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'");
    }
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

mergeDotDevVarsIntoProcessEnv();

const viteMode = process.argv.includes("build") ? "production" : "development";

Object.assign(process.env, loadEnv(viteMode, rootDir, ""));

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
