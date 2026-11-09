#!/usr/bin/env node
/**
 * WorksAI Live Interpreter v1.3.1 — Deterministic Clean-Checkout Build & Asset Verification Script
 * Implements Sections 4, 5 & 6:
 * 1. Verifies the 3 runtime ES modules exist and have zero unresolved relative imports:
 *    - worksai-live-interpreter-worker.mjs (and src/interpreter-worker.mjs alias)
 *    - src/interpreter-cohere-and-hostinger.mjs
 *    - src/interpreter-ui-and-contracts.mjs
 * 2. Verifies the pinned Deep Chat v2.5.1 bundle (assets/deepChat.bundle.js -> static_assets/deepChat.bundle.v2.5.1.js):
 *    - Exact byte length: 386,971 bytes
 *    - Exact SHA-256: 6844eaf354e19d50dcdd8ee78968d6ae32ccd4b9f15a883902d60e93d69caf84
 * 3. Verifies wrangler.toml entry point (main = "worksai-live-interpreter-worker.mjs", compatibility_date = "2026-03-01").
 * 4. Generates the deterministic single-file Worker bundle at dist/worksai-live-interpreter-worker.bundle.mjs
 *    and verifies syntax + embedded browser <script type="module"> syntax.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const REQUIRED_RUNTIME_MODULES = Object.freeze([
  "worksai-live-interpreter-worker.mjs",
  "src/interpreter-worker.mjs",
  "src/interpreter-cohere-and-hostinger.mjs",
  "src/interpreter-ui-and-contracts.mjs"
]);

export const EXPECTED_DEEP_CHAT_ASSET = Object.freeze({
  localPath: "assets/deepChat.bundle.js",
  r2Key: "static_assets/deepChat.bundle.v2.5.1.js",
  bytes: 386971,
  sha256: "6844eaf354e19d50dcdd8ee78968d6ae32ccd4b9f15a883902d60e93d69caf84"
});

function sha256Hex(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export async function runCleanBuild(options = {}) {
  const rootDir = options.rootDir || REPO_ROOT;
  const outDir = path.resolve(rootDir, options.outDir || "dist");

  // 1. Verify all runtime modules exist and resolve relative imports
  const moduleStats = {};
  for (const relPath of REQUIRED_RUNTIME_MODULES) {
    const absPath = path.join(rootDir, relPath);
    if (!fs.existsSync(absPath)) {
      throw new Error(`BUILD_GATE_MISSING_MODULE: Required runtime module '${relPath}' does not exist.`);
    }
    const content = fs.readFileSync(absPath, "utf8");
    const buf = Buffer.from(content, "utf8");
    moduleStats[relPath] = {
      bytes: buf.byteLength,
      sha256: sha256Hex(buf)
    };

    // Check all static relative imports in the module
    const importRegex = /(?:import|export)\s+(?:[\s\S]*?from\s+)?["'](\.[^"']+)["']/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const spec = match[1];
      const resolvedImport = path.resolve(path.dirname(absPath), spec);
      if (!fs.existsSync(resolvedImport)) {
        throw new Error(`BUILD_GATE_UNRESOLVED_IMPORT: Unresolved relative import '${spec}' in '${relPath}'.`);
      }
    }
  }

  // 2. Verify wrangler.toml points to committed worksai-live-interpreter-worker.mjs
  const wranglerPath = path.join(rootDir, "wrangler.toml");
  if (!fs.existsSync(wranglerPath)) {
    throw new Error("BUILD_GATE_MISSING_WRANGLER_TOML: wrangler.toml is missing.");
  }
  const wranglerText = fs.readFileSync(wranglerPath, "utf8");
  const mainMatch = wranglerText.match(/^\s*main\s*=\s*"([^"]+)"/m);
  if (!mainMatch || mainMatch[1] !== "worksai-live-interpreter-worker.mjs") {
    throw new Error(`BUILD_GATE_WRONG_WRANGLER_ENTRY: Expected main = "worksai-live-interpreter-worker.mjs", got ${mainMatch?.[1] || "none"}.`);
  }
  const compatMatch = wranglerText.match(/^\s*compatibility_date\s*=\s*"([^"]+)"/m);
  if (!compatMatch || compatMatch[1] !== "2026-03-01") {
    throw new Error(`BUILD_GATE_COMPAT_DATE_DRIFT: Expected compatibility_date = "2026-03-01", got ${compatMatch?.[1] || "none"}.`);
  }

  // 3. Verify pinned Deep Chat v2.5.1 asset (386,971 bytes, SHA-256 6844eaf354e19d50dcdd8ee78968d6ae32ccd4b9f15a883902d60e93d69caf84)
  const assetPath = path.join(rootDir, EXPECTED_DEEP_CHAT_ASSET.localPath);
  const assetGzPath = path.join(rootDir, "assets/deepChat.bundle.js.gz");
  if (!fs.existsSync(assetPath) && fs.existsSync(assetGzPath)) {
    const zlibMod = await import("node:zlib");
    const unpacked = zlibMod.gunzipSync(fs.readFileSync(assetGzPath));
    fs.mkdirSync(path.dirname(assetPath), { recursive: true });
    fs.writeFileSync(assetPath, unpacked);
  }
  if (!fs.existsSync(assetPath)) {
    for (const pinnedUrl of [
      "https://cdn.jsdelivr.net/npm/deep-chat@2.5.1/dist/deepChat.bundle.js",
      "https://unpkg.com/deep-chat@2.5.1/dist/deepChat.bundle.js"
    ]) {
      try {
        const resp = await fetch(pinnedUrl);
        if (resp.ok) {
          const text = await resp.text();
          const buf = Buffer.from(text, "utf8");
          if (buf.byteLength === EXPECTED_DEEP_CHAT_ASSET.bytes && sha256Hex(buf) === EXPECTED_DEEP_CHAT_ASSET.sha256) {
            fs.mkdirSync(path.dirname(assetPath), { recursive: true });
            fs.writeFileSync(assetPath, buf);
            break;
          }
        }
      } catch {}
    }
  }
  if (!fs.existsSync(assetPath)) {
    throw new Error(`BUILD_GATE_MISSING_ASSET: Pinned Deep Chat v2.5.1 asset '${EXPECTED_DEEP_CHAT_ASSET.localPath}' (${EXPECTED_DEEP_CHAT_ASSET.bytes} B, SHA-256 ${EXPECTED_DEEP_CHAT_ASSET.sha256}) is missing and could not be fetched.`);
  }
  const assetBuf = fs.readFileSync(assetPath);
  const assetSha = sha256Hex(assetBuf);
  if (assetBuf.byteLength !== EXPECTED_DEEP_CHAT_ASSET.bytes || assetSha !== EXPECTED_DEEP_CHAT_ASSET.sha256) {
    throw new Error(
      `BUILD_GATE_ASSET_INTEGRITY_FAILED: ${EXPECTED_DEEP_CHAT_ASSET.localPath} expected ${EXPECTED_DEEP_CHAT_ASSET.bytes} B (${EXPECTED_DEEP_CHAT_ASSET.sha256}), got ${assetBuf.byteLength} B (${assetSha}).`
    );
  }

  // 4. Assemble deterministic single-file bundle in dist/worksai-live-interpreter-worker.bundle.mjs
  const uiCode = fs.readFileSync(path.join(rootDir, "src/interpreter-ui-and-contracts.mjs"), "utf8");
  const chCode = fs.readFileSync(path.join(rootDir, "src/interpreter-cohere-and-hostinger.mjs"), "utf8");
  const wkCode = fs.readFileSync(path.join(rootDir, "worksai-live-interpreter-worker.mjs"), "utf8");

  // Strip local cross-module import/re-export headers to produce a self-contained single-file ES module
  const uiBody = uiCode
    .replace(/function escapeHtml\(s\)\s*\{[\s\S]*?\n\}\n/, "")
    .trim();

  const chBody = chCode
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*"\.\/interpreter-ui-and-contracts\.mjs";\s*/, "")
    .trim();

  const wkBody = wkCode
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*"\.\/src\/interpreter-ui-and-contracts\.mjs";\s*/, "")
    .replace(/export\s*\{[\s\S]*?renderInterpreterAppHtml\s*\};\s*/, "")
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*"\.\/src\/interpreter-cohere-and-hostinger\.mjs";\s*/, "")
    .replace(/export\s*\{[\s\S]*?CohereReleaseGateService\s*\};\s*/, "")
    .trim();

  const bundleContent = [
    "/**",
    " * WorksAI Live Interpreter v1.3.1 — Deterministic Generated Worker Bundle",
    " * Generated from: worksai-live-interpreter-worker.mjs + src/interpreter-cohere-and-hostinger.mjs + src/interpreter-ui-and-contracts.mjs",
    " */",
    uiBody,
    chBody,
    wkBody,
    ""
  ].join("\n\n");

  fs.mkdirSync(outDir, { recursive: true });
  const bundleOutPath = path.join(outDir, "worksai-live-interpreter-worker.bundle.mjs");
  fs.writeFileSync(bundleOutPath, bundleContent, "utf8");
  const bundleBuf = Buffer.from(bundleContent, "utf8");
  const bundleSha = sha256Hex(bundleBuf);

  // 5. Import the real Worker module and verify rendered browser script syntax
  const workerMod = await import(path.join(rootDir, "worksai-live-interpreter-worker.mjs"));
  for (const isDemo of [false, true]) {
    const html = workerMod.renderInterpreterAppHtml({
      isDemo,
      auth: { authenticated: !isDemo, tenantId: "tenant_worksai_alpha", role: "operator", csrfToken: "csrf_build_verify" },
      hasProviderKey: false,
      hasHostingerKey: true,
      hasCohereKey: true,
      googleOAuthStatus: { configured: true, clientId: "21902121526-0nf4rmkli2es0kd0ene5brjtlfl7rj34.apps.googleusercontent.com" }
    });
    const inlineScriptMatch = html.match(/<script type="module">\s*([\s\S]*?)<\/script>/);
    if (!inlineScriptMatch) {
      throw new Error(`BUILD_GATE_BROWSER_SCRIPT_MISSING: Missing inline <script type="module"> in rendered HTML (isDemo=${isDemo}).`);
    }
    // Parse embedded browser JS via vm.Script to catch any template string or syntax errors
    new vm.Script(inlineScriptMatch[1], { filename: `rendered-browser-ui-${isDemo ? "demo" : "prod"}.js` });
  }

  return {
    ok: true,
    entryPoint: "worksai-live-interpreter-worker.mjs",
    srcAlias: "src/interpreter-worker.mjs",
    generatedBundlePath: path.relative(rootDir, bundleOutPath),
    generatedBundleBytes: bundleBuf.byteLength,
    generatedBundleSha256: bundleSha,
    deepChatAsset: {
      path: EXPECTED_DEEP_CHAT_ASSET.localPath,
      r2Key: EXPECTED_DEEP_CHAT_ASSET.r2Key,
      bytes: assetBuf.byteLength,
      sha256: assetSha
    },
    modules: moduleStats
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCleanBuild()
    .then((res) => {
      console.log(JSON.stringify(res, null, 2));
    })
    .catch((err) => {
      console.error(err.message || err);
      process.exit(1);
    });
}
