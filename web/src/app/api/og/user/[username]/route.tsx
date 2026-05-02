import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { metadataApiBase } from "@/lib/metadata-api";

interface ProfileData {
  full_name?: string;
  username?: string;
  bio?: string;
  tier?: string;
  avatar_url?: string;
  deals_count?: number;
  rating?: number;
  skills?: string[];
  on_time_rate?: number;
}

async function fetchProfileData(username: string): Promise<ProfileData | null> {
  try {
    const base = metadataApiBase();
    const res = await fetch(`${base}/api/profiles/${encodeURIComponent(username)}/public`, {
      next: { revalidate: 300 }, // 5 min cache
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile ?? null;
  } catch {
    return null;
  }
}

function getTierBadgeColor(tier?: string): string {
  switch (tier?.toLowerCase()) {
    case "elite":
      return "#FFD700"; // Gold
    case "pro":
      return "#C0C0C0"; // Silver
    case "expert":
      return "#CD7F32"; // Bronze
    default:
      return "#64748b"; // Slate
  }
}

function getTierEmoji(tier?: string): string {
  switch (tier?.toLowerCase()) {
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
  const profile = await fetchProfileData(username);

  // Default values if profile not found
  const displayName = profile?.full_name || profile?.username || username;
  const tier = profile?.tier || "Specialist";
  const tierColor = getTierBadgeColor(tier);
  const tierEmoji = getTierEmoji(tier);
  const dealsCount = profile?.deals_count || 0;
  const rating = profile?.rating || 0;
  const skills = profile?.skills?.slice(0, 4) || [];
  const onTimeRate = profile?.on_time_rate || 0;

  // Brand colors
  const brandPrimary = "#0f172a"; // Slate 900
  const brandAccent = "#3b82f6"; // Blue 500
  const textPrimary = "#f8fafc"; // Slate 50
  const textSecondary = "#94a3b8"; // Slate 400

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          background: `linear-gradient(135deg, ${brandPrimary} 0%, #1e293b 50%, #0f172a 100%)`,
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Header with logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${brandAccent}, #8b5cf6)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "700",
                color: "white",
              }}
            >
              B
            </div>
            <span
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: textPrimary,
                letterSpacing: "-0.02em",
              }}
            >
              BrandForge
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.1)",
              padding: "12px 20px",
              borderRadius: "9999px",
              border: `2px solid ${tierColor}`,
            }}
          >
            <span style={{ fontSize: "24px" }}>{tierEmoji}</span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: tierColor,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {tier}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flex: 1, gap: "40px" }}>
          {/* Left: Avatar and name */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                width={160}
                height={160}
                style={{
                  borderRadius: "24px",
                  objectFit: "cover",
                  border: "4px solid rgba(255,255,255,0.2)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "24px",
                  background: `linear-gradient(135deg, ${brandAccent}, #8b5cf6)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "64px",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: "20px",
            }}
          >
            <h1
              style={{
                fontSize: "56px",
                fontWeight: "700",
                color: textPrimary,
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {displayName}
            </h1>

            {profile?.bio && (
              <p
                style={{
                  fontSize: "24px",
                  color: textSecondary,
                  margin: 0,
                  lineHeight: 1.4,
                  maxWidth: "600px",
                }}
              >
                {profile.bio.slice(0, 100)}
                {profile.bio.length > 100 ? "..." : ""}
              </p>
            )}

            {/* Stats */}
            <div style={{ display: "flex", gap: "32px", marginTop: "8px" }}>
              {dealsCount > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "28px", fontWeight: "700", color: textPrimary }}>
                    {dealsCount}
                  </span>
                  <span style={{ fontSize: "18px", color: textSecondary }}>
                    deals closed
                  </span>
                </div>
              )}
              {rating > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "28px", fontWeight: "700", color: "#fbbf24" }}>
                    ★ {rating.toFixed(1)}
                  </span>
                  <span style={{ fontSize: "18px", color: textSecondary }}>rating</span>
                </div>
              )}
              {onTimeRate > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "28px", fontWeight: "700", color: "#22c55e" }}>
                    {onTimeRate}%
                  </span>
                  <span style={{ fontSize: "18px", color: textSecondary }}>on time</span>
                </div>
              )}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: textPrimary,
                      background: "rgba(255,255,255,0.1)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ fontSize: "18px", color: textSecondary }}>
            Verified via BrandForge escrow
          </span>
          <span style={{ fontSize: "18px", color: brandAccent, fontWeight: "600" }}>
            brandforge.gg/u/{username}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
