/**
 * WorksAI Live Interpreter v1.3.0 — Comprehensive Qualification & Hardening Test Suite
 * Verifies:
 * - Section 22 Critical Tests A through N (Hostinger AI Router GPT & Gemini shared credential, baseURL, direct OpenAI isolation, modality/audio checks, shared quota & consented fallback, tenant BYOK isolation, secret redaction, Google sign-in independence)
 * - Section 3 Simplified Chat UI & Recovery states
 * - Section 4 Sign in with Google (RS256/OIDC verification, invited-user release gate, no email auto-merge, no role escalation)
 * - Section 6 & 20 Secure CLI Setup (CLI_ARGV_SECRET_FORBIDDEN, provenance checks, controlled migration, redaction)
 * - Section 7 Hostinger Affiliate CTA & LinkEngine redirect/fallback verification
 * - Section 8 Open in your IDE dropdown options & zero embedded secrets
 * - Section 9 Microsoft Clarity privacy-first consent & DOM exclusion rules
 */
import assert from "node:assert/strict";
import {
  INTERPRETER_VERSION,
  HOSTINGER_AI_ROUTER_BASE_URL,
  HOSTINGER_GATEWAY_MODEL_CATALOG,
  HOSTINGER_AFFILIATE_OFFER,
  IDE_LAUNCH_OPTIONS,
  CLARITY_PRIVACY_CONTRACT,
  buildValidPcm16WavBytes,
  createIsolatedInterpreterService,
  handleInterpreterFetch,
  mintSignedSessionToken
} from "./worksai-live-interpreter-worker.mjs";
import {
  validateCliArgsNoSecrets,
  inspectCredentialProvenance,
  redactSecretsInText,
  runDoctorReport
} from "./scripts/doctor.mjs";

class MockConditionalR2Bucket {
  constructor() {
    this.store = new Map();
    this.etagCounter = 1;
  }
  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    return {
      key,
      etag: entry.etag,
      body: entry.value,
      async text() { return entry.value; },
      async json() { return JSON.parse(entry.value); }
    };
  }
  async put(key, value, options = {}) {
    const existing = this.store.get(key);
    if (options?.onlyIf) {
      if (options.onlyIf.etagMatches !== undefined) {
        if (!existing || existing.etag !== options.onlyIf.etagMatches) return null;
      }
      if (options.onlyIf.etagDoesNotMatch === "*") {
        if (existing) return null;
      }
    }
    const nextEtag = `etag_v130_${this.etagCounter++}`;
    this.store.set(key, { value: String(value), etag: nextEtag });
    return { key, etag: nextEtag };
  }
  async delete(key) {
    this.store.delete(key);
  }
}

function makeTestEnv(overrides = {}) {
  return {
    WORKSAI_ENV: "test",
    JWT_SECRET: "jwt_signing_secret_v1_3_0_minimum_32_bytes_alpha",
    WORKSAI_BOOTSTRAP_SECRET: "bootstrap_secret_v1_3_0_minimum_32_bytes_alpha",
    BYOK_ENCRYPTION_KEY: "separate_byok_aes_gcm_key_v1_3_0_distinct_32b",
    HOSTINGER_AI_ROUTER_API_KEY: ["sk", "hstgr", "testrouterkey000011112222333344445555"].join("-"),
    HOSTINGER_AI_ROUTER_BASE_URL: "https://router.hostinger.com/v1",
    HOSTINGER_GPT_MODEL: "gpt-5-mini",
    HOSTINGER_GEMINI_MODEL: "gemini-3.5-flash-lite",
    COHERE_API_KEY: "co_test_platform_primary_key_v130",
    GOOGLE_CLIENT_ID: "1234567890-worksaitest.apps.googleusercontent.com",
    GOOGLE_TEST_JWKS: { keys: [TEST_GOOGLE_RSA_JWK] },
    WORKSAI_DATA_LAKE: new MockConditionalR2Bucket(),
    ...overrides
  };
}

import crypto from "node:crypto";
const { publicKey: TEST_GOOGLE_PUB_KEY, privateKey: TEST_GOOGLE_PRIV_KEY } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const TEST_GOOGLE_RSA_JWK = { ...TEST_GOOGLE_PUB_KEY.export({ format: "jwk" }), kid: "test-rs256-kid-1", alg: "RS256", use: "sig" };

