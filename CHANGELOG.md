# Changelog — WorksAI Live Interpreter (`translate.worksai.org`)

All notable verified changes to **WorksAI Live Interpreter** (`worksai-live-interpreter`) are documented in this file.
Each entry distinguishes verification state using **[Implemented]**, **[Configured]**, **[Deployed]**, and **[Live-provider verified]**.

## [1.3.1] — 2026-11-08

### Added
- **[Deployed]** Google Identity Services (`https://accounts.google.com/gsi/client`) browser credential-token integration in the Sign-In drawer (`#btn-google-signin`), posting signed OIDC `credential` JWTs and cryptographic nonces to `POST /api/auth/google`.
- **[Configured / Deployed]** Provisioned `CLOUDFLARE_ACCOUNT_ID` and least-privilege `CLOUDFLARE_API_TOKEN` (`worksai-live-interpreter-github-ci`, scoped to `Workers Scripts Write`, `Account Settings Read`, and `worksai.org` `Workers Routes Write`) in GitHub repository secrets on `DevinAiUk/gpt-realtime-translate-live-event-interpreter`.
- **[Implemented]** Added `docs/marketing/security-release-draft.md` (with claim-by-claim internal evidence matrix) and `CHANGELOG.md`.

### Changed
- **[Deployed]** Simplified the Hostinger VPS affiliate presentation (`GET /api/affiliate/hostinger` and footer promo bar): retained the purple **Launch your own hosting** button (`rel="sponsored noopener"`, approved Hostinger KVM 2 cart referral link, and `"See current Hostinger pricing."`) and replaced the multi-sentence disclosure with one compact, high-contrast line immediately underneath: `"*Affiliate — we may earn a commission."`
- **[Deployed]** Updated `getGoogleOAuthConfigStatus()` (`GET /api/auth/google/config`) and `scripts/doctor.mjs` to document the implemented `gis_oidc_id_token_post` flow (`redirectUriRequired: false`) and removed the unused `GET /api/auth/google/callback` stub endpoint.

### Fixed
- **[Configured / Deployed]** Migrated the Google OAuth Web Client ID (`21902121526-0nf4rmkli2es0kd0ene5brjtlfl7rj34.apps.googleusercontent.com`) from a misnamed Cloudflare secret binding name to the canonical `GOOGLE_CLIENT_ID` binding on `worksai-live-interpreter`, activating `googleOAuthConfigured: true` on `https://translate.worksai.org/health`.
- **[Deployed]** Added job-level `concurrency` serialization (`cancel-in-progress: false`) to the `deploy-production` job in `.github/workflows/ci-cd.yml`.

### Security
- **[Implemented / Deployed]** Completed secret-metadata incident audit across Cloudflare Worker version history, local workspace files, release archives, Git commits, and NotebookLM records. Scrubbed a historical key prefix from local test fixtures (`worksai-live-interpreter-v1.3.0.test.mjs`) and documented prudent provider key rotation (`HOSTINGER_AI_ROUTER_API_KEY` and `COHERE_API_KEY`) because Cloudflare Worker Versions 4 (`6f4c0828-1a1d-426f-b535-98450afb2955`) and 5 (`0117f5c2-a324-4287-81b0-b51c185998c0`) retain historical binding names in immutable Cloudflare version metadata.

