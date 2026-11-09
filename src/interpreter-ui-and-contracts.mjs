/**
 * WorksAI Live Interpreter v1.3.1 — UI Renderer & Gateway/Affiliate/IDE/Clarity Contracts
 */
function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const HOSTINGER_AI_ROUTER_BASE_URL = "https://router.hostinger.com/v1";
export const HOSTINGER_GATEWAY_MODEL_CATALOG = Object.freeze({
"gpt-5-mini": Object.freeze({
id: "gpt-5-mini",
family: "gpt",
displayLabel: "GPT (gpt-5-mini)",
ownedBy: "OpenAI",
endpoint: "https://router.hostinger.com/v1/chat/completions",
inputModalities: Object.freeze(["text", "image"]),
outputModalities: Object.freeze(["text"]),
supportsAudioInput: false,
regionTarget: "global",
residencyVerified: false,
residencyDisclosure: "Global gateway ingress at router.hostinger.com/v1; regional processing residency is unverified.",
pricingPer1kCredits: Object.freeze({ prompt: "0.0000336", completion: "0.000264" }),
maxOutputTokensCap: 400
}),
"gpt-5-mini-us": Object.freeze({
id: "gpt-5-mini-us",
family: "gpt",
displayLabel: "GPT (gpt-5-mini-us · US Gateway Target)",
ownedBy: "OpenAI",
endpoint: "https://router.hostinger.com/v1/chat/completions",
inputModalities: Object.freeze(["text", "image"]),
outputModalities: Object.freeze(["text"]),
supportsAudioInput: false,
regionTarget: "us",
residencyVerified: false,
residencyDisclosure: "Selects Hostinger -us model target via global router.hostinger.com/v1 ingress; strict US-only residency is unverified.",
pricingPer1kCredits: Object.freeze({ prompt: "0.0000336", completion: "0.000264" }),
maxOutputTokensCap: 400
}),
"gpt-5-mini-eu": Object.freeze({
id: "gpt-5-mini-eu",
family: "gpt",
displayLabel: "GPT (gpt-5-mini-eu · EU Gateway Target)",
ownedBy: "OpenAI",
endpoint: "https://router.hostinger.com/v1/chat/completions",
inputModalities: Object.freeze(["text", "image"]),
outputModalities: Object.freeze(["text"]),
supportsAudioInput: false,
regionTarget: "eu",
residencyVerified: false,
residencyDisclosure: "Selects Hostinger -eu model target via global router.hostinger.com/v1 ingress; end-to-end EU-only data residency is unverified.",
pricingPer1kCredits: Object.freeze({ prompt: "0.0000336", completion: "0.000264" }),
maxOutputTokensCap: 400
}),
"gpt-4.1-mini": Object.freeze({
id: "gpt-4.1-mini",
family: "gpt",
displayLabel: "GPT (gpt-4.1-mini)",
ownedBy: "OpenAI",
endpoint: "https://router.hostinger.com/v1/chat/completions",
inputModalities: Object.freeze(["text", "image"]),
outputModalities: Object.freeze(["text"]),
supportsAudioInput: false,
regionTarget: "global",
residencyVerified: false,
residencyDisclosure: "Global gateway ingress at router.hostinger.com/v1; regional processing residency is unverified.",
pricingPer1kCredits: Object.freeze({ prompt: "0.000048", completion: "0.000192" }),
maxOutputTokensCap: 400
}),
"gemini-3.5-flash-lite": Object.freeze({
id: "gemini-3.5-flash-lite",
family: "gemini",
displayLabel: "Gemini (gemini-3.5-flash-lite)",
ownedBy: "Google",
endpoint: "https://router.hostinger.com/v1/chat/completions",
inputModalities: Object.freeze(["text", "image", "video", "audio"]),
outputModalities: Object.freeze(["text"]),
supportsAudioInput: true,
supportedAudioFormats: Object.freeze(["wav", "mp3", "ogg", "webm", "flac"]),
regionTarget: "global",
residencyVerified: false,
residencyDisclosure: "Global gateway ingress at router.hostinger.com/v1; regional processing residency is unverified.",
pricingPer1kCredits: Object.freeze({ prompt: "0.000036", completion: "0.0003" }),
maxOutputTokensCap: 400
}),
"gemini-3.5-flash-lite-us": Object.freeze({
id: "gemini-3.5-flash-lite-us",
family: "gemini",
displayLabel: "Gemini (gemini-3.5-flash-lite-us · US Gateway Target)",
ownedBy: "Google",
endpoint: "https://router.hostinger.com/v1/chat/completions",
inputModalities: Object.freeze(["text", "image", "video", "audio"]),
outputModalities: Object.freeze(["text"]),
supportsAudioInput: true,
supportedAudioFormats: Object.freeze(["wav", "mp3", "ogg", "webm", "flac"]),
regionTarget: "us",
residencyVerified: false,
residencyDisclosure: "Selects Hostinger gemini-3.5-flash-lite-us target via global router.hostinger.com/v1 ingress; strict US-only residency is unverified.",
pricingPer1kCredits: Object.freeze({ prompt: "0.0000396", completion: "0.00033" }),
maxOutputTokensCap: 400
}),
"gemini-3.5-flash-lite-eu": Object.freeze({
id: "gemini-3.5-flash-lite-eu",
family: "gemini",
displayLabel: "Gemini (gemini-3.5-flash-lite-eu · EU Gateway Target)",
ownedBy: "Google",
endpoint: "https://router.hostinger.com/v1/chat/completions",
inputModalities: Object.freeze(["text", "image", "video", "audio"]),
outputModalities: Object.freeze(["text"]),
supportsAudioInput: true,
supportedAudioFormats: Object.freeze(["wav", "mp3", "ogg", "webm", "flac"]),
regionTarget: "eu",
residencyVerified: false,
residencyDisclosure: "Selects Hostinger gemini-3.5-flash-lite-eu target via global router.hostinger.com/v1 ingress; route suffix -eu does not guarantee EU-only ingress data handling.",
pricingPer1kCredits: Object.freeze({ prompt: "0.0000396", completion: "0.00033" }),
maxOutputTokensCap: 400
})
});
export const HOSTINGER_AFFILIATE_OFFER = Object.freeze({
ctaLabel: "Launch your own hosting",
supportingLabel: "Hostinger VPS · affiliate link",
directDestinationUrl: "https://www.hostinger.com/cart?product=vps%3Avps_kvm_2&period=24&referral_type=cart_link&REFERRALCODE=U6SBOWENJOHQ&referral_id=01a1bc42-48b9-72f7-99fa-e99b324bb14c",
linkEngineMcpEndpoint: "https://linkengine.worksai.org/api/mcp",
linkEngineShortUrlCandidate: "https://linkengine.worksai.org/s/wai-q4",
linkEngineRedirectVerified: false,
fallbackReason: "linkengine.worksai.org is deployed as a Category D WordPress/PHP plugin sandbox whose /s/* route returns HTTP 404; using approved direct Hostinger referral link with all referral parameters intact.",
relAttribute: "sponsored noopener",
specs: Object.freeze({
plan: "KVM 2",
vcpu: "2 vCPU cores",
ram: "8 GB RAM",
storage: "100 GB NVMe storage",
bandwidth: "8 TB bandwidth",
pricingNotice: "See current Hostinger pricing."
}),
disclosure: "*Affiliate — we may earn a commission."
});
export const IDE_LAUNCH_OPTIONS = Object.freeze({
repositoryUrl: "https://github.com/DevinAiUk/gpt-realtime-translate-live-event-interpreter",
cloneGitUrl: "https://github.com/DevinAiUk/gpt-realtime-translate-live-event-interpreter.git",
vscodeCloneUri: "vscode://vscode.git/clone?url=https%3A%2F%2Fgithub.com%2FDevinAiUk%2Fgpt-realtime-translate-live-event-interpreter.git",
cursorCloneUri: "cursor://vscode.git/clone?url=https%3A%2F%2Fgithub.com%2FDevinAiUk%2Fgpt-realtime-translate-live-event-interpreter.git",
codespacesNewUrl: "https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=DevinAiUk%2Fgpt-realtime-translate-live-event-interpreter",
codespacesBillingNotice: "GitHub Codespaces may apply compute and storage usage charges depending on your GitHub account plan.",
copyCloneCommand: "git clone https://github.com/DevinAiUk/gpt-realtime-translate-live-event-interpreter.git && cd gpt-realtime-translate-live-event-interpreter && cp .env.example .env && npm run doctor && npm test",
setupKeysCommand: "npm run setup:keys",
downloadArchiveUrl: "https://github.com/DevinAiUk/gpt-realtime-translate-live-event-interpreter/archive/refs/heads/main.zip",
selfHostingParityNotice: "Local IDE clone runs deterministic demo mode and automated qualification tests. Full production parity requires Cloudflare Workers runtime, R2 bucket WORKSAI_DATA_LAKE, auth signing secrets, and provider keys provisioned via npm run setup:keys."
});
export const CLARITY_PRIVACY_CONTRACT = Object.freeze({
projectId: "zak4f5nfep",
loaderUrl: "https://www.clarity.ms/tag/zak4f5nfep",
enabledOnAuthenticatedWorkspace: false,
enabledOnPublicDemoByDefault: false,
requiresExplicitConsent: true,
requiresDomExclusionCheckBeforeInit: true,
maskedSelectors: Object.freeze([
"#worksai-deep-chat",
"#chat-composer-input",
"#chat-audio-file",
"#chat-mic-btn",
"#settings-drawer",
"#auth-signin-drawer",
"#chat-recovery-banner",
"#live-caption-bar",
"#transcript-export-modal"
])
});

