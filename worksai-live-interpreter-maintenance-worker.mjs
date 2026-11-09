/**
 * WorksAI Live Interpreter — Prebuilt No-Inference Maintenance & Rollback Worker (v1.1.0-maintenance)
 *
 * Purpose (Section 13 Rollback Design):
 * Keeps https://translate.worksai.org attached to its Cloudflare Workers Custom Domain
 * (preventing fallback to the unproxied wildcard A record *.worksai.org -> 76.76.21.21)
 * while disabling all live OpenAI / Workers AI inference, credential minting, and session creation.
 */

export const MAINTENANCE_VERSION = "1.1.0-maintenance";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Cache-Control": "no-store"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method === "GET" && path === "/health") {
      return new Response(
        JSON.stringify(
          {
            status: "maintenance_no_inference",
            service: "worksai-live-interpreter",
            version: MAINTENANCE_VERSION,
            liveInferenceEnabled: false,
            wildcardFallbackPrevented: true,
            timestamp: new Date().toISOString()
          },
          null,
          2
        ),
        { status: 200, headers }
      );
    }

    if (request.method === "GET" && (path === "/" || path === "/demo")) {
      const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorksAI Live Interpreter — Maintenance Mode</title>
  <style>
    body { margin:0; background:#07090E; color:#F8FAFC; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; }
    .card { max-width:560px; background:#0D1117; border:1px solid #1E293B; border-radius:12px; padding:24px; }
    .pill { display:inline-block; padding:4px 10px; border-radius:999px; font-size:0.75rem; font-family:monospace; background:rgba(245,158,11,0.15); color:#FBBF24; border:1px solid rgba(245,158,11,0.45); margin-bottom:12px; }
    h1 { margin:0 0 8px 0; font-size:1.2rem; }
    p { margin:0; color:#94A3B8; font-size:0.9rem; line-height:1.5; }
  </style>
</head>
<body>
  <main class="card" role="main">
    <span class="pill">MAINTENANCE MODE · NO PAID INFERENCE</span>
    <h1>WorksAI Live Interpreter is in Safe Maintenance Mode</h1>
    <p>Live provider translation and microphone session minting are temporarily paused by operator rollback policy. Custom domain routing on <code>translate.worksai.org</code> remains protected.</p>
  </main>
</body>
</html>`;
      return new Response(html, {
        status: 200,
        headers: { ...headers, "Content-Type": "text/html; charset=utf-8" }
      });
    }

    return new Response(
      JSON.stringify(
        {
          error: "MAINTENANCE_ROLLBACK_ACTIVE",
          message: "WorksAI Live Interpreter is currently in no-inference maintenance rollback mode. Zero provider calls are permitted."
        },
        null,
        2
      ),
      { status: 503, headers }
    );
  }
};
