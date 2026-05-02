import { NextRequest } from "next/server";
import { metadataApiBase } from "@/lib/metadata-api";

interface ChronicleEmbedData {
  full_name: string;
  username: string;
  tier: string;
  avatar_url?: string;
  rating: number;
  deals_closed: number;
  skills: string[];
  verified: boolean;
}

async function fetchEmbedData(username: string): Promise<ChronicleEmbedData | null> {
  try {
    const base = metadataApiBase();
    const res = await fetch(`${base}/api/chronicle/${encodeURIComponent(username)}/embed`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function getTierColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case "elite":
      return "#FFD700";
    case "pro":
      return "#C0C0C0";
    case "expert":
      return "#CD7F32";
    default:
      return "#64748b";
  }
}

function getTierEmoji(tier: string): string {
  switch (tier.toLowerCase()) {
    case "elite":
      return "👑";
    case "pro":
      return "⭐";
    case "expert":
      return "🎯";
    default:
      return "🔷";
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const data = await fetchEmbedData(username);

  if (!data) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <body style="font-family: system-ui; text-align: center; padding: 20px; color: #666;">
          Profile not found
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html" },
        status: 404,
      }
    );
  }

  const tierColor = getTierColor(data.tier);
  const tierEmoji = getTierEmoji(data.tier);
  const stars = "★".repeat(Math.floor(data.rating)) + (data.rating % 1 >= 0.5 ? "½" : "");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.full_name} — BrandForge</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .widget {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      max-width: 400px;
      width: 100%;
      color: #f8fafc;
      position: relative;
      overflow: hidden;
    }
    .widget::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: ${tierColor};
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.2);
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 600;
    }
    .avatar img {
      width: 100%;
      height: 100%;
      border-radius: 10px;
      object-fit: cover;
    }
    .info {
      flex: 1;
      min-width: 0;
    }
    .name {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tier {
      font-size: 12px;
      color: ${tierColor};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .verified {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #22c55e;
      margin-top: 4px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .stat {
      text-align: center;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }
    .stat-value {
      font-size: 20px;
      font-weight: 600;
      color: #f8fafc;
    }
    .stat-label {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;
    }
    .skill {
      font-size: 11px;
      padding: 4px 10px;
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border-radius: 4px;
    }
    .cta {
      display: block;
      text-align: center;
      padding: 12px 20px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: opacity 0.2s;
    }
    .cta:hover {
      opacity: 0.9;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;
      font-size: 12px;
      color: #64748b;
    }
    .brand-logo {
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
    }
    @media (max-width: 480px) {
      .widget { padding: 20px; }
      .avatar { width: 56px; height: 56px; }
      .name { font-size: 18px; }
    }
  </style>
</head>
<body>
  <div class="widget">
    <div class="header">
      <div class="avatar">
        ${data.avatar_url ? `<img src="${data.avatar_url}" alt="${data.full_name}" />` : data.full_name.charAt(0).toUpperCase()}
      </div>
      <div class="info">
        <div class="name">
          ${data.full_name}
          <span>${tierEmoji}</span>
        </div>
        <div class="tier">${data.tier} Specialist</div>
        ${data.verified ? `<div class="verified">✅ Verified via escrow</div>` : ""}
      </div>
    </div>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${data.deals_closed}</div>
        <div class="stat-label">Deals Closed</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: #fbbf24;">${data.rating.toFixed(1)}★</div>
        <div class="stat-label">Rating</div>
      </div>
      <div class="stat">
        <div class="stat-value">${data.skills.length}</div>
        <div class="stat-label">Skills</div>
      </div>
    </div>
    
    <div class="skills">
      ${data.skills.slice(0, 5).map((skill) => `<span class="skill">${skill}</span>`).join("")}
    </div>
    
    <a href="https://brandforge.gg/u/${encodeURIComponent(data.username)}" target="_blank" class="cta">
      Hire Me on BrandForge →
    </a>
    
    <div class="brand">
      <div class="brand-logo">B</div>
      <span>BrandForge — Verified Professional Services</span>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "X-Frame-Options": "ALLOWALL", // Allow embedding in iframes
      "Content-Security-Policy": "frame-ancestors *", // Allow any site to embed
    },
  });
}
