import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  validateCliArgsNoSecrets,
  inspectCredentialProvenance,
  redactSecretsInText,
  runDoctorReport
} from "../scripts/doctor.mjs";
import maintenanceWorker from "../worksai-live-interpreter-maintenance-worker.mjs";

const SYNTH_HSTGR = ["sk", "hstgr", "synthetic_fixture_0001"].join("-");
const SYNTH_PROJ = ["sk", "proj", "synthetic_fixture_0001"].join("-");

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

test("Zero-inference maintenance worker serves 200 on /health and 503 on inference routes", async () => {
  const hRes = await maintenanceWorker.fetch(new Request("https://translate.worksai.org/health"));
  assert.equal(hRes.status, 200);
  const hData = await hRes.json();
  assert.equal(hData.status, "maintenance_no_inference");

  const infRes = await maintenanceWorker.fetch(new Request("https://translate.worksai.org/api/chat/completions", { method: "POST" }));
  assert.equal(infRes.status, 503);
});

test("Release manifest, CHANGELOG.md, and security marketing draft match v1.3.1 specification", () => {
  const manifest = JSON.parse(fs.readFileSync("RELEASE-MANIFEST.json", "utf8"));
  assert.equal(manifest.version, "1.3.1");
  assert.equal(manifest.workerName, "worksai-live-interpreter");
  assert.equal(manifest.customDomain, "translate.worksai.org");
  assert.equal(manifest.googleOidc.configured, true);
  assert.equal(manifest.googleOidc.flow, "gis_oidc_id_token_post");
  assert.equal(manifest.googleOidc.redirectUriRequired, false);

  const changelog = fs.readFileSync("CHANGELOG.md", "utf8");
  assert.ok(changelog.includes("## [1.3.1]"));
  assert.ok(changelog.includes("*Affiliate — we may earn a commission."));

  const mkt = fs.readFileSync("docs/marketing/security-release-draft.md", "utf8");
  assert.ok(mkt.includes("AI conversations with clearer controls."));
});
