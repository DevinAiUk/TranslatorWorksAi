# WorksAI Live Interpreter v1.3.0 — Deployment & Rollback Runbook

## 1. Canonical Targets & Architecture
- **Worker Name**: `worksai-live-interpreter`
- **Custom Domain**: `https://translate.worksai.org` (Demo: `https://translate.worksai.org/demo`, MCP: `https://translate.worksai.org/api/mcp`)
- **Cloudflare Account ID**: `dc1b1fad6c4ef1c4a6a4cff0c6a19f43`
- **Cloudflare Zone ID**: `ce9b21157b7b1c0d83eacd3180884f13` (`worksai.org`)
- **R2 Bucket**: `WORKSAI_DATA_LAKE` -> `worksai-datalake` (`static_assets/deepChat.bundle.v2.5.1.js`)
- **Hostinger AI Router**: `https://router.hostinger.com/v1` (`HOSTINGER_AI_ROUTER_API_KEY`, `gpt-5-mini`, `gemini-3.5-flash-lite`)

## 2. Secure CLI Provider Setup
```bash
npm run doctor
# Provision secrets interactively without echoing to shell history:
npx wrangler secret put HOSTINGER_AI_ROUTER_API_KEY --name worksai-live-interpreter
npx wrangler secret put COHERE_API_KEY --name worksai-live-interpreter
npx wrangler secret put OPENAI_API_KEY --name worksai-live-interpreter
npx wrangler secret put GOOGLE_CLIENT_ID --name worksai-live-interpreter
```

## 3. Known-Good Rollback Procedure (Without Detaching translate.worksai.org)
1. **Immediate Version Rollback**:
   ```bash
   npx wrangler rollback --name worksai-live-interpreter --message "Revert to previous verified version"
   ```
2. **Zero-Inference Maintenance Worker Fallback** (keeps `translate.worksai.org` attached and returns `200` on `/health` and UI while returning `503 MAINTENANCE_MODE` on all inference routes):
   ```bash
   npx wrangler deploy worksai-live-interpreter-maintenance-worker.mjs --name worksai-live-interpreter
   ```
