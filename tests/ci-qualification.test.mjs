import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  validateCliArgsNoSecrets,
  inspectCredentialProvenance,
  redactSecretsInText,
  runDoctorReport
} from "../scripts/doctor.mjs";
import {
  REQUIRED_RUNTIME_MODULES,
  EXPECTED_DEEP_CHAT_ASSET,
  runCleanBuild
} from "../scripts/build.mjs";
import maintenanceWorker from "../worksai-live-interpreter-maintenance-worker.mjs";
import workerDefault, {
  INTERPRETER_VERSION,
  HOSTINGER_AFFILIATE_OFFER,
  CLARITY_PRIVACY_CONTRACT,
  createIsolatedInterpreterService,
  handleInterpreterFetch,
  mintSignedSessionToken
} from "../worksai-live-interpreter-worker.mjs";
import srcWorkerDefault, {
  INTERPRETER_VERSION as SRC_INTERPRETER_VERSION,
  handleInterpreterFetch as srcHandleInterpreterFetch
} from "../src/interpreter-worker.mjs";

const SYNTH_HSTGR = ["sk", "hstgr", "synthetic_fixture_0001"].join("-");
const SYNTH_PROJ = ["sk", "proj", "synthetic_fixture_0001"].join("-");
const CONFIGURED_GOOGLE_CLIENT_ID = "21902121526-0nf4rmkli2es0kd0ene5brjtlflfl7rj34.apps.googleusercontent.com".replace("flfl", "fl");

class MockAtomicR2Bucket {
  constructor() { this.store = new Map(); }
  async get(key) {
    const e = this.store.get(key);
    if (!e) return null;
    const raw = e.value;
    return { etag: e.etag, body: raw, async text() { return raw; }, async json() { return JSON.parse(raw); } };
  }
  async put(key, val) {
    const s = typeof val === "string" ? val : JSON.stringify(val);
    this.store.set(key, { value: s, etag: `etag_${Date.now()}` });
  }
  async delete(key) { this.store.delete(key); }
}

test("Clean-checkout build gate: 3 runtime ES modules, relative imports, wrangler.toml entry point, Deep Chat v2.5.1 asset, and generated bundle", async () => {
  assert.equal(INTERPRETER_VERSION, "1.3.1");
  assert.equal(SRC_INTERPRETER_VERSION, "1.3.1");
  assert.equal(srcHandleInterpreterFetch, handleInterpreterFetch);
  assert.equal(srcWorkerDefault.fetch, workerDefault.fetch);

  const buildRes = await runCleanBuild();
  assert.equal(buildRes.ok, true);
  assert.equal(buildRes.entryPoint, "worksai-live-interpreter-worker.mjs");
  assert.equal(buildRes.srcAlias, "src/interpreter-worker.mjs");
  assert.equal(buildRes.deepChatAsset.bytes, EXPECTED_DEEP_CHAT_ASSET.bytes);
  assert.equal(buildRes.deepChatAsset.sha256, EXPECTED_DEEP_CHAT_ASSET.sha256);
  assert.ok(fs.existsSync(path.resolve(buildRes.generatedBundlePath)));
  assert.ok(buildRes.generatedBundleBytes > 200000);

  for (const modPath of REQUIRED_RUNTIME_MODULES) {
    assert.ok(fs.existsSync(path.resolve(modPath)), `Runtime module ${modPath} must exist in checkout`);
  }
});

test("CLI doctor rejects secrets passed in argv and redacts all key patterns", () => {
  const res = validateCliArgsNoSecrets([`--api-key=${SYNTH_HSTGR}`]);
  assert.equal(res.safe, false);
  assert.equal(res.errorCode, "CLI_ARGV_SECRET_FORBIDDEN");

  const redacted = redactSecretsInText(`Key: ${SYNTH_HSTGR} and ${SYNTH_PROJ}`);
  assert.ok(!redacted.includes("synthetic_fixture_0001"));
  assert.ok(redacted.includes("[REDACTED_HOSTINGER_ROUTER_KEY]"));
});

