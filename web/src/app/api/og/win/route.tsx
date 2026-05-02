import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

/**
 * OG Image for "Share a Win" - Deal completion cards
 * Query params:
 * - name: Specialist name
 * - tier: Tier badge (Elite, Pro, Expert, etc.)
 * - service: Service delivered title
 * - rating: Rating received (1-5)
 * - verified: Show "Verified via BrandForge escrow"
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get("name") || "Specialist";
  const tier = searchParams.get("tier") || "Specialist";
  const service = searchParams.get("service") || "Project Delivered";
  const rating = parseFloat(searchParams.get("rating") || "5");
  const verified = searchParams.get("verified") !== "false";

  // Colors
  const bgGradient = "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)";
  const gold = "#FFD700";
  const silver = "#C0C0C0";
  const bronze = "#CD7F32";
  const textPrimary = "#f8fafc";
  const textSecondary = "#94a3b8";

  function getTierColor(t: string): string {
    switch (t.toLowerCase()) {
      case "elite":
        return gold;
      case "pro":
        return silver;
      case "expert":
        return bronze;
      default:
        return "#64748b";
    }
  }

  function getTierEmoji(t: string): string {
    switch (t.toLowerCase()) {
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

  const tierColor = getTierColor(tier);
  const tierEmoji = getTierEmoji(tier);
  const stars = "★".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "½" : "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          background: bgGradient,
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 40%)",
          }}
        />

        {/* Confetti effect (static dots) */}
        <div style={{ position: "absolute", top: 40, right: 80, fontSize: "40px", opacity: 0.8 }}>🎉</div>
        <div style={{ position: "absolute", top: 100, right: 150, fontSize: "30px", opacity: 0.6 }}>✨</div>
        <div style={{ position: "absolute", bottom: 120, left: 80, fontSize: "35px", opacity: 0.7 }}>🚀</div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "48px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "700",
              color: "white",
            }}
          >
            B
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            BrandForge
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            zIndex: 1,
            gap: "24px",
          }}
        >
          {/* Win badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(255, 215, 0, 0.15)",
              padding: "16px 28px",
              borderRadius: "9999px",
              alignSelf: "flex-start",
              border: "2px solid rgba(255, 215, 0, 0.3)",
            }}
          >
            <span style={{ fontSize: "32px" }}>🏆</span>
            <span
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: gold,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Deal Complete
            </span>
          </div>

          {/* Specialist info */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "8px" }}>
            <h1
              style={{
                fontSize: "64px",
                fontWeight: "800",
                color: textPrimary,
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {name}
            </h1>
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
              <span style={{ fontSize: "28px" }}>{tierEmoji}</span>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: tierColor,
                  textTransform: "uppercase",
                }}
              >
                {tier}
              </span>
            </div>
          </div>

          {/* Service delivered */}
          <p
            style={{
              fontSize: "32px",
              color: textSecondary,
              margin: 0,
              lineHeight: 1.4,
              maxWidth: "900px",
            }}
          >
            Delivered: <span style={{ color: textPrimary, fontWeight: "600" }}>{service}</span>
          </p>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" }}>
            <span
              style={{
                fontSize: "48px",
                color: "#fbbf24",
                letterSpacing: "4px",
              }}
            >
              {stars}
            </span>
            <span
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: textPrimary,
              }}
            >
              {rating.toFixed(1)}
            </span>
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
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {verified && (
              <>
                <span style={{ fontSize: "24px" }}>✅</span>
                <span style={{ fontSize: "20px", color: textSecondary, fontWeight: "500" }}>
                  Verified via BrandForge escrow
                </span>
              </>
            )}
          </div>
          <span style={{ fontSize: "20px", color: "#3b82f6", fontWeight: "600" }}>
            brandforge.gg
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