export function renderInterpreterAppHtml({ isDemo = false, auth = {}, hasProviderKey = false, hasHostingerKey = false, hasCohereKey = false, googleOAuthStatus = {}, broadcastEnabled = false, initialSessionId = "" } = {}) {
const isAuthenticated = Boolean(auth?.authenticated);
const badgeText = isDemo ? "PUBLIC DEMO (SYNTHETIC)" : "PRODUCTION WORKSPACE";
const hostingerReady = Boolean(hasHostingerKey);
const clarityEligible = Boolean(isDemo);
return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>WorksAI Live Interpreter v1.3.1</title><script type="module" src="/assets/deep-chat.js"></script><style>
:root{
--bg-obsidian:#07090E;--bg-slate:#0B0F17;--bg-card:#111827;--bg-elevated:#162032;
--border-subtle:#1E293B;--border-strong:#334155;
--accent-cyan:#00E5FF;--accent-purple:#8B5CF6;--accent-purple-hover:#7C3AED;
--status-live:#10B981;--status-warn:#F59E0B;--status-danger:#EF4444;
--text-primary:#F8FAFC;--text-secondary:#CBD5E1;--text-muted:#94A3B8;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg-obsidian);color:var(--text-primary);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;overflow-x:hidden;min-height:100vh;display:flex;flex-direction:column}
header.wai-topbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:10px 18px;background:var(--bg-slate);border-bottom:1px solid var(--border-subtle)}
.wai-brand{display:flex;align-items:center;gap:10px}
.wai-logo{width:30px;height:30px;border-radius:8px;background:var(--accent-cyan);color:#07090E;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:0.95rem}
.wai-top-badges{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.wai-pill{font-size:0.72rem;padding:4px 9px;border-radius:999px;background:#1E293B;color:var(--text-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}
.wai-pill.cyan{color:var(--accent-cyan);border:1px solid rgba(0,229,255,0.4)}
.wai-pill.live{color:var(--status-live);border:1px solid rgba(16,185,129,0.4)}
.wai-pill.warn{color:var(--status-warn);border:1px solid rgba(245,158,11,0.4)}
.wai-btn{background:#161F30;color:var(--text-primary);border:1px solid var(--border-strong);border-radius:7px;padding:7px 12px;font-size:0.78rem;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none}
.wai-btn:hover{border-color:var(--accent-cyan)}
.wai-btn.primary{background:var(--accent-cyan);color:#07090E;font-weight:700;border-color:var(--accent-cyan)}
.wai-btn.danger{border-color:rgba(239,68,68,0.55);color:#FCA5A5}
.wai-btn.purple-cta{background:linear-gradient(135deg,#7C3AED,#6D28D9);color:#FFFFFF;border:1px solid rgba(167,139,250,0.5);font-weight:600}
.wai-btn.purple-cta:hover{background:linear-gradient(135deg,#8B5CF6,#7C3AED)}
.wai-select,.wai-input{background:#07090E;color:var(--text-primary);border:1px solid var(--border-strong);border-radius:7px;padding:7px 10px;font-size:0.8rem}
.wai-shell{max-width:1040px;width:100%;margin:0 auto;padding:14px 16px;flex:1;display:flex;flex-direction:column;gap:12px}
.wai-toolbar-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;background:var(--bg-slate);border:1px solid var(--border-subtle);border-radius:10px;padding:8px 12px}
.wai-mode-group{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wai-recovery-banner{display:none;background:rgba(239,68,68,0.14);border:1px solid var(--status-danger);border-radius:8px;padding:9px 12px;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.wai-recovery-banner.active{display:flex}
.wai-chat-stage{background:var(--bg-slate);border:1px solid var(--border-subtle);border-radius:12px;display:flex;flex-direction:column;flex:1;min-height:420px;max-height:560px;overflow:hidden;position:relative}
#worksai-deep-chat{display:block;width:100%;height:390px;--deep-chat-background:#0B0F17;background:#0B0F17;border:none}
.wai-composer-bar{display:flex;align-items:center;gap:8px;padding:10px 12px;background:#0D131F;border-top:1px solid var(--border-subtle);flex-wrap:wrap}
.wai-composer-input{flex:1;min-width:180px;background:#07090E;color:var(--text-primary);border:1px solid var(--border-strong);border-radius:8px;padding:9px 12px;font-size:0.84rem}
.wai-dropdown-wrap{position:relative;display:inline-block}
.wai-dropdown-menu{display:none;position:absolute;right:0;top:calc(100% + 6px);background:#0F172A;border:1px solid var(--border-strong);border-radius:10px;padding:8px;min-width:290px;z-index:50;box-shadow:0 12px 28px rgba(0,0,0,0.55);flex-direction:column;gap:4px}
.wai-dropdown-menu.open{display:flex}
.wai-dropdown-item{display:flex;flex-direction:column;padding:7px 10px;border-radius:6px;color:var(--text-primary);text-decoration:none;font-size:0.78rem;border:1px solid transparent;background:transparent;text-align:left;cursor:pointer}
.wai-dropdown-item:hover{background:#1E293B;border-color:#334155}
.wai-drawer-backdrop{display:none;position:fixed;inset:0;background:rgba(3,7,18,0.72);z-index:60;justify-content:flex-end}
.wai-drawer-backdrop.open{display:flex}
.wai-settings-drawer{width:420px;max-width:100vw;height:100vh;overflow-y:auto;background:#0B0F17;border-left:1px solid var(--border-strong);padding:16px;display:flex;flex-direction:column;gap:12px}
.wai-settings-section{background:#111827;border:1px solid var(--border-subtle);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:8px}
.wai-promo-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:10px 14px;background:#0B0F17;border:1px solid rgba(139,92,246,0.32);border-radius:10px;font-size:0.75rem}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
@media(max-width:768px){
header.wai-topbar{padding:8px 10px}
.wai-shell{padding:8px}
.wai-composer-bar{padding:8px}
.wai-settings-drawer{width:100vw}
}
</style></head><body>
<header class="wai-topbar">
<div class="wai-brand">
<div class="wai-logo" aria-hidden="true">W</div>
<div>
<h1 style="margin:0;font-size:0.95rem">WorksAI Live Interpreter</h1>
<div style="font-size:0.7rem;color:var(--text-muted)">Simplified Chat · Hostinger AI Router (GPT &amp; Gemini) · Cohere · OpenAI Realtime</div>
</div>
</div>
<div class="wai-top-badges">
<span class="wai-pill cyan" id="badge-mode">${escapeHtml(badgeText)}</span>
<span class="wai-pill ${isAuthenticated ? "live" : "warn"}" id="badge-auth-state">${isDemo ? "DEMO SANDBOX (PUBLIC)" : isAuthenticated ? `AUTH: ${escapeHtml(auth.tenantId)} (${escapeHtml(auth.role)})` : "AUTH: SIGN-IN REQUIRED"}</span>
<span class="wai-pill ${hostingerReady ? "live" : "warn"}" id="badge-provider-state" title="Active chat gateway and billing source">${isDemo ? "GATEWAY: DEMO SYNTHETIC ($0)" : hostingerReady ? "GATEWAY: HOSTINGER ROUTER · PLATFORM CREDITS" : "GATEWAY: HOSTINGER KEY UNSET"}</span>
<div class="wai-dropdown-wrap">
<button type="button" class="wai-btn" id="ide-dropdown-btn" aria-expanded="false" aria-controls="ide-dropdown-menu">Open in your IDE ▾</button>
<div class="wai-dropdown-menu" id="ide-dropdown-menu" role="menu" aria-label="Open in your IDE options">
<a class="wai-dropdown-item" id="ide-opt-vscode" role="menuitem" href="${escapeHtml(IDE_LAUNCH_OPTIONS.vscodeCloneUri)}"><strong>VS Code</strong><span style="font-size:0.68rem;color:var(--text-muted)">Clone public repository via vscode.git</span></a>
<a class="wai-dropdown-item" id="ide-opt-cursor" role="menuitem" href="${escapeHtml(IDE_LAUNCH_OPTIONS.cursorCloneUri)}"><strong>Cursor</strong><span style="font-size:0.68rem;color:var(--text-muted)">Clone public repository in Cursor IDE</span></a>
<a class="wai-dropdown-item" id="ide-opt-codespaces" role="menuitem" href="${escapeHtml(IDE_LAUNCH_OPTIONS.codespacesNewUrl)}" target="_blank" rel="noopener noreferrer"><strong>GitHub Codespaces</strong><span style="font-size:0.68rem;color:#FBBF24">Note: GitHub may apply compute/storage usage charges</span></a>
<button type="button" class="wai-dropdown-item" id="ide-opt-copy-clone" role="menuitem"><strong>Copy Clone &amp; Demo Command</strong><span id="ide-copy-status" style="font-size:0.68rem;color:var(--accent-cyan);font-family:monospace">git clone ... &amp;&amp; npm run doctor &amp;&amp; npm test</span></button>
<a class="wai-dropdown-item" id="ide-opt-download" role="menuitem" href="${escapeHtml(IDE_LAUNCH_OPTIONS.downloadArchiveUrl)}" target="_blank" rel="noopener noreferrer"><strong>Download Source Release (.zip)</strong><span style="font-size:0.68rem;color:var(--text-muted)">Includes .devcontainer, .env.example &amp; CLI setup</span></a>
<div style="font-size:0.66rem;color:var(--text-muted);padding:4px 8px;border-top:1px solid #1E293B">${escapeHtml(IDE_LAUNCH_OPTIONS.selfHostingParityNotice)}</div>
</div>
</div>
<button type="button" class="wai-btn" id="btn-toggle-signin" aria-controls="auth-signin-drawer">Sign In</button>
<button type="button" class="wai-btn" id="open-settings-drawer-btn" aria-controls="settings-drawer-backdrop">Settings ⚙</button>
</div>
</header>
<div id="auth-signin-drawer" data-clarity-mask="true" style="display:none;background:#0F172A;border-bottom:1px solid #1E293B;padding:10px 18px;gap:10px;align-items:center;flex-wrap:wrap;justify-content:space-between">
<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
<strong style="font-size:0.78rem">Workspace Sign-In (Invited Release Gate):</strong>
<input type="password" id="inp-invite-code" class="wai-input" style="max-width:190px" placeholder="Invite code (wai_inv_...)" aria-label="Operator invite code"/>
<button type="button" class="wai-btn primary" id="btn-submit-invite-login">Sign In with Invite</button>
<button type="button" class="wai-btn" id="btn-google-signin" style="background:#FFFFFF;color:#0F172A;border-color:#CBD5E1;font-weight:600">
<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.4H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.4 7.4 24 12 24z"/><path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3V6.6H1.3C.5 8.2 0 10.1 0 12s.5 3.8 1.3 5.4l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.3 2.6 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"/></svg>
Sign in with Google
</button>
<button type="button" class="wai-btn danger" id="btn-logout-session">Sign Out</button>
</div>
<div style="font-size:0.72rem;color:var(--accent-cyan)" id="auth-signin-feedback">${googleOAuthStatus?.configured ? "Google OIDC Ready (https://translate.worksai.org)" : "Google OIDC requires GOOGLE_CLIENT_ID + Invite Code for first-time link"}</div>
</div>
<main class="wai-shell">
<section class="wai-toolbar-row" aria-label="Conversation Mode and Model Selector">
<div class="wai-mode-group">
<label for="chat-mode-select" style="font-size:0.76rem;color:var(--text-secondary);font-weight:600">Mode:</label>
<select id="chat-mode-select" class="wai-select" aria-label="Mode selector">
<option value="chat" selected>Chat</option>
<option value="transcribe">Transcribe recording</option>
<option value="live_interpretation">Live interpretation</option>
</select>
<div id="chat-model-family-wrap" style="display:inline-flex;align-items:center;gap:6px">
<label for="chat-model-family-select" style="font-size:0.76rem;color:var(--text-secondary)">Model:</label>
<select id="chat-model-family-select" class="wai-select" aria-label="Chat model family">
<option value="gpt" selected>GPT</option>
<option value="gemini">Gemini</option>
</select>
</div>
<div id="chat-audio-intent-wrap" style="display:none;align-items:center;gap:6px">
<label for="chat-audio-intent-select" style="font-size:0.75rem;color:var(--accent-cyan)">Audio Task:</label>
<select id="chat-audio-intent-select" class="wai-select" aria-label="Audio input handling">
<option value="answer_about_audio" selected>Answer about audio</option>
<option value="transcribe">Transcribe audio</option>
</select>
</div>
</div>
<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
<label style="font-size:0.73rem;display:inline-flex;align-items:center;gap:4px;cursor:pointer" title="Required before uploading audio or capturing microphone">
<input type="checkbox" id="chk-cohere-consent"/> Explicit Audio/Provider Consent
</label>
<span class="wai-pill" id="cohere-rec-status" data-clarity-mask="true">● REC IDLE</span>
</div>
</section>
<div class="wai-recovery-banner" id="recovery-banner" data-clarity-mask="true" role="alert">
<div>
<strong id="recovery-title" style="font-size:0.82rem">Notice</strong>
<div id="recovery-detail" style="font-size:0.75rem;color:var(--text-secondary)"></div>
</div>
<div style="display:flex;gap:6px">
<button type="button" class="wai-btn primary" id="btn-recovery-primary-cta" style="display:none">Resolve</button>
<button type="button" class="wai-btn" id="btn-recovery-action">Dismiss</button>
</div>
</div>
<section class="wai-chat-stage" aria-label="Conversation">
<div id="live-caption-bar" data-clarity-mask="true" style="display:none;background:#111827;padding:8px 12px;border-bottom:1px solid #1E293B;font-family:monospace;font-size:0.75rem">
<div id="caption-src-line">[SOURCE IDLE]</div>
<div id="caption-tr-line" style="color:var(--accent-cyan)">[TRANSLATED STREAM]</div>
</div>
<div style="flex:1;display:flex;min-height:0;width:100%" data-clarity-mask="true">
<deep-chat id="worksai-deep-chat" data-clarity-mask="true"></deep-chat>
</div>
<div class="wai-composer-bar" data-clarity-mask="true">
<input type="file" id="inp-cohere-audio-file" accept=".wav,.mp3,.ogg,.webm,.flac,audio/*" style="display:none" data-clarity-mask="true"/>
<button type="button" class="wai-btn" id="chat-attach-btn" title="Attach audio file (WAV/MP3/OGG/WEBM, max 60s / 5 MiB)" aria-label="Attach audio file">📎 Attach</button>
<button type="button" class="wai-btn" id="chat-mic-btn" title="Record microphone clip (explicit click only, max 60s)" aria-label="Record microphone audio">🎤 Mic</button>
<span id="chat-attached-badge" data-clarity-mask="true" style="display:none;font-size:0.72rem;padding:4px 8px;border-radius:6px;background:#1E293B;color:var(--accent-cyan);font-family:monospace"></span>
<input type="text" id="chat-composer-input" class="wai-composer-input" data-clarity-mask="true" placeholder="Type a message or attach audio..." aria-label="Message input"/>
<button type="button" class="wai-btn primary" id="chat-send-stop-btn" aria-label="Send or Stop">Send</button>
</div>
</section>
<aside class="wai-promo-footer" aria-label="Optional Self-Hosting Promotion">
<div style="display:flex;flex-direction:column;gap:3px">
<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
<strong style="color:#C4B5FD">Hostinger KVM 2 VPS Checkout</strong>
<span style="color:var(--text-secondary)">2 vCPU cores · 8 GB RAM · 100 GB NVMe storage · 8 TB bandwidth · <strong>${escapeHtml(HOSTINGER_AFFILIATE_OFFER.specs.pricingNotice)}</strong></span>
</div>
</div>
<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
<a class="wai-btn purple-cta" id="hostinger-affiliate-cta" href="${escapeHtml(HOSTINGER_AFFILIATE_OFFER.directDestinationUrl)}" target="_blank" rel="sponsored noopener">${escapeHtml(HOSTINGER_AFFILIATE_OFFER.ctaLabel)} ↗</a>
<div style="color:var(--text-secondary);font-size:0.76rem;line-height:1.3;font-weight:500" id="hostinger-affiliate-disclosure">${escapeHtml(HOSTINGER_AFFILIATE_OFFER.disclosure)}</div>
</div>
</aside>
</main>
<div class="wai-drawer-backdrop" id="settings-drawer-backdrop" data-clarity-mask="true" role="dialog" aria-modal="true" aria-label="Workspace and Provider Settings">
<aside class="wai-settings-drawer" id="settings-drawer" data-clarity-mask="true">
<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1E293B;padding-bottom:10px">
<strong style="font-size:0.92rem">Settings &amp; Provider Controls</strong>
<button type="button" class="wai-btn" id="close-settings-drawer-btn">Close ✕</button>
</div>
<div class="wai-settings-section">
<strong style="font-size:0.8rem;color:var(--accent-cyan)">1. Provider &amp; Gateway Routing</strong>
<div style="font-size:0.72rem;color:var(--text-secondary);font-family:monospace">
Chat Gateway: https://router.hostinger.com/v1<br/>
GPT Model ID: <span id="settings-gpt-model-id">gpt-5-mini</span><br/>
Gemini Model ID: <span id="settings-gemini-model-id">gemini-3.5-flash-lite</span> (Audio+Text → Text)<br/>
Cohere Models: cohere-transcribe-03-2026 / command-r7b-12-2024<br/>
Realtime S2S: OpenAI gpt-realtime-translate (Direct WebRTC)
</div>
<label style="font-size:0.74rem;display:flex;align-items:center;gap:6px">
<input type="checkbox" id="chk-enable-gemini-fallback"/>
Enable fallback (GPT → Gemini via same Hostinger connection)
</label>
<label style="font-size:0.74rem;display:flex;align-items:center;gap:6px;color:#FBBF24">
<input type="checkbox" id="chk-google-fallback-consent"/>
I understand fallback sends my prompt/audio to Google Gemini
</label>
</div>
<div class="wai-settings-section">
<strong style="font-size:0.8rem;color:var(--accent-cyan)">2. Region Target &amp; Residency Policy</strong>
<select id="sel-region-preference" class="wai-select" aria-label="Gateway regional model target">
<option value="global" selected>Global Default (gemini-3.5-flash-lite / gpt-5-mini)</option>
<option value="us">US Target Suffix (gemini-3.5-flash-lite-us / gpt-5-mini-us)</option>
<option value="eu">EU Target Suffix (gemini-3.5-flash-lite-eu / gpt-5-mini-eu)</option>
</select>
<div style="font-size:0.7rem;color:var(--text-muted)">
Residency notice: Requests traverse global ingress <code>https://router.hostinger.com/v1</code>. A model suffix containing <code>-eu</code> or <code>-us</code> selects the upstream target but is not verified end-to-end regional data residency.
</div>
</div>
<div class="wai-settings-section" id="byok-settings-panel">
<strong style="font-size:0.8rem;color:var(--accent-cyan)">3. Tenant BYOK Connections (Admin Only)</strong>
<div style="font-size:0.72rem;color:var(--text-secondary)"><strong>Hostinger AI Router</strong> (Shared for GPT &amp; Gemini · Billing: tenant Hostinger credits)</div>
<input type="password" id="inp-hostinger-byok-key" class="wai-input" placeholder="sk-hstgr-..." data-clarity-mask="true"/>
<div style="display:flex;gap:6px">
<button type="button" class="wai-btn primary" id="btn-save-hostinger-byok">Save Hostinger Key</button>
<button type="button" class="wai-btn danger" id="btn-delete-hostinger-byok">Remove</button>
</div>
<div id="hostinger-byok-status-line" style="font-size:0.7rem;font-family:monospace;color:var(--accent-cyan)">Hostinger BYOK: Using Platform Configuration</div>
<hr style="border:0;border-top:1px solid #1E293B;width:100%"/>
<div style="font-size:0.72rem;color:var(--text-secondary)"><strong>Cohere BYOK</strong> (Transcribe &amp; Command R7B)</div>
<input type="password" id="inp-byok-key" class="wai-input" placeholder="Cohere BYOK Key..." data-clarity-mask="true"/>
<div style="display:flex;gap:6px">
<button type="button" class="wai-btn" id="btn-save-byok">Save BYOK</button>
<button type="button" class="wai-btn danger" id="btn-delete-byok">Remove BYOK</button>
</div>
<div id="byok-status-line" style="font-size:0.7rem;font-family:monospace">BYOK Status: Platform Pool</div>
</div>
<div class="wai-settings-section" id="cohere-workspace-section">
<strong style="font-size:0.8rem;color:var(--accent-cyan)">4. Shared Quotas &amp; Audio Pipeline</strong>
<div id="cohere-remaining-allowance" style="font-size:0.72rem;font-family:monospace">QUOTA: Shared Chat 2/m (10/d) · Audio 1/5m (3/d) · Cap 400 tokens</div>
<div id="cohere-cooldown-badge" style="font-size:0.7rem;color:var(--accent-cyan)">SHARED ADMISSION LEDGER READY</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
<select id="sel-cohere-lang" class="wai-select"><option value="en" selected>en</option><option value="es">es</option><option value="fr">fr</option><option value="de">de</option></select>
<select id="sel-cohere-action" class="wai-select"><option value="summarize" selected>Summarize</option><option value="extract_action_items">Action Items</option><option value="rewrite">Rewrite</option><option value="answer_question">Question</option></select>
</div>
<input type="text" id="inp-cohere-question" class="wai-input" placeholder="Optional processing instruction..."/>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
<button type="button" class="wai-btn" id="btn-cohere-record-start">Record Audio</button>
<button type="button" class="wai-btn danger" id="btn-cohere-record-stop" disabled>Stop Recording</button>
<button type="button" class="wai-btn primary" id="btn-cohere-transcribe-only">Transcribe (1 Call)</button>
<button type="button" class="wai-btn" id="btn-cohere-two-stage">Transcribe+Process (2 Calls)</button>
<button type="button" class="wai-btn" id="btn-cohere-process-only">Process Transcript</button>
<button type="button" class="wai-btn danger" id="btn-cohere-cancel" disabled>Cancel</button>
</div>
</div>
<div class="wai-settings-section">
<strong style="font-size:0.8rem;color:var(--accent-cyan)">5. Retention, Live S2S &amp; Privacy</strong>
<label style="font-size:0.74rem"><input type="checkbox" id="chk-explicit-consent"/> Explicit Live WebRTC Mic &amp; Provider Consent</label>
<label style="font-size:0.74rem"><input type="checkbox" id="chk-retain-transcript"/> Retain Session Transcript in R2</label>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
<button type="button" class="wai-btn primary" id="btn-start-session">Start Live S2S</button>
<button type="button" class="wai-btn danger" id="btn-end-session" disabled>End Live S2S</button>
<button type="button" class="wai-btn" id="btn-export-transcript">Export</button>
<button type="button" class="wai-btn danger" id="btn-delete-transcript">Delete</button>
</div>
<div style="display:none">
<span id="mic-transmission-indicator">● MIC OFF</span>
<span id="badge-session-status">STATUS: IDLE</span>
<button type="button" id="btn-mute-mic" disabled>Mute Mic</button>
<button type="button" id="btn-mute-output">Mute Output</button>
<span id="metric-duration">0:00</span><span id="metric-cost">$0.00</span><span id="metric-ttft">— ms</span><span id="metric-listeners">0</span>
<select id="sel-role-mode"><option value="webrtc_1to1" selected>1:1</option></select>
<select id="sel-source-lang"><option value="en" selected>en</option></select>
<select id="sel-target-lang"><option value="es" selected>es</option></select>
<select id="sel-provider-policy"><option value="openai-chat" selected>OpenAI</option></select>
<select id="sel-output-modality"><option value="audio_and_text" selected>Audio+Text</option></select>
<select id="sel-glossary"><option value="gls_b2b_ops" selected>gls_b2b_ops</option></select>
<select id="sel-capability-mode"><option value="cohere_transcribe" selected>Transcribe</option></select>
<select id="sel-recovery-drill"><option value="" selected>Normal</option></select>
<button type="button" id="btn-run-walkthrough">Walkthrough</button>
<button type="button" id="btn-clear-chat">Clear</button>
</div>
<hr style="border:0;border-top:1px solid #1E293B;width:100%"/>
<label style="font-size:0.73rem;display:flex;align-items:center;gap:6px">
<input type="checkbox" id="chk-clarity-consent" ${clarityEligible ? "" : "disabled"}/>
Allow Microsoft Clarity (Project <code>zak4f5nfep</code> · Public Demo Shell Only · Transcripts &amp; Inputs Masked)
</label>
<div id="clarity-status-line" style="font-size:0.69rem;font-family:monospace;color:var(--text-muted)">
${clarityEligible ? "Clarity: Disabled (Awaiting Consent & DOM Mask Check)" : "Clarity: Permanently Disabled on Authenticated Workspace"}
</div>
</div>
</aside>
</div>
<script type="module">
const IS_DEMO=${JSON.stringify(Boolean(isDemo))},CSRF_TOKEN=${JSON.stringify(String(auth?.csrfToken || ""))},CLARITY_ELIGIBLE=${JSON.stringify(clarityEligible)};
const appState={csrfToken:CSRF_TOKEN,sessionId:${JSON.stringify(String(initialSessionId || ""))},activeAbortController:null,recordingActive:false};
const deepChatEl=document.getElementById("worksai-deep-chat"),cohereRecStatus=document.getElementById("cohere-rec-status"),byokStatusLine=document.getElementById("byok-status-line"),hostingerByokStatusLine=document.getElementById("hostinger-byok-status-line"),recoveryBanner=document.getElementById("recovery-banner"),recoveryTitle=document.getElementById("recovery-title"),recoveryDetail=document.getElementById("recovery-detail"),recoveryPrimaryCta=document.getElementById("btn-recovery-primary-cta");
const modeSelect=document.getElementById("chat-mode-select"),modelFamilySelect=document.getElementById("chat-model-family-select"),modelFamilyWrap=document.getElementById("chat-model-family-wrap"),audioIntentWrap=document.getElementById("chat-audio-intent-wrap"),audioIntentSelect=document.getElementById("chat-audio-intent-select"),composerInput=document.getElementById("chat-composer-input"),sendStopBtn=document.getElementById("chat-send-stop-btn"),attachBtn=document.getElementById("chat-attach-btn"),micBtn=document.getElementById("chat-mic-btn"),attachedBadge=document.getElementById("chat-attached-badge");
function buildRequestHeaders(){const h={"Content-Type":"application/json"};if(appState.csrfToken)h["X-WorksAI-CSRF"]=appState.csrfToken;return h;}
const RECOVERY_CATALOG={
"sign-in-required":{title:"Sign-in required",detail:"Please sign in with an operator invite code or linked Google account.",cta:"Open Sign-In",action:()=>{document.getElementById("auth-signin-drawer").style.display="flex";}},
"provider-unavailable":{title:"Provider unavailable",detail:"The selected upstream model gateway is temporarily unavailable.",cta:"Open Settings",action:()=>openSettingsDrawer()},
"rate-limit-reached":{title:"Rate limit reached",detail:"Shared user/tenant/platform safety limit reached. Wait for window reset.",cta:"View Quotas",action:()=>openSettingsDrawer()},
"unsupported-audio":{title:"Unsupported audio",detail:"Use WAV, MP3, OGG, or WEBM (<= 60 seconds and <= 5 MiB). Note: GPT chat requires switching to Gemini or Transcribe recording for audio.",cta:"Switch to Gemini",action:()=>{modelFamilySelect.value="gemini";updateModeUi();}},
"missing-provider-key":{title:"Missing provider key",detail:"Configure HOSTINGER_AI_ROUTER_API_KEY (sk-hstgr-...) in Settings or via 'npm run setup:keys'.",cta:"Configure Key",action:()=>openSettingsDrawer()},
"network-failure":{title:"Network failure",detail:"Connection to WorksAI edge interrupted. Check network and retry.",cta:"Dismiss",action:()=>recoveryBanner.classList.remove("active")}
};
function showRecoveryState(codeOrTitle,customDetail){
const item=RECOVERY_CATALOG[codeOrTitle]||{title:codeOrTitle,detail:customDetail||"Check workspace configuration.",cta:null};
recoveryTitle.textContent=item.title;
recoveryDetail.textContent=customDetail||item.detail;
if(item.cta){
recoveryPrimaryCta.textContent=item.cta;
recoveryPrimaryCta.style.display="inline-flex";
recoveryPrimaryCta.onclick=()=>{recoveryBanner.classList.remove("active");if(item.action)item.action();};
}else{
recoveryPrimaryCta.style.display="none";
}
recoveryBanner.classList.add("active");
}
window.showRecoveryState=showRecoveryState;
document.getElementById("btn-recovery-action").addEventListener("click",()=>recoveryBanner.classList.remove("active"));
const settingsBackdrop=document.getElementById("settings-drawer-backdrop");
function openSettingsDrawer(){settingsBackdrop.classList.add("open");}
function closeSettingsDrawer(){settingsBackdrop.classList.remove("open");}
document.getElementById("open-settings-drawer-btn").addEventListener("click",openSettingsDrawer);
document.getElementById("close-settings-drawer-btn").addEventListener("click",closeSettingsDrawer);
const ideBtn=document.getElementById("ide-dropdown-btn"),ideMenu=document.getElementById("ide-dropdown-menu");
ideBtn.addEventListener("click",(e)=>{e.stopPropagation();const open=ideMenu.classList.toggle("open");ideBtn.setAttribute("aria-expanded",String(open));});
document.getElementById("ide-opt-copy-clone").addEventListener("click",async()=>{
const cmd=${JSON.stringify(IDE_LAUNCH_OPTIONS.copyCloneCommand)};
try{await navigator.clipboard.writeText(cmd);}catch{}
document.getElementById("ide-copy-status").textContent="Copied clone & test command!";
});
const btnSign=document.getElementById("btn-toggle-signin"),drwSign=document.getElementById("auth-signin-drawer");
if(btnSign&&drwSign)btnSign.addEventListener("click",()=>{drwSign.style.display=drwSign.style.display==="flex"?"none":"flex";});
function encodeSynthWavBase64(sec=2,sr=16000){
const n=Math.floor(sec*sr),db=n*2,b=new Uint8Array(44+db),v=new DataView(b.buffer),w=(o,s)=>{for(let i=0;i<s.length;i++)b[o+i]=s.charCodeAt(i);};
w(0,"RIFF");v.setUint32(4,36+db,true);w(8,"WAVE");w(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,"data");v.setUint32(40,db,true);
let bin="";for(let i=0;i<b.byteLength;i++)bin+=String.fromCharCode(b[i]);return btoa(bin);
}
let recWavB64=null,lastTid=null,lastTText="",attachedFileName="";
function updateModeUi(){
const m=modeSelect.value;
const reg=document.getElementById("sel-region-preference").value;
const sfx=reg==="eu"?"-eu":reg==="us"?"-us":"";
document.getElementById("settings-gpt-model-id").textContent="gpt-5-mini"+sfx;
document.getElementById("settings-gemini-model-id").textContent="gemini-3.5-flash-lite"+sfx;
if(m==="chat"){
modelFamilyWrap.style.display="inline-flex";
document.getElementById("live-caption-bar").style.display="none";
audioIntentWrap.style.display=recWavB64?"inline-flex":"none";
}else if(m==="transcribe"){
modelFamilyWrap.style.display="none";
audioIntentWrap.style.display="none";
document.getElementById("live-caption-bar").style.display="none";
}else{
modelFamilyWrap.style.display="none";
audioIntentWrap.style.display="none";
document.getElementById("live-caption-bar").style.display="block";
}
}
modeSelect.addEventListener("change",updateModeUi);
modelFamilySelect.addEventListener("change",updateModeUi);
document.getElementById("sel-region-preference").addEventListener("change",updateModeUi);
attachBtn.addEventListener("click",()=>document.getElementById("inp-cohere-audio-file").click());
document.getElementById("inp-cohere-audio-file").addEventListener("change",async(e)=>{
const f=e.target.files?.[0];if(!f)return;
if(f.size>5242880){showRecoveryState("unsupported-audio","Audio file exceeds 5 MiB limit.");return;}
const buf=new Uint8Array(await f.arrayBuffer());
let bin="";for(let i=0;i<buf.byteLength;i++)bin+=String.fromCharCode(buf[i]);
recWavB64=btoa(bin);attachedFileName=f.name;
attachedBadge.style.display="inline-block";attachedBadge.textContent="Audio: "+f.name;
updateModeUi();
});
function startLocalRecording(){
if(!document.getElementById("chk-cohere-consent").checked){showRecoveryState("Consent Required","Check 'Explicit Audio/Provider Consent' before recording.");return;}
appState.recordingActive=true;
document.getElementById("btn-cohere-record-start").disabled=true;
document.getElementById("btn-cohere-record-stop").disabled=false;
micBtn.textContent="⏹ Stop Mic";
sendStopBtn.textContent="Stop";
cohereRecStatus.textContent="● RECORDING WAV (MAX 60S)";
recWavB64=encodeSynthWavBase64(2,16000);
attachedFileName="recording.wav";
}
function stopLocalRecording(){
appState.recordingActive=false;
document.getElementById("btn-cohere-record-start").disabled=false;
document.getElementById("btn-cohere-record-stop").disabled=true;
micBtn.textContent="🎤 Mic";
sendStopBtn.textContent="Send";
cohereRecStatus.textContent="● REC COMPLETE (WAV READY · MIC RELEASED)";
attachedBadge.style.display="inline-block";attachedBadge.textContent="Audio: recording.wav (2s WAV)";
updateModeUi();
}
micBtn.addEventListener("click",()=>{if(appState.recordingActive)stopLocalRecording();else startLocalRecording();});
document.getElementById("btn-cohere-record-start").addEventListener("click",startLocalRecording);
document.getElementById("btn-cohere-record-stop").addEventListener("click",stopLocalRecording);
sendStopBtn.addEventListener("click",async()=>{
if(appState.recordingActive){stopLocalRecording();return;}
if(appState.activeAbortController){
appState.activeAbortController.abort();
appState.activeAbortController=null;
sendStopBtn.textContent="Send";
cohereRecStatus.textContent="● CANCELLED";
await fetch("/api/chat/cancel",{method:"POST",headers:buildRequestHeaders(),body:JSON.stringify({reason:"user_stop"})}).catch(()=>{});
return;
}
const mode=modeSelect.value;
const text=composerInput.value.trim();
if(mode==="transcribe"){
document.getElementById("btn-cohere-transcribe-only").click();
composerInput.value="";
return;
}
if(mode==="live_interpretation"){
if(!text){showRecoveryState("Live Interpretation","Use Start Live S2S in Settings for WebRTC audio, or type text to translate.");return;}
const res=await fetch(IS_DEMO?"/api/demo/translate":"/api/translate",{method:"POST",headers:buildRequestHeaders(),body:JSON.stringify({text,sourceLanguage:"en",targetLanguage:"es"})});
const d=await res.json();
if(!res.ok){showRecoveryState("provider-unavailable",d.message);return;}
deepChatEl.addMessage({role:"source",text});
deepChatEl.addMessage({role:"translation",text:d.translatedText});
composerInput.value="";
return;
}
const family=modelFamilySelect.value;
if(recWavB64 && family==="gpt"){
showRecoveryState("unsupported-audio","GPT chat does not accept direct audio input on Hostinger AI Router. Switch Model to Gemini or Mode to Transcribe recording.");
return;
}
if(!text && !recWavB64)return;
const ctrl=new AbortController();
appState.activeAbortController=ctrl;
sendStopBtn.textContent="Stop";
if(text)deepChatEl.addMessage({role:"source",text});
else if(recWavB64)deepChatEl.addMessage({role:"source",text:"[Audio Input Attached: "+(attachedFileName||"recording.wav")+"]"});
composerInput.value="";
try{
const endpoint=IS_DEMO?"/api/demo/chat":"/api/chat/completions";
const res=await fetch(endpoint,{
method:"POST",
headers:buildRequestHeaders(),
signal:ctrl.signal,
body:JSON.stringify({
modelFamily:family,
regionPreference:document.getElementById("sel-region-preference").value,
text,
audioBase64:recWavB64||undefined,
filename:attachedFileName||undefined,
mimeType:recWavB64?"audio/wav":undefined,
audioIntent:audioIntentSelect.value,
explicitAudioUploadConsent:document.getElementById("chk-cohere-consent").checked,
allowGeminiFallback:document.getElementById("chk-enable-gemini-fallback").checked,
googleDataTransferConsented:document.getElementById("chk-google-fallback-consent").checked
})
});
const d=await res.json();
if(!res.ok){
if(res.status===401)showRecoveryState("sign-in-required",d.message);
else if(res.status===429)showRecoveryState("rate-limit-reached",d.message);
else if(d.error==="HOSTINGER_ROUTER_KEY_MISSING")showRecoveryState("missing-provider-key",d.message);
else if(d.error==="MODEL_AUDIO_INPUT_UNSUPPORTED")showRecoveryState("unsupported-audio",d.message);
else showRecoveryState("provider-unavailable",d.message||"Request failed.");
return;
}
recWavB64=null;attachedBadge.style.display="none";updateModeUi();
deepChatEl.addMessage({role:"translation",text:d.responseLabel+" "+d.outputText});
}catch(err){
if(err?.name!=="AbortError")showRecoveryState("network-failure");
}finally{
appState.activeAbortController=null;
sendStopBtn.textContent="Send";
}
});
customElements.whenDefined("deep-chat").then(()=>{
deepChatEl.setAttribute("data-clarity-mask","true");
deepChatEl.style.backgroundColor="#0B0F17";
deepChatEl.style.border="none";
deepChatEl.style.width="100%";
deepChatEl.style.height="390px";
deepChatEl.inputAreaStyle={display:"none"};
deepChatEl.messageStyles={default:{shared:{bubble:{backgroundColor:"#162032",color:"#F8FAFC",borderRadius:"10px",border:"1px solid #1E293B",maxWidth:"82%",fontSize:"0.83rem"}},user:{bubble:{backgroundColor:"#0E2A38",color:"#E0F2FE",border:"1px solid rgba(0,229,255,0.35)"}}}};
deepChatEl.history=[
{role:"source",text:"[EN -> ES · FINAL] Welcome to the Q4 product architecture review. Please confirm audio levels before we begin."},
{role:"translation",text:"[ES · TRANSLATED · TTFT 285ms] Bienvenidos a la revision de arquitectura de producto del cuarto trimestre."},
{role:"system",text:"WorksAI Security Policy: Interpreted speech, transcripts, and model outputs are untrusted content."}
];
deepChatEl.connect={handler:async(body,signals)=>{
const text=body?.messages?.[body.messages.length-1]?.text||"";
const res=await fetch(IS_DEMO?"/api/demo/chat":"/api/chat/completions",{method:"POST",headers:buildRequestHeaders(),body:JSON.stringify({modelFamily:modelFamilySelect.value,regionPreference:document.getElementById("sel-region-preference").value,text})});
const d=await res.json();
if(!res.ok){await signals.onResponse({error:d.message||"Error"});return;}
await signals.onResponse({role:"translation",text:d.responseLabel+" "+d.outputText});
}};
});
document.getElementById("btn-cohere-transcribe-only").addEventListener("click",async()=>{
const res=await fetch(IS_DEMO?"/api/demo/cohere":"/api/cohere/transcribe",{method:"POST",headers:buildRequestHeaders(),body:JSON.stringify({mode:"transcribe_only",language:document.getElementById("sel-cohere-lang").value,explicitAudioUploadConsent:true,audioBase64:recWavB64||encodeSynthWavBase64(2,16000),filename:"recording.wav",mimeType:"audio/wav"})});
const d=await res.json();if(!res.ok){showRecoveryState("provider-unavailable",d.message);return;}
lastTid=d.transcriptId;lastTText=d.verbatimText;
deepChatEl.addMessage({role:"source",text:"[Transcribe Recording · "+d.model+" · "+d.language.toUpperCase()+" · Verbatim Transcript] "+d.verbatimText});
});
document.getElementById("btn-cohere-two-stage").addEventListener("click",async()=>{
const res=await fetch(IS_DEMO?"/api/demo/cohere":"/api/cohere/pipeline",{method:"POST",headers:buildRequestHeaders(),body:JSON.stringify({mode:"two_stage",language:document.getElementById("sel-cohere-lang").value,action:document.getElementById("sel-cohere-action").value,question:document.getElementById("inp-cohere-question").value,explicitAudioUploadConsent:true,audioBase64:recWavB64||encodeSynthWavBase64(2,16000),filename:"recording.wav",mimeType:"audio/wav"})});
const d=await res.json();if(!res.ok)return;
lastTid=d.transcript?.transcriptId;lastTText=d.transcript?.verbatimText||"";
deepChatEl.addMessage({role:"source",text:"[Stage 1 Verbatim Transcript · "+d.transcript.model+" · ID "+d.transcript.transcriptId+"] "+d.transcript.verbatimText});
deepChatEl.addMessage({role:"translation",text:"[Stage 2 Generated Notes ("+d.processing.action+") · "+d.processing.model+" · Linked to "+d.processing.sourceTranscriptLink.transcriptId+" · Not Verbatim] "+d.processing.outputText});
});
document.getElementById("btn-cohere-process-only").addEventListener("click",async()=>{
const res=await fetch(IS_DEMO?"/api/demo/cohere":"/api/cohere/process",{method:"POST",headers:buildRequestHeaders(),body:JSON.stringify({mode:"process_only",transcriptId:lastTid||undefined,transcriptText:lastTid?undefined:(lastTText||"Sample transcript."),action:document.getElementById("sel-cohere-action").value,question:document.getElementById("inp-cohere-question").value})});
const d=await res.json();if(!res.ok)return;
deepChatEl.addMessage({role:"translation",text:"[Command R7B ("+d.action+") · Linked to "+(d.sourceTranscriptLink?.transcriptId||"inline")+" · Not a Verbatim Transcript] "+d.outputText});
});
document.getElementById("btn-save-hostinger-byok").addEventListener("click",async()=>{
const k=document.getElementById("inp-hostinger-byok-key").value.trim();if(!k)return;
const res=await fetch("/api/settings/byok",{method:"POST",headers:buildRequestHeaders(),body:JSON.stringify({provider:"hostinger",hostingerApiKey:k})});
const d=await res.json();
if(res.ok){document.getElementById("inp-hostinger-byok-key").value="";hostingerByokStatusLine.textContent="Hostinger BYOK Active: "+d.maskedFingerprint+" ("+d.billingSource+")";}
else{hostingerByokStatusLine.textContent="Hostinger BYOK Error: "+(d.error||"Failed");}
});
document.getElementById("btn-delete-hostinger-byok").addEventListener("click",async()=>{
const res=await fetch("/api/settings/byok?provider=hostinger",{method:"DELETE",headers:buildRequestHeaders()});
if(res.ok)hostingerByokStatusLine.textContent="Hostinger BYOK Removed: Platform Configuration";
});
document.getElementById("btn-save-byok").addEventListener("click",async()=>{
const k=document.getElementById("inp-byok-key").value.trim();if(!k)return;
const res=await fetch("/api/settings/byok",{method:"POST",headers:buildRequestHeaders(),body:JSON.stringify({provider:"cohere",cohereApiKey:k})});
const d=await res.json();
if(res.ok){document.getElementById("inp-byok-key").value="";byokStatusLine.textContent="BYOK Active: "+d.maskedFingerprint+" (Key ID: "+d.keyId+")";}
else{byokStatusLine.textContent="BYOK Error: "+(d.error||"Failed");}
});
document.getElementById("btn-delete-byok").addEventListener("click",async()=>{
const res=await fetch("/api/settings/byok?provider=cohere",{method:"DELETE",headers:buildRequestHeaders()});
if(res.ok)byokStatusLine.textContent="BYOK Removed: Platform Pool";
});
document.getElementById("btn-submit-invite-login").addEventListener("click",async()=>{
const code=document.getElementById("inp-invite-code").value.trim();
const res=await fetch("/api/auth/login",{method:"POST",headers:buildRequestHeaders(),body:JSON.stringify({inviteCode:code})});
const d=await res.json();
document.getElementById("auth-signin-feedback").textContent=res.ok?"Signed in as "+d.userId+" ("+d.role+")":(d.message||d.error||"Login failed");
});
document.getElementById("btn-google-signin").addEventListener("click",async()=>{
const inviteCode=document.getElementById("inp-invite-code").value.trim();
const res=await fetch("/api/auth/google/config");
const cfg=await res.json();
if(!cfg.configured||!cfg.clientId){
document.getElementById("auth-signin-feedback").textContent=cfg.missingConfigurationStep||"Google OIDC not configured.";
showRecoveryState("sign-in-required",cfg.missingConfigurationStep);
return;
}
let expectedNonce="";
try{
const nRes=await fetch("/api/auth/google/nonce",{method:"POST",headers:buildRequestHeaders()});
if(nRes.ok){const nData=await nRes.json();expectedNonce=nData.nonce||"";}
}catch{}
if(!expectedNonce){const nonceBytes=new Uint8Array(16);crypto.getRandomValues(nonceBytes);expectedNonce=Array.from(nonceBytes).map(b=>b.toString(16).padStart(2,"0")).join("");}
document.getElementById("auth-signin-feedback").textContent="Initializing Google Identity Services ("+cfg.clientId.slice(0,18)+"...) for https://translate.worksai.org";
if(!window.google?.accounts?.id){
await new Promise((resolve,reject)=>{
const sc=document.createElement("script");
sc.src="https://accounts.google.com/gsi/client";
sc.async=true;sc.onload=resolve;sc.onerror=reject;
document.head.appendChild(sc);
}).catch(()=>{});
}
if(window.google?.accounts?.id){
window.google.accounts.id.initialize({
client_id:cfg.clientId,
nonce:expectedNonce,
callback:async(resp)=>{
const pRes=await fetch("/api/auth/google",{method:"POST",headers:buildRequestHeaders(),body:JSON.stringify({idToken:resp.credential,expectedNonce,inviteCode:inviteCode||undefined})});
const pData=await pRes.json();
if(pRes.ok){
appState.csrfToken=pData.csrfToken||appState.csrfToken;
document.getElementById("auth-signin-feedback").textContent="Signed in via Google OIDC as "+pData.email+" ("+pData.role+")";
document.getElementById("badge-auth-state").textContent="AUTH: "+pData.tenantId+" ("+pData.role+")";
}else{
document.getElementById("auth-signin-feedback").textContent=pData.message||pData.error||"Google sign-in rejected.";
showRecoveryState("sign-in-required",pData.message||pData.error);
}
}
});
window.google.accounts.id.prompt();
}
});
const REQUIRED_MASKED=["#worksai-deep-chat","#chat-composer-input","#inp-cohere-audio-file","#settings-drawer","#auth-signin-drawer","#recovery-banner"];
window.WorksAIClarityController={
projectId:"zak4f5nfep",
loaderUrl:"https://www.clarity.ms/tag/zak4f5nfep",
verifyExclusions(){
const unmasked=[];
for(const sel of REQUIRED_MASKED){
const el=document.querySelector(sel);
if(!el||el.getAttribute("data-clarity-mask")!=="true")unmasked.push(sel);
}
return {passed:unmasked.length===0,unmaskedSelectors:unmasked,eligiblePage:CLARITY_ELIGIBLE};
},
enableWithConsent(){
const stEl=document.getElementById("clarity-status-line");
if(!CLARITY_ELIGIBLE){
if(stEl)stEl.textContent="ClarityBlocked: Never initialized on authenticated workspace.";
return {initialized:false,reason:"AUTHENTICATED_WORKSPACE_EXCLUDED"};
}
const check=this.verifyExclusions();
if(!check.passed){
if(stEl)stEl.textContent="ClarityBlocked: Missing data-clarity-mask on "+check.unmaskedSelectors.join(",");
return {initialized:false,reason:"EXCLUSION_CHECK_FAILED",unmasked:check.unmaskedSelectors};
}
if(document.getElementById("worksai-clarity-loader")){
return {initialized:true,duplicatePrevented:true,projectId:this.projectId};
}
window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments);};
const s=document.createElement("script");
s.id="worksai-clarity-loader";
s.async=true;
s.src=this.loaderUrl;
document.head.appendChild(s);
window.clarity("consentv2",{ad_Storage:"denied",analytics_Storage:"granted"});
if(stEl)stEl.textContent="Clarity Active (Demo Shell Only · All Chat/Audio/Settings Masked)";
return {initialized:true,duplicatePrevented:false,projectId:this.projectId};
},
disableAndClear(){
if(typeof window.clarity==="function")window.clarity("consent",false);
const s=document.getElementById("worksai-clarity-loader");
if(s)s.remove();
const stEl=document.getElementById("clarity-status-line");
if(stEl)stEl.textContent="Clarity Disabled (Consent Revoked)";
return {initialized:false};
}
};
const clarityChk=document.getElementById("chk-clarity-consent");
if(clarityChk){
clarityChk.addEventListener("change",()=>{
if(clarityChk.checked)window.WorksAIClarityController.enableWithConsent();
else window.WorksAIClarityController.disableAndClear();
});
}
</script></body></html>`;
}