test("CLI credential provenance distinguishes Hostinger sk-hstgr- from direct OpenAI keys", () => {
  const hCheck = inspectCredentialProvenance("HOSTINGER_AI_ROUTER_API_KEY", SYNTH_HSTGR);
  assert.equal(hCheck.valid, true);
  assert.equal(hCheck.baseURL, "https://router.hostinger.com/v1");
  assert.equal(hCheck.gptModel, "gpt-5-mini");
  assert.equal(hCheck.geminiModel, "gemini-3.5-flash-lite");

  const rejectDirect = inspectCredentialProvenance("HOSTINGER_AI_ROUTER_API_KEY", SYNTH_PROJ);
  assert.equal(rejectDirect.valid, false);
  assert.equal(rejectDirect.reason, "EXPECTED_HOSTINGER_ISSUED_KEY");

  const migCheck = inspectCredentialProvenance("OPENAI_API_KEY", SYNTH_HSTGR);
  assert.equal(migCheck.valid, false);
  assert.equal(migCheck.reason, "MIGRATION_REQUIRED_TO_HOSTINGER_AI_ROUTER_API_KEY");

  const byokSameAsJwt = inspectCredentialProvenance(
    "BYOK_ENCRYPTION_KEY",
    "same_secret_value_32_characters_long_01",
    { JWT_SECRET: "same_secret_value_32_characters_long_01" }
  );
  assert.equal(byokSameAsJwt.valid, false);
  assert.equal(byokSameAsJwt.reason, "MUST_DIFFER_FROM_JWT_SECRET");
});

test("Doctor report detects controlled migration and outputs GIS OIDC setup guidance without echoing secrets", () => {
  const rep = runDoctorReport(
    { OPENAI_API_KEY: SYNTH_HSTGR },
    ["--worker=worksai-live-interpreter", "--env=production"]
  );
  assert.equal(rep.ok, true);
  assert.equal(rep.exitCode, 0);
  assert.ok(rep.migrationNotice.includes("CONTROLLED MIGRATION AVAILABLE"));
  assert.ok(rep.output.includes("https://translate.worksai.org"));
  assert.ok(!rep.output.includes("synthetic_fixture_0001"));
});