### Known Limitations
- **Direct OpenAI key required for live speech-to-speech**: `gpt-realtime-translate` WebRTC interpretation requires a direct OpenAI API key (`OPENAI_API_KEY`, currently unconfigured in production: `liveProviderKeyConfigured: false`). Hostinger AI Router keys (`sk-hstgr-...`) are not interchangeable with direct OpenAI keys and are rejected on `/api/sessions/:id/ephemeral-secret` (`503 DIRECT_OPENAI_KEY_REQUIRED_GATEWAY_KEY_REJECTED`).
- **Provider access and cost controls**: Live Hostinger AI Router (`gpt-5-mini`, `gemini-3.5-flash-lite`) model catalog discovery (`GET https://router.hostinger.com/v1/models`, 163 models) is verified, while live paid chat/audio completions remain gated behind explicit per-test cost approval. Cohere `cohere-transcribe-03-2026` and `command-r7b-12-2024` are live-provider verified under strict trial/release-gate quotas.
- **Browser test scope**: Automated Headless Chromium E2E tests and cryptographic RS256/HS256 OIDC unit tests verify `POST /api/auth/google`, invite gating, anti-auto-merge, and DOM layout; full interactive Google sign-in requires a human browser session authenticated with an invited Google account.
- **Link shortener availability**: `https://linkengine.worksai.org/api/mcp` (`linkengine.create_shortlink`) is a Category D WordPress/PHP sandbox whose `/s/wai-q4` route returns `HTTP 404`; the application uses the approved direct Hostinger referral URL until a verified shortlink redirect is deployed.
- **Event broadcast disabled without Durable Object coordinator**: Multi-attendee `ws_event_broadcast` mode returns `501 BROADCAST_COORDINATOR_NOT_CONFIGURED` until `INTERPRETER_BROADCAST_DO` is bound (`broadcastCoordinatorBound: false`).
- **Cooperative WebRTC termination**: Ending a 1:1 WebRTC session revokes server session state in R2 and signals `shouldStopBrowserMedia: true` on heartbeat, but relies on the browser client to close its peer connection and media tracks once an ephemeral WebRTC session is active.
- **Unverified regional residency from model suffixes**: Selecting `-us` or `-eu` model aliases (`gpt-5-mini-us`, `gpt-5-mini-eu`, `gemini-3.5-flash-lite-us`, `gemini-3.5-flash-lite-eu`) routes through global ingress `https://router.hostinger.com/v1` and does not guarantee end-to-end regional data residency.

## [1.3.0] — 2026-11-08

### Added
- **[Deployed]** Unified Hostinger AI Router (`https://router.hostinger.com/v1`) adapter supporting **GPT** (`gpt-5-mini`, `gpt-5-mini-us`, `gpt-5-mini-eu`, `gpt-4.1-mini`) and **Gemini** (`gemini-3.5-flash-lite`, `gemini-3.5-flash-lite-us`, `gemini-3.5-flash-lite-eu`) via one shared server-side credential reference (`HOSTINGER_AI_ROUTER_API_KEY` or tenant **Hostinger AI Router** BYOK).
- **[Implemented / Deployed]** Bounded Gemini audio-input support (`input_audio` for `WAV`, `MP3`, `OGG`, `WEBM`, `FLAC` `<= 60s` and `<= 5 MiB`), distinguishing **Transcribe audio** vs **Answer about audio** (`POST /api/chat/completions`, `POST /api/demo/chat`).
- **[Implemented / Deployed]** Server-side Google OIDC ID token verification (`POST /api/auth/google`, `GET /api/auth/google/config`) keyed by stable Google `sub` with operator invite release-gate enforcement (`403 INVITE_REQUIRED_FOR_GOOGLE_SIGNIN`) and anti-auto-merge protection (`403 ACCOUNT_AUTO_MERGE_FORBIDDEN`).
- **[Implemented / Deployed]** Non-echoing CLI setup & doctor script (`scripts/doctor.mjs`, `npm run doctor`, `npm run setup:keys`), **Open in your IDE** dropdown (`GET /api/ide/options`, `.devcontainer/devcontainer.json`), purple Hostinger affiliate button (`GET /api/affiliate/hostinger`), and GitHub Actions CI/CD workflow (`.github/workflows/ci-cd.yml`).
- **[Implemented / Deployed]** Opt-in, `/demo`-only Microsoft Clarity integration (`projectId: "zak4f5nfep"`, `GET /api/clarity/config`) with mandatory `verifyExclusions()` DOM masking checks (`data-clarity-mask="true"`).

