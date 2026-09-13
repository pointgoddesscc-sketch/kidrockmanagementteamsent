const SECURITY = {
  "content-security-policy":
    "default-src 'self'; img-src 'self' data:; style-src 'unsafe-inline'; script-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
};

function page() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>kidrockmanagementteamsent.com</title>
  <style>body{margin:0;background:#0b0d10;color:#f4f1ea;font-family:Georgia,serif;min-height:100vh}main{max-width:840px;margin:0 auto;padding:12vh 24px}.e{letter-spacing:.16em;text-transform:uppercase;font-family:sans-serif;font-size:.72rem;color:#e8b86d}h1{font-size:clamp(1.8rem,5vw,3rem);word-break:break-word}p{color:#b7b1a6;font-size:1.15rem;max-width:38rem}a{color:#e8b86d}.g{display:grid;gap:14px;margin:40px 0}@media(min-width:720px){.g{grid-template-columns:repeat(3,1fr)}}article{background:#14181e;border:1px solid #2a3038;border-radius:14px;padding:18px}article h2{margin:0 0 8px;font-size:1.05rem}article p{margin:0;font-family:sans-serif;font-size:.92rem}footer{border-top:1px solid #2a3038;padding-top:18px;font-family:sans-serif;font-size:.85rem}</style></head>
  <body><main><p class="e">Cloudflare Worker · Live</p><h1>kidrockmanagementteamsent.com</h1>
  <p>This hostname is served from a Cloudflare Worker. Official Kid Rock site: <a href="https://kidrock.com" rel="noopener noreferrer">kidrock.com</a>.</p>
  <section class="g"><article><h2>Edge</h2><p>Health: <a href="/health">/health</a></p></article><article><h2>Source</h2><p>Public GitHub repo kidrockmanagementteamsent</p></article><article><h2>Status</h2><p><a href="/api/status">/api/status</a></p></article></section>
  <footer><p>Not a payment, membership, or meet-and-greet portal.</p></footer></main></body></html>`;
}

function json(data, status) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status || 200,
    headers: Object.assign(
      { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
      SECURITY
    ),
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    if (host === "www.kidrockmanagementteamsent.com") {
      url.hostname = "kidrockmanagementteamsent.com";
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === "/health" || url.pathname === "/api/health") {
      return json({
        ok: true,
        service: "kidrockmanagementteamsent",
        host,
        ts: new Date().toISOString(),
      });
    }
    if (url.pathname === "/api/status") {
      return json({
        domain: "kidrockmanagementteamsent.com",
        platform: "cloudflare-workers",
        repo: "pointgoddesscc-sketch/kidrockmanagementteamsent",
        officialArtistSite: "https://kidrock.com",
      });
    }
    return new Response(page(), {
      headers: Object.assign(
        { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" },
        SECURITY
      ),
    });
  },
};