test("Google OIDC RS256 cryptographic signature, HS256 rejection, server-issued one-time challenge nonce, invite gate, anti-auto-merge, logout revocation, and bootstrap lock", async () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pubJwk = { ...publicKey.export({ format: "jwk" }), kid: "google-test-kid-v131", alg: "RS256", use: "sig" };

  function signRs256GoogleIdToken(claims, privKey = privateKey, kid = "google-test-kid-v131") {
    const h = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT", kid })).toString("base64url");
    const p = Buffer.from(JSON.stringify(claims)).toString("base64url");
    const sig = crypto.sign("RSA-SHA256", Buffer.from(`${h}.${p}`), privKey).toString("base64url");
    return `${h}.${p}.${sig}`;
  }

  function signHs256FakeGoogleToken(claims, secret = "fake_hs256_secret") {
    const h = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT", kid: "google-test-kid-v131" })).toString("base64url");
    const p = Buffer.from(JSON.stringify(claims)).toString("base64url");
    const sig = crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");
    return `${h}.${p}.${sig}`;
  }

  const r2 = new MockAtomicR2Bucket();
  const env = {
    WORKSAI_ENV: "production",
    WORKSAI_DATA_LAKE: r2,
    JWT_SECRET: "jwt_signing_secret_32_bytes_minimum_length_v131",
    BYOK_ENCRYPTION_KEY: "byok_separate_encryption_secret_32_bytes_v131",
    WORKSAI_BOOTSTRAP_SECRET: "bootstrap_secret_32_bytes_minimum_v131",
    GOOGLE_CLIENT_ID: CONFIGURED_GOOGLE_CLIENT_ID,
    GOOGLE_TEST_JWKS: { keys: [pubJwk] },
    HOSTINGER_AI_ROUTER_API_KEY: SYNTH_HSTGR
  };
  const svc = createIsolatedInterpreterService(env);

  // 1. Verify /api/auth/google/config reports configured=true, gis_oidc_id_token_post, redirectUriRequired=false, and /api/auth/google/callback is 404
  const cfgRes = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/auth/google/config"), env, {}, svc);
  assert.equal(cfgRes.status, 200);
  const cfg = await cfgRes.json();
  assert.equal(cfg.configured, true);
  assert.equal(cfg.clientId, CONFIGURED_GOOGLE_CLIENT_ID);
  assert.equal(cfg.flow, "gis_oidc_id_token_post");
  assert.equal(cfg.redirectUriRequired, false);

  const cbRes = await handleInterpreterFetch(new Request("https://translate.worksai.org/api/auth/google/callback"), env, {}, svc);
  assert.equal(cbRes.status, 404, "Unused callback URI must not be exposed when using GIS credential-token POST flow");

  const nowSec = Math.floor(Date.now() / 1000);

  // 1b. Verify locally HS256-signed token is unconditionally rejected (401 UNSUPPORTED_GOOGLE_TOKEN_ALG) even if WORKSAI_ENV="test"
  const hs256Token = signHs256FakeGoogleToken({
    iss: "https://accounts.google.com",
    aud: CONFIGURED_GOOGLE_CLIENT_ID,
    sub: "google_sub_hs256_attempt",
    email: "invited.member@worksai.org",
    email_verified: true,
    nonce: "nonce_hs256",
    exp: nowSec + 3600
  });
  const hs256Res = await handleInterpreterFetch(
    new Request("https://translate.worksai.org/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: hs256Token, expectedNonce: "nonce_hs256" })
    }),
    { ...env, WORKSAI_ENV: "test", GOOGLE_OIDC_TEST_SIGNING_SECRET: "fake_hs256_secret" },
    {},
    svc
  );
  assert.equal(hs256Res.status, 401);
  assert.equal((await hs256Res.json()).error, "UNSUPPORTED_GOOGLE_TOKEN_ALG");

  // 1c. Issue server-side OIDC challenge nonce via POST /api/auth/google/nonce
  const nonceRes = await handleInterpreterFetch(
    new Request("https://translate.worksai.org/api/auth/google/nonce", { method: "POST" }),
    env,
    {},
    svc
  );
  assert.equal(nonceRes.status, 200);
  const nonceData = await nonceRes.json();
  assert.ok(nonceData.nonce && nonceData.nonce.length === 32);
  const nonceCookie = (nonceRes.headers.get("Set-Cookie") || "").split(";")[0];
  assert.ok(nonceCookie.startsWith("wai_oidc_nonce="));

  const validToken = signRs256GoogleIdToken({
    iss: "https://accounts.google.com",
    aud: CONFIGURED_GOOGLE_CLIENT_ID,
    sub: "google_sub_rs256_user_101",
    email: "invited.member@worksai.org",
    email_verified: true,
    nonce: "nonce_rs256_abc",
    exp: nowSec + 3600
  });

  // 2. Uninvited Google user is rejected with 403 INVITE_REQUIRED_FOR_GOOGLE_SIGNIN
  const uninvitedRes = await handleInterpreterFetch(
    new Request("https://translate.worksai.org/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: validToken, expectedNonce: "nonce_rs256_abc" })
    }),
    env,
    {},
    svc
  );
  assert.equal(uninvitedRes.status, 403);
  assert.equal((await uninvitedRes.json()).error, "INVITE_REQUIRED_FOR_GOOGLE_SIGNIN");

  // 3. Anti-auto-merge: pre-existing local email account cannot auto-merge with Google login without explicit invite
  await svc.registerLocalEmailIdentity("existing.local@worksai.org", "usr_local_99", "tenant_worksai_alpha");
  const conflictToken = signRs256GoogleIdToken({
    iss: "https://accounts.google.com",
    aud: CONFIGURED_GOOGLE_CLIENT_ID,
    sub: "google_sub_rs256_conflict",
    email: "existing.local@worksai.org",
    email_verified: true,
    nonce: "nonce_conflict",
    exp: nowSec + 3600
  });
  const mergeRes = await handleInterpreterFetch(
    new Request("https://translate.worksai.org/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: conflictToken, expectedNonce: "nonce_conflict" })
    }),
    env,
    {},
    svc
  );
  assert.equal(mergeRes.status, 403);
  assert.equal((await mergeRes.json()).error, "ACCOUNT_AUTO_MERGE_FORBIDDEN");

  // 4. Invited Google user links account via RS256 OIDC token + server-issued nonce + operator invite code, then verifies nonce one-time use
  const bootRes1 = await handleInterpreterFetch(
    new Request("https://translate.worksai.org/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-WorksAI-Bootstrap-Secret": env.WORKSAI_BOOTSTRAP_SECRET },
      body: JSON.stringify({ tenantId: "tenant_worksai_alpha", userId: "usr_op_1" })
    }),
    env,
    {},
    svc
  );
  assert.equal(bootRes1.status, 200);
  const bootRes2 = await handleInterpreterFetch(
    new Request("https://translate.worksai.org/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-WorksAI-Bootstrap-Secret": env.WORKSAI_BOOTSTRAP_SECRET },
      body: JSON.stringify({ tenantId: "tenant_worksai_alpha", userId: "usr_op_2" })
    }),
    env,
    {},
    svc
  );
  assert.equal(bootRes2.status, 403);
  assert.equal((await bootRes2.json()).error, "BOOTSTRAP_LOCKED");

  const opAuth = await mintSignedSessionToken({ tenantId: "tenant_worksai_alpha", workspaceId: "ws_prod", userId: "usr_op_1", role: "operator" }, env.JWT_SECRET);
  const inv = await svc.createUserInvite({ authenticated: true, ...opAuth.claims }, { invitedUserId: "usr_google_101", invitedRole: "member", maxUses: 1 });

  const serverNonceToken = signRs256GoogleIdToken({
    iss: "https://accounts.google.com",
    aud: CONFIGURED_GOOGLE_CLIENT_ID,
    sub: "google_sub_rs256_user_101",
    email: "invited.member@worksai.org",
    email_verified: true,
    nonce: nonceData.nonce,
    exp: nowSec + 3600
  });

  const linkRes = await handleInterpreterFetch(
    new Request("https://translate.worksai.org/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: nonceCookie },
      body: JSON.stringify({ idToken: serverNonceToken, expectedNonce: nonceData.nonce, inviteCode: inv.inviteCode })
    }),
    env,
    {},
    svc
  );
  assert.equal(linkRes.status, 200);
  const linkBody = await linkRes.json();
  assert.equal(linkBody.authenticated, true);
  assert.equal(linkBody.firstTimeLinked, true);
  const setCookie = linkRes.headers.get("Set-Cookie") || "";
  const sessionJwt = decodeURIComponent(setCookie.split("wai_interp_session=")[1].split(";")[0]);

  // 4b. Replaying the same server-issued nonce is rejected (401 GOOGLE_NONCE_ALREADY_USED)
  const replayNonceRes = await handleInterpreterFetch(
    new Request("https://translate.worksai.org/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: nonceCookie },
      body: JSON.stringify({ idToken: serverNonceToken, expectedNonce: nonceData.nonce })
    }),
    env,
    {},
    svc
  );
  assert.equal(replayNonceRes.status, 401);
  assert.equal((await replayNonceRes.json()).error, "GOOGLE_NONCE_ALREADY_USED");

  // Logout revokes token
  const logoutRes = await handleInterpreterFetch(
    new Request("https://translate.worksai.org/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${sessionJwt}` }
    }),
    env,
    {},
    svc
  );
  assert.equal(logoutRes.status, 200);
  assert.equal((await logoutRes.json()).revoked, true);
});

