import { chromium } from 'playwright';
import path from 'node:path';

async function generateThumbnail() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
    deviceScaleFactor: 2,
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px;
      height: 800px;
      background: #090d16;
      color: #ffffff;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 64px 72px;
      background-image: 
        radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 20% 80%, rgba(217, 119, 6, 0.12) 0%, transparent 40%),
        linear-gradient(to right, #1e293b 1px, transparent 1px),
        linear-gradient(to bottom, #1e293b 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 48px 48px, 48px 48px;
    }
    .badge-bar {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 6px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .badge-primary {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.4);
    }
    .badge-secondary {
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid #334155;
    }
    .hero-content {
      margin-top: 10px;
    }
    .brand-title {
      font-size: 84px;
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1;
      display: flex;
      align-items: center;
      gap: 20px;
      color: #ffffff;
    }
    .brand-icon {
      width: 76px;
      height: 76px;
      border-radius: 18px;
      background: #065f46;
      border: 2px solid #34d399;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
    }
    .tagline {
      font-size: 28px;
      font-weight: 500;
      color: #cbd5e1;
      margin-top: 16px;
      max-width: 900px;
      line-height: 1.3;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 36px;
    }
    .feature-card {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 24px;
      backdrop-filter: blur(8px);
    }
    .feature-header {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      color: #34d399;
      text-transform: uppercase;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .feature-desc {
      font-size: 16px;
      color: #94a3b8;
      line-height: 1.4;
    }
    .footer-bar {
      border-top: 1px solid #1e293b;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #64748b;
    }
    .highlight-pill {
      color: #38bdf8;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div>
    <div class="badge-bar">
      <span class="badge badge-primary">STEMergent Hacks 2026 • Hackathon Pathway</span>
      <span class="badge badge-secondary">Zero-Install Community Logistics</span>
    </div>

    <div class="hero-content">
      <div class="brand-title">
        <div class="brand-icon">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <path d="M9 17h6"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
        RescueRoute
      </div>
      <p class="tagline">
        Connecting surplus food with volunteer vehicle fleets through real-time cold-chain radars and multi-stop route optimization.
      </p>
    </div>

    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-header">
          <span>⚡ Cold-Chain Radar</span>
        </div>
        <div class="feature-desc">
          Live 2-hour perishable countdowns tracking USDA safety windows before food violates temperature codes.
        </div>
      </div>

      <div class="feature-card">
        <div class="feature-header">
          <span>🚗 Vehicle Trunk Match</span>
        </div>
        <div class="feature-desc">
          Matches donor surplus payload directly against compact sedan, hatchback, and SUV trunk capacities.
        </div>
      </div>

      <div class="feature-card">
        <div class="feature-header">
          <span>🛡️ 501(c)(3) Receipts</span>
        </div>
        <div class="feature-desc">
          Tamper-evident SHA-256 cryptographic logs verifying IRC § 170(e)(3) donor tax deduction compliance.
        </div>
      </div>
    </div>
  </div>

  <div class="footer-bar">
    <div>
      Verified on Live Production • <span class="highlight-pill">https://stemergent-hacks-2026.vercel.app</span>
    </div>
    <div>
      100% Open Source • TypeScript + Vite + Leaflet
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(500);

  const outPath = path.join('submission', 'assets', 'thumbnail.png');
  await page.screenshot({ path: outPath });
  console.log('Generated thumbnail at:', outPath);

  await browser.close();
}

generateThumbnail().catch(console.error);