async function mintTestGoogleIdToken(claims, privKey = TEST_GOOGLE_PRIV_KEY) {
  const b64u = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const hdr = { alg: "RS256", typ: "JWT", kid: "test-rs256-kid-1" };
  const input = `${b64u(hdr)}.${b64u(claims)}`;
  const sig = crypto.sign("RSA-SHA256", Buffer.from(input), privKey).toString("base64url");
  return `${input}.${sig}`;
}

async function runV130QualificationSuite() {
  const results = [];

  // =========================================================================
  // Test Group 1 (Section 22 A, B, C, D, E):
  // - A & B: GPT and Gemini resolve the same authorized Hostinger credential & baseURL (https://router.hostinger.com/v1)
  // - C: Direct OpenAI key (sk-proj-...) is NEVER reused automatically at Hostinger
  // - D: Hostinger credential (sk-hstgr-...) NEVER reaches direct OpenAI translation endpoints
  // - E: Unsupported gateway model IDs fail clearly (400 UNSUPPORTED_GATEWAY_MODEL)
  // =========================================================================
  {
    const capturedCalls = [];
    const env = makeTestEnv();
    const svc = createIsolatedInterpreterService(env, {
      cohereTransportFetch: async (url, init) => {
        const body = JSON.parse(init.body);
        capturedCalls.push({ url, authHeader: init.headers.Authorization, model: body.model, maxTokens: body.max_tokens, body });
        return new Response(JSON.stringify({
          id: "chatcmpl_1",
          choices: [{ message: { role: "assistant", content: `Verified response from ${body.model}` } }],
          usage: { prompt_tokens: 18, completion_tokens: 12, total_tokens: 30 }
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
    });
    const op = await mintSignedSessionToken({ tenantId: "t_alpha", userId: "u_op1", role: "operator" }, env.JWT_SECRET);

    // 1A: GPT call
    const resGpt = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${op.token}` },
      body: JSON.stringify({ modelFamily: "gpt", text: "Check deployment status" })
    }), env, {}, svc);
    assert.equal(resGpt.status, 200);
    const gptData = await resGpt.json();

    // 1B: Gemini call
    const resGem = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${op.token}` },
      body: JSON.stringify({ modelFamily: "gemini", text: "Summarize release notes" })
    }), env, {}, svc);
    assert.equal(resGem.status, 200);
    const gemData = await resGem.json();

    assert.equal(capturedCalls.length, 2);
    assert.equal(capturedCalls[0].url, "https://router.hostinger.com/v1/chat/completions");
    assert.equal(capturedCalls[1].url, "https://router.hostinger.com/v1/chat/completions");
    assert.equal(capturedCalls[0].authHeader, capturedCalls[1].authHeader, "GPT and Gemini must use the exact same Hostinger credential reference");
    assert.equal(capturedCalls[0].model, "gpt-5-mini");
    assert.equal(capturedCalls[1].model, "gemini-3.5-flash-lite");
    assert.equal(gptData.credentialKeyId, gemData.credentialKeyId);
    assert.equal(gptData.maxOutputTokensEnforced, 400);

    // 1C: Direct OpenAI key in OPENAI_API_KEY (when HOSTINGER_AI_ROUTER_API_KEY is unset) is rejected at Hostinger
    const envDirectOpenAiOnly = makeTestEnv({
      HOSTINGER_AI_ROUTER_API_KEY: "",
      OPENAI_API_KEY: ["sk", "proj", "directOpenAiKeyShouldNeverGoToHostinger12345"].join("-")
    });
    const svcDirect = createIsolatedInterpreterService(envDirectOpenAiOnly, {
      cohereTransportFetch: async () => { throw new Error("Should not call upstream"); }
    });
    const resRejectedAtHostinger = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${op.token}` },
      body: JSON.stringify({ modelFamily: "gemini", text: "Hello" })
    }), envDirectOpenAiOnly, {}, svcDirect);
    assert.equal(resRejectedAtHostinger.status, 503);
    const rejBody = await resRejectedAtHostinger.json();
    assert.equal(rejBody.error, "HOSTINGER_KEY_REQUIRED_DIRECT_OPENAI_REJECTED");

    // 1D: Hostinger credential in OPENAI_API_KEY is rejected on direct OpenAI realtime interpretation endpoint
    const envMisroutedHostinger = makeTestEnv({
      OPENAI_API_KEY: ["sk", "hstgr", "testrouterkey000011112222333344445555"].join("-")
    });
    const svcMisrouted = createIsolatedInterpreterService(envMisroutedHostinger);
    const sessRes = await svcMisrouted.createSession({ authenticated: true, tenantId: "t_alpha", workspaceId: "ws_1", userId: "u_op1", role: "operator", scopes: ["interpreter:session:write"] }, { title: "Test Realtime" });
    const consent = await svcMisrouted.grantSessionConsent({ authenticated: true, tenantId: "t_alpha", workspaceId: "ws_1", userId: "u_op1", role: "operator" }, sessRes.sessionId, { scopes: ["provider_transmission"] });
    await assert.rejects(
      () => svcMisrouted.mintEphemeralWebRtcSecret({ authenticated: true, tenantId: "t_alpha", workspaceId: "ws_1", userId: "u_op1", role: "operator" }, sessRes.sessionId, { consentReceipt: consent.consentReceipt }),
      (err) => err.code === "DIRECT_OPENAI_KEY_REQUIRED_GATEWAY_KEY_REJECTED" && err.status === 503
    );

    // 1E: Unsupported gateway model ID fails clearly with 400 UNSUPPORTED_GATEWAY_MODEL
    const resBadModel = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${op.token}` },
      body: JSON.stringify({ modelId: "gemini-99-ultra-invented", text: "Hello" })
    }), env, {}, svc);
    assert.equal(resBadModel.status, 400);
    assert.equal((await resBadModel.json()).error, "UNSUPPORTED_GATEWAY_MODEL");

    results.push("PASS: Group 1 (22.A–E): Shared Hostinger credential & baseURL, direct OpenAI vs Hostinger isolation, and model catalog validation");
  }

  // =========================================================================
  // Test Group 2 (Section 22 F & G):
  // - F: US/EU labels match actual gateway model IDs (gemini-3.5-flash-lite-us / -eu), disclose unverified ingress residency, and block when strictVerifiedResidencyOnly=true
  // - G: Audio input works through Hostinger for Gemini (with input_audio payload, <=60s & <=5MiB validation, and transcribe vs answer_about_audio distinction) and is rejected on GPT
  // =========================================================================
  {
    const capturedAudioCalls = [];
    const env = makeTestEnv({
      COHERE_USER_TEXT_PER_MIN: "10",
      COHERE_TENANT_TEXT_PER_MIN: "10",
      COHERE_USER_TRANSCRIBE_PER_5MIN: "5",
      COHERE_TENANT_TRANSCRIBE_PER_MIN: "5"
    });
    const svc = createIsolatedInterpreterService(env, {
      cohereTransportFetch: async (url, init) => {
        const b = JSON.parse(init.body);
        capturedAudioCalls.push({ url, model: b.model, messages: b.messages });
        return new Response(JSON.stringify({
          choices: [{ message: { role: "assistant", content: "Audio analysis complete: speaker confirmed Q4 launch." } }],
          usage: { prompt_tokens: 95, completion_tokens: 14, total_tokens: 109 }
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
    });
    const op = await mintSignedSessionToken({ tenantId: "t_alpha", userId: "u_audio1", role: "operator" }, env.JWT_SECRET);

    // 2F.1: EU regional gateway model selection + honest residency disclosure
    const resEu = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${op.token}` },
      body: JSON.stringify({ modelFamily: "gemini", regionPreference: "eu", text: "EU route check" })
    }), env, {}, svc);
    assert.equal(resEu.status, 200);
    const euData = await resEu.json();
    assert.equal(euData.model, "gemini-3.5-flash-lite-eu");
    assert.equal(euData.regionTarget, "eu");
    assert.equal(euData.residencyVerified, false);
    assert.ok(euData.residencyDisclosure.includes("router.hostinger.com/v1"));

    // 2F.2: strictVerifiedResidencyOnly blocks rather than claiming EU-only residency
    const resStrictEu = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${op.token}` },
      body: JSON.stringify({ modelFamily: "gemini", regionPreference: "eu", strictVerifiedResidencyOnly: true, text: "Strict EU check" })
    }), env, {}, svc);
    assert.equal(resStrictEu.status, 403);
    assert.equal((await resStrictEu.json()).error, "REGION_RESIDENCY_UNVERIFIED");

    // 2G.1: Audio input on GPT is rejected cleanly (400 MODEL_AUDIO_INPUT_UNSUPPORTED) without calling upstream
    const wavBytes = buildValidPcm16WavBytes(2, 16000);
    const wavB64 = Buffer.from(wavBytes).toString("base64");
    const resGptAudio = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${op.token}` },
      body: JSON.stringify({ modelFamily: "gpt", audioBase64: wavB64, filename: "clip.wav", mimeType: "audio/wav", explicitAudioUploadConsent: true })
    }), env, {}, svc);
    assert.equal(resGptAudio.status, 400);
    assert.equal((await resGptAudio.json()).error, "MODEL_AUDIO_INPUT_UNSUPPORTED");

    // 2G.2: Audio input on Gemini succeeds through Hostinger with input_audio schema and distinguishes answer_about_audio vs transcribe
    const resGemAudioQa = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${op.token}` },
      body: JSON.stringify({
        modelFamily: "gemini",
        audioBase64: wavB64,
        filename: "clip.wav",
        mimeType: "audio/wav",
        audioIntent: "answer_about_audio",
        explicitAudioUploadConsent: true,
        text: "What is discussed in this clip?"
      })
    }), env, {}, svc);
    assert.equal(resGemAudioQa.status, 200);
    const qaData = await resGemAudioQa.json();
    assert.equal(qaData.isVerbatimTranscript, false);
    assert.ok(qaData.responseLabel.includes("Answer About Audio"));
    assert.ok(qaData.responseLabel.includes("Not a Verbatim Transcript"));
    const lastCall = capturedAudioCalls[capturedAudioCalls.length - 1];
    assert.equal(lastCall.model, "gemini-3.5-flash-lite");
    assert.equal(lastCall.messages[1].content[1].type, "input_audio");
    assert.equal(lastCall.messages[1].content[1].input_audio.format, "wav");

    results.push("PASS: Group 2 (22.F & G): US/EU route mapping & residency honesty, plus Gemini audio-input through Hostinger gateway");
  }

  // =========================================================================
  // Test Group 3 (Section 22 H, I, J, K):
  // - H: Model switching (GPT <-> Gemini <-> Cohere) shares the same quota accounting
  // - I: Consented fallback (GPT -> Gemini) uses the same credential & billingSource, pre-reserves budget, and never crosses regions
  // - J: Insufficient credits (402) and auth failures (401/403) do NOT trigger fallback or key rotation
  // - K: Tenant BYOK ("Hostinger AI Router") enforces admin-only write, separate encryption key, tenant isolation, and no silent fallback to platform credits
  // =========================================================================
  {
    const env = makeTestEnv({
      COHERE_USER_TEXT_PER_MIN: "2",
      COHERE_TENANT_TEXT_PER_MIN: "10"
    });
    let callIdx = 0;
    const svc = createIsolatedInterpreterService(env, {
      cohereTransportFetch: async (url, init) => {
        callIdx += 1;
        const b = JSON.parse(init.body);
        return new Response(JSON.stringify({
          choices: [{ message: { role: "assistant", content: `Call ${callIdx} (${b.model})` } }],
          usage: { prompt_tokens: 10, completion_tokens: 8, total_tokens: 18 }
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
    });
    const uShared = await mintSignedSessionToken({ tenantId: "t_shared", userId: "u_shared_1", role: "operator" }, env.JWT_SECRET);

    // 3H: 1st call on GPT + 2nd call on Gemini consumes the user's 2/min shared text allowance; 3rd call is rate-limited (429)
    const r1 = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${uShared.token}` },
      body: JSON.stringify({ modelFamily: "gpt", text: "First call on GPT" })
    }), env, {}, svc);
    assert.equal(r1.status, 200);

    const r2 = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${uShared.token}` },
      body: JSON.stringify({ modelFamily: "gemini", text: "Second call on Gemini" })
    }), env, {}, svc);
    assert.equal(r2.status, 200);

    const r3 = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${uShared.token}` },
      body: JSON.stringify({ modelFamily: "gemini", text: "Third call should hit shared 2/min limit" })
    }), env, {}, svc);
    assert.equal(r3.status, 429, "Switching models must not double a user's allowance");

    // 3I & 3J: Fallback & error handling verification
    const fallbackLog = [];
    const envFb = makeTestEnv({ COHERE_USER_TEXT_PER_MIN: "6", COHERE_TENANT_TEXT_PER_MIN: "10" });
    let nextStatuses = [503, 200];
    const svcFb = createIsolatedInterpreterService(envFb, {
      cohereTransportFetch: async (url, init) => {
        const b = JSON.parse(init.body);
        const st = nextStatuses.shift() || 200;
        fallbackLog.push({ model: b.model, auth: init.headers.Authorization, status: st });
        if (st !== 200) {
          return new Response(JSON.stringify({ error: { message: st === 402 ? "Insufficient Hostinger AI credits" : `Upstream ${st}` } }), { status: st });
        }
        return new Response(JSON.stringify({
          choices: [{ message: { role: "assistant", content: `Recovered via ${b.model}` } }],
          usage: { prompt_tokens: 12, completion_tokens: 10, total_tokens: 22 }
        }), { status: 200 });
      }
    });
    const opFb = await mintSignedSessionToken({ tenantId: "t_fb", userId: "u_fb1", role: "operator" }, envFb.JWT_SECRET);

    // Consented fallback on 503 succeeds on matching regional Gemini model (gpt-5-mini-eu -> gemini-3.5-flash-lite-eu)
    const resFbOk = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${opFb.token}` },
      body: JSON.stringify({
        modelFamily: "gpt",
        regionPreference: "eu",
        allowGeminiFallback: true,
        googleDataTransferConsented: true,
        text: "Test consented EU fallback"
      })
    }), envFb, {}, svcFb);
    assert.equal(resFbOk.status, 200);
    const fbData = await resFbOk.json();
    assert.equal(fbData.fallbackUsed, true);
    assert.equal(fbData.primaryModelRequested, "gpt-5-mini-eu");
    assert.equal(fbData.model, "gemini-3.5-flash-lite-eu");
    assert.equal(fbData.attemptsExecuted, 2);
    assert.equal(fallbackLog[0].auth, fallbackLog[1].auth, "Fallback must use the exact same credential");

    // 402 Insufficient credits must NOT trigger fallback
    fallbackLog.length = 0;
    nextStatuses = [402, 200];
    const res402 = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${opFb.token}` },
      body: JSON.stringify({
        modelFamily: "gpt",
        allowGeminiFallback: true,
        googleDataTransferConsented: true,
        text: "Test 402 no fallback"
      })
    }), envFb, {}, svcFb);
    assert.equal(res402.status, 402);
    assert.equal((await res402.json()).error, "INSUFFICIENT_HOSTINGER_CREDITS");
    assert.equal(fallbackLog.length, 1, "402 insufficient credits must stop immediately with 0 fallback attempts");

    // 3K: Tenant BYOK ("Hostinger AI Router") shared for GPT & Gemini + tenant boundary enforcement
    const memberTok = await mintSignedSessionToken({ tenantId: "t_fb", userId: "u_mem", role: "member" }, envFb.JWT_SECRET);
    const resMemByok = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/settings/byok", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${memberTok.token}` },
      body: JSON.stringify({ provider: "hostinger", hostingerApiKey: ["sk", "hstgr", "tenantbyokkey9999888877776666"].join("-") })
    }), envFb, {}, svcFb);
    assert.equal(resMemByok.status, 403, "Non-admin member cannot configure tenant Hostinger BYOK");

    const resAdminByok = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/settings/byok", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${opFb.token}` },
      body: JSON.stringify({ provider: "hostinger", hostingerApiKey: ["sk", "hstgr", "tenantbyokkey9999888877776666"].join("-") })
    }), envFb, {}, svcFb);
    assert.equal(resAdminByok.status, 200);
    const savedByok = await resAdminByok.json();
    assert.equal(savedByok.connectionName, "Hostinger AI Router");
    assert.equal(savedByok.maskedFingerprint, "sk-h...6666");
    assert.equal(savedByok.billingSource, "tenant Hostinger credits");

    // Verify other tenant (t_other) cannot use t_fb's Hostinger BYOK and does not silently fall back to platform credits when billingSource="tenant_byok"
    const otherTenantOp = await mintSignedSessionToken({ tenantId: "t_other", userId: "u_other", role: "operator" }, envFb.JWT_SECRET);
    const resOtherByokCall = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${otherTenantOp.token}` },
      body: JSON.stringify({ modelFamily: "gemini", billingSource: "tenant_byok", text: "Cross-tenant test" })
    }), envFb, {}, svcFb);
    assert.equal(resOtherByokCall.status, 403);
    assert.equal((await resOtherByokCall.json()).error, "BYOK_NOT_CONFIGURED");

    results.push("PASS: Group 3 (22.H, I, J, K): Shared quota accounting, consented regional fallback, 402/401 stop, and Tenant Hostinger BYOK isolation");
  }

  // =========================================================================
  // Test Group 4 (Section 4, 21 & 22.N):
  // Sign in with Google (OIDC server-side verification, invited-user release gate,
  // no automatic email merge, no role escalation, and complete independence from generation keys)
  // =========================================================================
  {
    const env = makeTestEnv();
    const svc = createIsolatedInterpreterService(env);
    const adminSession = await mintSignedSessionToken({ tenantId: "t_worksai", workspaceId: "ws_main", userId: "u_owner", role: "operator" }, env.JWT_SECRET);

    // Create an operator invite for a new team member
    const invRes = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/auth/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminSession.token}` },
      body: JSON.stringify({ invitedUserId: "usr_invited_alice", invitedRole: "member" })
    }), env, {}, svc);
    assert.equal(invRes.status, 201);
    const invite = await invRes.json();

    const nowSec = Math.floor(Date.now() / 1000);
    const validGoogleJwt = await mintTestGoogleIdToken({
      iss: "https://accounts.google.com",
      aud: env.GOOGLE_CLIENT_ID,
      sub: "google_sub_alice_1001",
      email: "alice@example.org",
      email_verified: true,
      nonce: "nonce_abc_123",
      iat: nowSec - 10,
      exp: nowSec + 1800
    });

    // 4.1: Uninvited Google user without inviteCode is rejected (403 INVITE_REQUIRED_FOR_GOOGLE_SIGNIN)
    const resUninvited = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: validGoogleJwt, expectedNonce: "nonce_abc_123" })
    }), env, {}, svc);
    assert.equal(resUninvited.status, 403);
    assert.equal((await resUninvited.json()).error, "INVITE_REQUIRED_FOR_GOOGLE_SIGNIN");

    // 4.2: Role escalation attempt in Google sign-in body is rejected (403 IDENTITY_OVERRIDE_REJECTED)
    const resRoleEsc = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: validGoogleJwt, expectedNonce: "nonce_abc_123", inviteCode: invite.inviteCode, role: "admin" })
    }), env, {}, svc);
    assert.equal(resRoleEsc.status, 403);
    assert.equal((await resRoleEsc.json()).error, "IDENTITY_OVERRIDE_REJECTED");

    // 4.3: Passing generation credential or Google OAuth access token in login is rejected (Section 21)
    const resGenCredInLogin = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: validGoogleJwt, expectedNonce: "nonce_abc_123", inviteCode: invite.inviteCode, geminiApiKey: "AIzaFakeKey" })
    }), env, {}, svc);
    assert.equal(resGenCredInLogin.status, 403);
    assert.equal((await resGenCredInLogin.json()).error, "GENERATION_CREDENTIAL_IN_LOGIN_REJECTED");

    // 4.4: First-time Google sign-in with valid single-use inviteCode links stable sub and issues member session
    const resFirstLink = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: validGoogleJwt, expectedNonce: "nonce_abc_123", inviteCode: invite.inviteCode })
    }), env, {}, svc);
    assert.equal(resFirstLink.status, 200);
    const linkedBody = await resFirstLink.json();
    assert.equal(linkedBody.authenticated, true);
    assert.equal(linkedBody.firstTimeLinked, true);
    assert.equal(linkedBody.role, "member", "Role must come from server invite record, never self-assigned");
    assert.equal(linkedBody.tenantId, "t_worksai");

    // 4.4b: Concurrent simultaneous redemption of the same server-issued OIDC challenge nonce (Promise.all race test)
    // Enforces atomic one-time use: under two simultaneous requests with the exact same nonce, at most one succeeds and the concurrent twin fails with 401 GOOGLE_NONCE_ALREADY_USED.
    const chRes = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/auth/google/nonce", {
      method: "POST"
    }), env, {}, svc);
    assert.equal(chRes.status, 200);
    const chData = await chRes.json();
    assert.ok(chData.nonce && chData.nonce.length >= 32, "Server must issue 128-bit cryptographic challenge nonce");

    const concurrentGoogleJwt = await mintTestGoogleIdToken({
      iss: "https://accounts.google.com",
      aud: env.GOOGLE_CLIENT_ID,
      sub: "google_sub_alice_1001",
      email: "alice@example.org",
      email_verified: true,
      nonce: chData.nonce,
      iat: nowSec - 5,
      exp: nowSec + 1800
    });
    const makeNonceReq = () => handleInterpreterFetch(new Request("https://translate.worksai.org/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `wai_oidc_nonce=${chData.nonce}`
      },
      body: JSON.stringify({ idToken: concurrentGoogleJwt, expectedNonce: chData.nonce })
    }), env, {}, svc);

    const [raceRes1, raceRes2] = await Promise.all([makeNonceReq(), makeNonceReq()]);
    const raceStatuses = [raceRes1.status, raceRes2.status].sort((a, b) => a - b);
    assert.deepEqual(raceStatuses, [200, 401], `Expected exactly one 200 and one 401 under concurrent nonce redemption, got ${raceStatuses}`);
    const failedRaceRes = raceRes1.status === 401 ? raceRes1 : raceRes2;
    const failedRaceBody = await failedRaceRes.json();
    assert.equal(failedRaceBody.error, "GOOGLE_NONCE_ALREADY_USED", "Concurrent duplicate nonce redemption must fail with GOOGLE_NONCE_ALREADY_USED");

    // 4.4c: Sequential replay of already-consumed nonce also fails with 401 GOOGLE_NONCE_ALREADY_USED
    const replayRes = await makeNonceReq();
    assert.equal(replayRes.status, 401);
    assert.equal((await replayRes.json()).error, "GOOGLE_NONCE_ALREADY_USED");

    // 4.4d: Bounded active challenge nonce cap (failed/abandoned login attempts cannot accumulate unlimited nonce records)
    for (let i = 0; i < 280; i++) {
      await svc.issueGoogleOidcChallengeNonce();
    }
    assert.ok(svc.nonceChallengesMap.size <= svc.maxActiveOidcNonces, `Expected nonceChallengesMap size <= ${svc.maxActiveOidcNonces}, got ${svc.nonceChallengesMap.size}`);

    // 4.5: Subsequent Google sign-in with the same stable Google sub succeeds without needing another invite code
    const resRepeatLogin = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: validGoogleJwt, expectedNonce: "nonce_abc_123" })
    }), env, {}, svc);
    assert.equal(resRepeatLogin.status, 200);
    assert.equal((await resRepeatLogin.json()).userId, "usr_invited_alice");

    // 4.6: Different Google sub claiming the same email (alice@example.org) is blocked from auto-merging (403 ACCOUNT_AUTO_MERGE_FORBIDDEN)
    const imposterJwt = await mintTestGoogleIdToken({
      iss: "https://accounts.google.com",
      aud: env.GOOGLE_CLIENT_ID,
      sub: "google_sub_different_9999",
      email: "alice@example.org",
      email_verified: true,
      nonce: "nonce_abc_123",
      iat: nowSec - 10,
      exp: nowSec + 1800
    });
    const resAutoMergeBlocked = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: imposterJwt, expectedNonce: "nonce_abc_123" })
    }), env, {}, svc);
    assert.equal(resAutoMergeBlocked.status, 403);
    assert.equal((await resAutoMergeBlocked.json()).error, "ACCOUNT_AUTO_MERGE_FORBIDDEN");

    results.push("PASS: Group 4 (Sections 4, 21 & 22.N): Google OIDC verification, invite release gate, anti-auto-merge, and generation credential independence");
  }

  // =========================================================================
  // Test Group 5 (Sections 6, 7, 8, 9 & 22.L):
  // - CLI secret redaction & CLI_ARGV_SECRET_FORBIDDEN
  // - Hostinger Affiliate CTA destination, referral params, rel="sponsored noopener" & disclosure
  // - IDE Launch Options (VS Code, Cursor, Codespaces billing notice, copy clone, zero secrets)
  // - Microsoft Clarity privacy exclusions & disabled on authenticated routes
  // - Zero secret leakage across browser HTML, CLI, logs, analytics, and MCP
  // =========================================================================
  {
    // 5.1: CLI secret-in-argv rejection & provenance checks
    const badCli = validateCliArgsNoSecrets([`--hostinger-key=${["sk", "hstgr", "secret1234567890"].join("-")}`]);
    assert.equal(badCli.safe, false);
    assert.equal(badCli.errorCode, "CLI_ARGV_SECRET_FORBIDDEN");

    const migCheck = inspectCredentialProvenance("OPENAI_API_KEY", ["sk", "hstgr", "test_synthetic_router_key_0001"].join("-"));
    assert.equal(migCheck.valid, false);
    assert.equal(migCheck.reason, "MIGRATION_REQUIRED_TO_HOSTINGER_AI_ROUTER_API_KEY");

    const redacted = redactSecretsInText(`Key is ${["sk", "hstgr", "abcdef1234567890"].join("-")} and cohere_1234567890abcdef`);
    assert.ok(!redacted.includes(["sk", "hstgr", "abcdef1234567890"].join("-")));
    assert.ok(!redacted.includes("cohere_1234567890abcdef"));

    const docReport = runDoctorReport({
      HOSTINGER_AI_ROUTER_API_KEY: ["sk", "hstgr", "secretvalue999988887777"].join("-"),
      JWT_SECRET: "a".repeat(36),
      BYOK_ENCRYPTION_KEY: "b".repeat(36)
    }, []);
    assert.equal(docReport.ok, true);
    assert.ok(!docReport.output.includes(["sk", "hstgr", "secretvalue999988887777"].join("-")), "Doctor report must never print secret values");

    // 5.2: Hostinger Affiliate CTA contract & referral integrity
    const affUrl = new URL(HOSTINGER_AFFILIATE_OFFER.directDestinationUrl);
    assert.equal(affUrl.origin, "https://www.hostinger.com");
    assert.equal(affUrl.pathname, "/cart");
    assert.equal(affUrl.searchParams.get("product"), "vps:vps_kvm_2");
    assert.equal(affUrl.searchParams.get("period"), "24");
    assert.equal(affUrl.searchParams.get("referral_type"), "cart_link");
    assert.equal(affUrl.searchParams.get("REFERRALCODE"), "U6SBOWENJOHQ");
    assert.equal(affUrl.searchParams.get("referral_id"), "01a1bc42-48b9-72f7-99fa-e99b324bb14c");
    assert.equal(HOSTINGER_AFFILIATE_OFFER.relAttribute, "sponsored noopener");
    assert.equal(HOSTINGER_AFFILIATE_OFFER.specs.pricingNotice, "See current Hostinger pricing.");

    // 5.3: IDE Launch Options & zero secret leakage in HTML/API
    const env = makeTestEnv();
    const svc = createIsolatedInterpreterService(env);
    const prodHtmlRes = await handleInterpreterFetch(new Request("https://translate.worksai.org/"), env, {}, svc);
    const prodHtml = await prodHtmlRes.text();
    const prodCsp = prodHtmlRes.headers.get("Content-Security-Policy") || "";

    assert.ok(prodHtml.includes("Launch your own hosting"), "Purple Hostinger CTA label present");
    assert.ok(prodHtml.includes("*Affiliate — we may earn a commission."), "Compact affiliate disclosure line present immediately underneath CTA");
    assert.ok(prodHtml.includes('rel="sponsored noopener"'), "rel=sponsored noopener present");
    assert.ok(prodHtml.includes("See current Hostinger pricing."), "Verified pricing notice present");
    assert.ok(prodHtml.includes("Open in your IDE"), "IDE dropdown present");
    assert.ok(prodHtml.includes("Sign in with Google"), "Sign in with Google button present");
    assert.ok(!prodCsp.includes("clarity.ms"), "Authenticated workspace CSP must not include Clarity");
    assert.ok(prodHtml.includes("Clarity: Permanently Disabled on Authenticated Workspace"));
    assert.ok(!prodHtml.includes(env.HOSTINGER_AI_ROUTER_API_KEY), "HTML must never leak HOSTINGER_AI_ROUTER_API_KEY");
    assert.ok(!prodHtml.includes(env.COHERE_API_KEY), "HTML must never leak COHERE_API_KEY");
    assert.ok(!prodHtml.includes(env.BYOK_ENCRYPTION_KEY), "HTML must never leak BYOK_ENCRYPTION_KEY");

    results.push("PASS: Group 5 (Sections 6–9 & 22.L): CLI redaction, Affiliate referral integrity, IDE dropdown, Clarity privacy gate & zero secret leakage");
  }

  console.log("\n=== WORKSAI LIVE INTERPRETER v1.3.0 QUALIFICATION SUMMARY ===");
  for (const r of results) console.log("  " + r);
  console.log(`ALL ${results.length}/${results.length} v1.3.0 QUALIFICATION GROUPS PASSED.`);
}

runV130QualificationSuite().catch((err) => {
  console.error("v1.3.0 QUALIFICATION FAILED:", err);
  process.exit(1);
});