test("Simplified affiliate disclosure, Clarity workspace exclusion, and zero-inference maintenance worker", async () => {
  assert.equal(INTERPRETER_VERSION, "1.3.1");
  assert.equal(HOSTINGER_AFFILIATE_OFFER.ctaLabel, "Launch your own hosting");
  assert.equal(HOSTINGER_AFFILIATE_OFFER.disclosure, "*Affiliate — we may earn a commission.");
  assert.equal(HOSTINGER_AFFILIATE_OFFER.relAttribute, "sponsored noopener");
  assert.ok(HOSTINGER_AFFILIATE_OFFER.directDestinationUrl.includes("REFERRALCODE=U6SBOWENJOHQ"));
  assert.equal(CLARITY_PRIVACY_CONTRACT.enabledOnAuthenticatedWorkspace, false);

  const hRes = await maintenanceWorker.fetch(new Request("https://translate.worksai.org/health"));
  assert.equal(hRes.status, 200);
  assert.equal((await hRes.json()).status, "maintenance_no_inference");

  const infRes = await maintenanceWorker.fetch(new Request("https://translate.worksai.org/api/chat/completions", { method: "POST" }));
  assert.equal(infRes.status, 503);

  const manifest = JSON.parse(fs.readFileSync("RELEASE-MANIFEST.json", "utf8"));
  assert.equal(manifest.version, "1.3.1");
  assert.equal(manifest.workerName, "worksai-live-interpreter");
  assert.equal(manifest.customDomain, "translate.worksai.org");
  assert.equal(manifest.googleOidc.configured, true);
  assert.equal(manifest.googleOidc.flow, "gis_oidc_id_token_post");
  assert.equal(manifest.googleOidc.redirectUriRequired, false);

  const changelog = fs.readFileSync("CHANGELOG.md", "utf8");
  assert.ok(changelog.includes("## [1.3.1]"));
  assert.ok(changelog.includes("Modularized runtime source and made clean-checkout builds reproducible"));
  assert.ok(changelog.includes("*Affiliate — we may earn a commission."));

  const mkt = fs.readFileSync("docs/marketing/security-release-draft.md", "utf8");
  assert.ok(mkt.includes("DRAFT ONLY"));
  assert.ok(mkt.includes("AI conversations with clearer controls."));
});
