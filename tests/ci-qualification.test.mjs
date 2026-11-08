import test from "node:test";
import assert from "node:assert/strict";
import {
  validateCliArgsNoSecrets,
  inspectCredentialProvenance,
  redactSecretsInText
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

  const rejectDirect = inspectCredentialProvenance("HOSTINGER_AI_ROUTER_API_KEY", SYNTH_PROJ);
  assert.equal(rejectDirect.valid, false);
  assert.equal(rejectDirect.reason, "EXPECTED_HOSTINGER_ISSUED_KEY");

  const migCheck = inspectCredentialProvenance("OPENAI_API_KEY", SYNTH_HSTGR);
  assert.equal(migCheck.valid, false);
  assert.equal(migCheck.reason, "MIGRATION_REQUIRED_TO_HOSTINGER_AI_ROUTER_API_KEY");
});

test("Zero-inference maintenance worker serves 200 on /health and 503 on inference routes", async () => {
  const hRes = await maintenanceWorker.fetch(new Request("https://translate.worksai.org/health"));
  assert.equal(hRes.status, 200);
  const hData = await hRes.json();
  assert.equal(hData.status, "maintenance_no_inference");

  const infRes = await maintenanceWorker.fetch(new Request("https://translate.worksai.org/api/chat/completions", { method: "POST" }));
  assert.equal(infRes.status, 503);
});

test("Live production translate.worksai.org v1.3.0 endpoints and contracts", async () => {
  const healthRes = await fetch("https://translate.worksai.org/health");
  assert.equal(healthRes.status, 200);
  const health = await healthRes.json();
  assert.equal(health.status, "healthy");
  assert.equal(health.version, "1.3.0");
  assert.equal(health.hostingerRouterBaseUrl, "https://router.hostinger.com/v1");

  const modelsRes = await fetch("https://translate.worksai.org/api/chat/models");
  assert.equal(modelsRes.status, 200);
  const models = await modelsRes.json();
  assert.equal(models.sharedCredentialReference, true);
  assert.equal(models.models["gpt-5-mini"].supportsAudioInput, false);
  assert.equal(models.models["gemini-3.5-flash-lite"].supportsAudioInput, true);

  const affRes = await fetch("https://translate.worksai.org/api/affiliate/hostinger");
  assert.equal(affRes.status, 200);
  const aff = await affRes.json();
  assert.ok(aff.directDestinationUrl.includes("REFERRALCODE=U6SBOWENJOHQ"));
  assert.equal(aff.relAttribute, "sponsored noopener");

  const clarityRes = await fetch("https://translate.worksai.org/api/clarity/config");
  assert.equal(clarityRes.status, 200);
  const clarity = await clarityRes.json();
  assert.equal(clarity.projectId, "zak4f5nfep");
  assert.equal(clarity.enabledOnAuthenticatedWorkspace, false);
});
