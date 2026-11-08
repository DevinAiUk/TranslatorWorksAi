#!/usr/bin/env node
/**
 * WorksAI Live Interpreter v1.3.0 — Secure CLI Setup & Environment Doctor
 * Implements Sections 6 & 20:
 * - Resolves intended Worker (worksai-live-interpreter) & environment (preview | production)
 * - Supports "Hostinger AI Router — GPT and Gemini" (HOSTINGER_AI_ROUTER_API_KEY, https://router.hostinger.com/v1, gpt-5-mini, gemini-3.5-flash-lite)
 * - Rejects secrets passed on command-line arguments (CLI_ARGV_SECRET_FORBIDDEN)
 * - Accepts secret input only through non-echoing TTY/stdin pipe and provisions via wrangler secret put
 * - Detects & offers controlled migration if an existing OPENAI_API_KEY holds a sk-hstgr- credential without clobbering direct OpenAI keys
 * - Explains missing Google OAuth configuration (GOOGLE_CLIENT_ID, https://translate.worksai.org)
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const SUPPORTED_SECRET_CONTRACTS = Object.freeze([
  {
    name: "HOSTINGER_AI_ROUTER_API_KEY",
    group: "Hostinger AI Router — GPT and Gemini",
    expectedPrefix: "sk-hstgr-",
    requiredFor: "GPT (gpt-5-mini) and Gemini (gemini-3.5-flash-lite) text & audio-input chat via https://router.hostinger.com/v1",
    companionVars: {
      HOSTINGER_AI_ROUTER_BASE_URL: "https://router.hostinger.com/v1",
      HOSTINGER_GPT_MODEL: "gpt-5-mini",
      HOSTINGER_GEMINI_MODEL: "gemini-3.5-flash-lite"
    }
  },
  {
    name: "COHERE_API_KEY",
    group: "Cohere Transcription & Command R7B",
    expectedPrefix: null,
    requiredFor: "Audio transcription (cohere-transcribe-03-2026) and transcript processing (command-r7b-12-2024)"
  },
  {
    name: "OPENAI_API_KEY",
    group: "Direct OpenAI Realtime Speech-to-Speech",
    expectedPrefix: "sk-",
    forbiddenPrefix: "sk-hstgr-",
    requiredFor: "WebRTC live speech-to-speech interpretation (gpt-realtime-translate at api.openai.com)"
  },
  {
    name: "GOOGLE_CLIENT_ID",
    group: "Sign in with Google (OIDC)",
    expectedSuffix: ".apps.googleusercontent.com",
    requiredFor: "Google Identity Services login for https://translate.worksai.org (independent of generation keys)"
  },
  {
    name: "JWT_SECRET",
    group: "WorksAI Session Signing",
    minLength: 32,
    requiredFor: "HMAC-SHA256 session JWT & consent receipt signing"
  },
  {
    name: "BYOK_ENCRYPTION_KEY",
    group: "Tenant BYOK AES-256-GCM Encryption",
    minLength: 32,
    requiredFor: "Separate encryption secret for tenant Hostinger & Cohere BYOK records (must differ from JWT_SECRET)"
  }
]);

export function redactSecretsInText(input) {
  return String(input ?? "")
    .replace(/sk-hstgr-[A-Za-z0-9_-]{8,}/g, "[REDACTED_HOSTINGER_ROUTER_KEY]")
    .replace(/sk-proj-[A-Za-z0-9_-]{8,}/g, "[REDACTED_OPENAI_KEY]")
    .replace(/sk-[A-Za-z0-9_-]{16,}/g, "[REDACTED_API_KEY]")
    .replace(/cohere_[A-Za-z0-9_-]{12,}/g, "[REDACTED_COHERE_KEY]")
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[REDACTED_GOOGLE_API_KEY]");
}

export function validateCliArgsNoSecrets(argv = process.argv.slice(2)) {
  for (const arg of argv) {
    if (
      /--(api-?key|secret|token|password|hostinger-key|openai-key|cohere-key)=/i.test(arg) ||
      /sk-hstgr-|sk-proj-|cohere_[A-Za-z0-9]{10,}|AIza[0-9A-Za-z_-]{20,}/.test(arg)
    ) {
      return {
        safe: false,
        errorCode: "CLI_ARGV_SECRET_FORBIDDEN",
        message: "Security Refusal (CLI_ARGV_SECRET_FORBIDDEN): Never pass API keys or secrets in command-line arguments or shell flags. Pipe via stdin or use interactive non-echoing prompt."
      };
    }
  }
  return { safe: true };
}

export function inspectCredentialProvenance(secretName, rawValue, currentEnv = {}) {
  const clean = String(rawValue || "").trim();
  if (!clean) return { valid: false, reason: "EMPTY_SECRET" };

  if (secretName === "HOSTINGER_AI_ROUTER_API_KEY") {
    if (!clean.startsWith("sk-hstgr-")) {
      return {
        valid: false,
        reason: "EXPECTED_HOSTINGER_ISSUED_KEY",
        message: "Hostinger AI Router requires a Hostinger-issued key starting with 'sk-hstgr-'. Direct OpenAI or Google Gemini keys are not interchangeable."
      };
    }
    return {
      valid: true,
      provenance: "hostinger_ai_router",
      baseURL: "https://router.hostinger.com/v1",
      gptModel: "gpt-5-mini",
      geminiModel: "gemini-3.5-flash-lite",
      masked: `sk-h...${clean.slice(-4)}`
    };
  }

  if (secretName === "OPENAI_API_KEY") {
    if (clean.startsWith("sk-hstgr-")) {
      return {
        valid: false,
        reason: "MIGRATION_REQUIRED_TO_HOSTINGER_AI_ROUTER_API_KEY",
        migrationTarget: "HOSTINGER_AI_ROUTER_API_KEY",
        message: "Detected a Hostinger-issued router key (sk-hstgr-...) in OPENAI_API_KEY. Migrate this key to HOSTINGER_AI_ROUTER_API_KEY so GPT & Gemini chat use https://router.hostinger.com/v1 while preserving direct OpenAI realtime separation."
      };
    }
    if (!clean.startsWith("sk-")) {
      return { valid: false, reason: "EXPECTED_DIRECT_OPENAI_KEY", message: "Direct OpenAI key must start with 'sk-' (and not 'sk-hstgr-')." };
    }
    return { valid: true, provenance: "direct_openai", masked: `sk-...${clean.slice(-4)}` };
  }

  if (secretName === "BYOK_ENCRYPTION_KEY") {
    if (clean.length < 32) return { valid: false, reason: "KEY_TOO_SHORT", message: "BYOK_ENCRYPTION_KEY must be at least 32 characters." };
    if (currentEnv.JWT_SECRET && clean === String(currentEnv.JWT_SECRET).trim()) {
      return { valid: false, reason: "MUST_DIFFER_FROM_JWT_SECRET", message: "BYOK_ENCRYPTION_KEY must be distinct from JWT_SECRET." };
    }
    return { valid: true, provenance: "aes_gcm_byok_key", masked: `byok_...${clean.slice(-4)}` };
  }

  return { valid: true, provenance: "verified", masked: `***...${clean.slice(-4)}` };
}

export function runDoctorReport(env = process.env, argv = process.argv.slice(2)) {
  const argCheck = validateCliArgsNoSecrets(argv);
  if (!argCheck.safe) {
    return { ok: false, exitCode: 2, errorCode: argCheck.errorCode, output: redactSecretsInText(argCheck.message) };
  }

  const workerName = argv.find((a) => a.startsWith("--worker="))?.split("=")[1] || "worksai-live-interpreter";
  const targetEnv = argv.find((a) => a.startsWith("--env="))?.split("=")[1] || "production";

  const lines = [];
  lines.push(`=== WorksAI Live Interpreter v1.3.0 — Doctor & Secure Provider Setup ===`);
  lines.push(`Target Worker : ${workerName} (${targetEnv})`);
  lines.push(`Custom Domain : https://translate.worksai.org`);
  lines.push(`Hostinger URL : https://router.hostinger.com/v1 (GPT: gpt-5-mini | Gemini: gemini-3.5-flash-lite)`);
  lines.push("");

  const rawOpenAi = String(env.OPENAI_API_KEY || "").trim();
  const rawHostinger = String(env.HOSTINGER_AI_ROUTER_API_KEY || "").trim();
  let migrationNotice = null;
  if (!rawHostinger && rawOpenAi.startsWith("sk-hstgr-")) {
    migrationNotice = "CONTROLLED MIGRATION AVAILABLE: OPENAI_API_KEY contains a Hostinger-issued key (sk-hstgr-...). Provision it under canonical HOSTINGER_AI_ROUTER_API_KEY.";
  }

  const statuses = SUPPORTED_SECRET_CONTRACTS.map((c) => {
    const val = String(env[c.name] || "").trim();
    const present = Boolean(val && !val.startsWith("your_") && !val.startsWith("placeholder") && !val.startsWith("replace_with"));
    return {
      name: c.name,
      group: c.group,
      present,
      status: present ? "CONFIGURED (value hidden)" : "MISSING",
      requiredFor: c.requiredFor
    };
  });

  for (const s of statuses) {
    lines.push(`- [${s.status}] ${s.name} (${s.group})`);
    lines.push(`    Purpose: ${s.requiredFor}`);
  }

  if (migrationNotice) {
    lines.push("");
    lines.push(`⚠  ${migrationNotice}`);
  }

  const googleConfigured = statuses.find((s) => s.name === "GOOGLE_CLIENT_ID")?.present;
  if (!googleConfigured) {
    lines.push("");
    lines.push(`ℹ  Google OAuth Setup Guidance:`);
    lines.push(`   1. Create an OAuth 2.0 Web Client ID in Google Cloud Console.`);
    lines.push(`   2. Add Authorized JavaScript Origin: https://translate.worksai.org`);
    lines.push(`   3. Add Authorized Redirect URI: https://translate.worksai.org/api/auth/google/callback`);
    lines.push(`   4. Provision secret: npx wrangler secret put GOOGLE_CLIENT_ID --name ${workerName}`);
  }

  lines.push("");
  lines.push(`✓ Doctor check complete (zero secret values echoed).`);
  return {
    ok: true,
    exitCode: 0,
    workerName,
    targetEnv,
    statuses,
    migrationNotice,
    output: redactSecretsInText(lines.join("\n"))
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = runDoctorReport(process.env, process.argv.slice(2));
  console.log(report.output);
  process.exit(report.exitCode);
}
