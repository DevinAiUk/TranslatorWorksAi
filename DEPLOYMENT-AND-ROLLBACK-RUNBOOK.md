# WorksAI Live Interpreter v1.3.1 — Deployment & Rollback Runbook

## 1. Canonical Targets & Runtime Module Map
- **Worker Name**: `worksai-live-interpreter`
- **Custom Domain**: `https://translate.worksai.org` (Demo: `https://translate.worksai.org/demo`, MCP: `https://translate.worksai.org/api/mcp`)
- **Cloudflare Account ID**: `dc1b1fad6c4ef1c4a6a4cff0c6a19f43`
- **Cloudflare Zone ID**: `ce9b21157b7b1c0d83eacd3180884f13` (`worksai.org`)
- **Wrangler Entry Point**: `worksai-live-interpreter-worker.mjs` (`compatibility_date = "2026-03-01"`, with canonical `src/interpreter-worker.mjs` alias)
- **Three Runtime ES Modules**:
  1. `worksai-live-interpreter-worker.mjs` (`src/interpreter-worker.mjs` alias) — Worker entry point, request dispatch, session JWTs, RS256 Google OIDC + server-issued one-time challenge nonces (`/api/auth/google/nonce`, `/api/auth/google`), consent receipts, live interpretation session lifecycle, and MCP dispatch.
  2. `src/interpreter-cohere-and-hostinger.mjs` — Hostinger AI Router (`https://router.hostinger.com/v1`) GPT & Gemini adapter, Cohere transcription & Command R7B processing, AES-256-GCM tenant BYOK encryption, atomic R2 conditional CAS quotas/leases, and Deep Chat v2.5.1 asset verification.
  3. `src/interpreter-ui-and-contracts.mjs` — Production (`/`) and public demo (`/demo`) HTML/CSS/JS renderer, `<deep-chat>` Web Component wiring, Hostinger gateway catalog, simplified affiliate disclosure, IDE launch dropdown, and Microsoft Clarity `/demo`-only privacy gate.
- **Pinned Deep Chat Asset**:
  - Local clean-checkout path: `assets/deepChat.bundle.js` (`386,971` bytes, `SHA-256: 6844eaf354e19d50dcdd8ee78968d6ae32ccd4b9f15a883902d60e93d69caf84`)
  - Cloudflare R2 object (`WORKSAI_DATA_LAKE` -> `worksai-datalake`): `static_assets/deepChat.bundle.v2.5.1.js`
  - Provisioning if missing in a new R2 bucket: `npx wrangler r2 object put worksai-datalake/static_assets/deepChat.bundle.v2.5.1.js --file assets/deepChat.bundle.js`

## 2. Clean-Checkout Verification & Wrangler Dry-Run
```bash
npm ci
npm run lint
npm run build
npm run secret-scan
npm run doctor
npm test
npx wrangler deploy --dry-run --outdir dist/wrangler-dry-run
```

## 3. Secure CLI Provider Setup & Google OAuth Origin Checklist
```bash
npm run doctor
# Provision secrets interactively without echoing to shell history:
npx wrangler secret put HOSTINGER_AI_ROUTER_API_KEY --name worksai-live-interpreter
npx wrangler secret put COHERE_API_KEY --name worksai-live-interpreter
npx wrangler secret put OPENAI_API_KEY --name worksai-live-interpreter
npx wrangler secret put GOOGLE_CLIENT_ID --name worksai-live-interpreter
```
- **Google OAuth `origin_mismatch` Fix**: In Google Cloud Console -> **APIs & Services -> Credentials** -> Web Client ID (`21902121526-0nf4rmkli2es0kd0ene5brjtlfl7rj34.apps.googleusercontent.com`), add `https://translate.worksai.org` (exact HTTPS origin, no trailing slash) under **Authorized JavaScript origins**, and add `bowenjdevon@gmail.com` under **OAuth consent screen -> Test users** if the consent screen is in Testing status.

## 4. Known-Good Rollback Procedure (Without Detaching translate.worksai.org)
1. **Immediate Version Rollback**:
   ```bash
   npx wrangler rollback --name worksai-live-interpreter --message "Revert to previous verified version"
   ```
2. **Zero-Inference Maintenance Worker Fallback** (keeps `translate.worksai.org` attached and returns `200` on `/health` and UI while returning `503 MAINTENANCE_ROLLBACK_ACTIVE` on all inference routes):
   ```bash
   npx wrangler deploy worksai-live-interpreter-maintenance-worker.mjs --name worksai-live-interpreter
   ```