### Changed
- **[Deployed]** Simplified the `<deep-chat>` (`v2.5.1`) interface to a single conversation view, single composer, one attachment button (`📎 Attach`), one microphone button (`🎤 Mic`), one `Send`/`Stop` action, and one compact mode/model bar, moving provider routing, BYOK, regional settings, retention, and quotas into `Settings ⚙`.

### Fixed
- **[Configured / Deployed]** Migrated misnamed CLI secret bindings for Hostinger AI Router and Cohere on `worksai-live-interpreter` to canonical `HOSTINGER_AI_ROUTER_API_KEY` and `COHERE_API_KEY` bindings and deleted the misnamed secret entries.

## [1.2.1] — 2026-11-08

### Added
- **[Deployed / Live-provider verified]** Controlled production launch on `https://translate.worksai.org` (`worksai-live-interpreter`), executing bounded live qualification against `https://api.cohere.com/v2/audio/transcriptions` (`cohere-transcribe-03-2026`, `HTTP 200`, `1,060 ms`) and `https://api.cohere.com/v2/chat` (`command-r7b-12-2024`, `HTTP 200`, `598 ms`).
- **[Deployed]** One-time owner bootstrap lock (`auth/bootstrap_state.json` in R2) and operator-issued invite code workflow (`POST /api/auth/invites`, `POST /api/auth/login`).
- **[Deployed]** Separate `BYOK_ENCRYPTION_KEY` enforcement (AES-256-GCM with tenant/provider/tier AAD and audit logging in R2).

### Changed
- **[Deployed]** Extracted the `386,971`-byte `deep-chat@2.5.1` bundle (`SHA-256: 6844eaf354e19d50dcdd8ee78968d6ae32ccd4b9f15a883902d60e93d69caf84`) from inline base64 into Cloudflare R2 (`WORKSAI_DATA_LAKE` -> `static_assets/deepChat.bundle.v2.5.1.js`), reducing the Worker script size from `699,385` B to `137,370` B.
- **[Deployed]** Hardened shared platform budget accounting (`combinedPlatformBudgetId: "plat_cohere_shared_budget"`) and disabled automatic key rotation on quota exhaustion or `429` cooldown (`ENABLE_COHERE_KEY_FAILOVER = "false"`).

## [1.2.0] — 2026-11-08 (Reconstructed from Release Artifacts)

### Added
- **[Implemented / Deployed]** Cohere recording transcription (`cohere-transcribe-03-2026`) and optional instruction-following / transcript processing (`command-r7b-12-2024`) with two-stage pipeline support (`POST /api/cohere/transcribe`, `/api/cohere/process`, `/api/cohere/pipeline`, and MCP tools `interpreter.transcribe_audio`, `interpreter.process_transcript`).
- **[Implemented / Deployed]** Conditional R2 compare-and-swap (`onlyIf: { etagMatches }`) quota admission ledger (`quota_ledger/cohere_global_state_v1.json`) and binary audio header/duration validation (`WAV`, `MP3`, `OGG`, `WEBM`, `FLAC` `<= 60s`, `<= 5 MiB`).

## [1.1.0] — 2026-11-08 (Reconstructed from Release Artifacts)

### Added
- **[Implemented / Deployed]** Genuine compiled `deep-chat@2.5.1` Web Component asset (`GET /assets/deep-chat.js`) and MIT license notice (`GET /assets/deep-chat.LICENSE.txt`).
- **[Implemented / Deployed]** HMAC-SHA256 signed session JWT authentication (`mintSignedSessionToken`, `verifySignedSessionToken`), CSRF token verification (`X-WorksAI-CSRF`), R2 token revocation (`revoked_tokens/<jti>.json`), and cryptographic consent receipts (`wai_consent_v1`) for microphone capture, provider transmission, and transcript export.
- **[Implemented / Deployed]** Prebuilt zero-inference maintenance rollback Worker (`worksai-live-interpreter-maintenance-worker.mjs`).
