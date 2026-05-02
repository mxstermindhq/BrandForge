import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileClient } from "../../p/[username]/_components/PublicProfileClient";
import { JsonLdScript } from "@/components/JsonLdScript";
import { fetchPublicProfileForMetadata, metadataApiBase } from "@/lib/metadata-api";
import { generateProfilePageJsonLd, generateBreadcrumbJsonLd } from "@/lib/jsonld";

interface ChronicleProfile {
  id?: string;
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  headline?: string | null;
  avatar_url?: string | null;
  tier?: string | null;
  skills?: string[] | null;
  deals_count?: number | null;
  rating?: number | null;
  on_time_rate?: number | null;
  completed_projects_count?: number | null;
  kyc_status?: string | null;
  is_verified?: boolean | null;
  location?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  twitter_handle?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  availability?: string | null;
  languages?: string[] | null;
  categories?: string[] | null;
}

interface ChronicleResponse {
  profile: ChronicleProfile;
  stats: {
    deals_closed: number;
    total_earned: number;
    avg_rating: number;
    on_time_rate: number;
    verified_skills: string[];
    endorsements_count: number;
  };
  portfolio: Array<{
    id: string;
    title: string;
    description?: string;
    category?: string;
    client_verified: boolean;
    thumbnail_url?: string;
  }>;
  recent_deals: Array<{
    id: string;
    title: string;
    category: string;
    completed_at: string;
    rating?: number;
  }>;
}

function decodeUsername(seg: string): string {
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

async function fetchChronicleProfile(username: string): Promise<ChronicleResponse | null> {
  try {
    const base = metadataApiBase();
    const res = await fetch(`${base}/api/chronicle/${encodeURIComponent(username)}`, {
      next: { revalidate: 300 }, // 5 min cache for SEO
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username: raw } = await params;
  const username = decodeUsername(raw);
  const profile = await fetchPublicProfileForMetadata(username);

  if (!profile) {
    return {
      title: "Profile Not Found · BrandForge",
      description: "This profile could not be found on BrandForge.",
      robots: { index: false, follow: false },
    };
  }

  const displayName = profile.full_name || profile.username || username;
  const bio = profile.bio?.trim() || "Professional services and deal rooms on BrandForge.";
  const url = `https://brandforge.gg/u/${encodeURIComponent(username)}`;
  const ogImageUrl = `https://brandforge.gg/api/og/user/${encodeURIComponent(username)}`;

  // Build a rich description with stats if available
  let enhancedDescription = bio;
  if (profile.deals_count && profile.rating) {
    enhancedDescription = `${displayName} — ${profile.deals_count} deals closed · ${profile.rating.toFixed(1)}★ rating · ${bio.slice(0, 100)}`;
  }

  return {
    title: `${displayName} · ${profile.tier || "Specialist"} on BrandForge`,
    description: enhancedDescription.slice(0, 160),
    keywords: [
      displayName,
      "BrandForge",
      "specialist",
      "freelancer",
      "portfolio",
      "professional services",
      ...(profile.skills || []),
    ].filter(Boolean),
    authors: [{ name: displayName, url }],
    creator: displayName,
    metadataBase: new URL("https://brandforge.gg"),
    alternates: {
      canonical: url,
      // Legacy URL that redirects here
      types: {
        "application/rss+xml": `${url}/feed`,
      },
    },
    openGraph: {
      type: "profile",
      url,
      siteName: "BrandForge",
      title: `${displayName} — ${profile.tier || "Specialist"} on BrandForge`,
      description: enhancedDescription.slice(0, 200),
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName} — BrandForge Profile`,
        },
      ],
      locale: "en_US",
      // Profile-specific OG tags
      firstName: displayName.split(" ")[0],
      lastName: displayName.split(" ").slice(1).join(" ") || undefined,
      username: profile.username || username,
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} — ${profile.tier || "Specialist"} on BrandForge`,
      description: enhancedDescription.slice(0, 200),
      images: [ogImageUrl],
      creator: profile.twitter_handle ? `@${profile.twitter_handle}` : "@BrandForge_gg",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    // Structured data will be added via JsonLdScript component
  };
}

export default async function ChroniclePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = await params;
  const username = decodeUsername(raw);

  // Fetch both metadata profile and full chronicle data
  const [profileMeta, chronicle] = await Promise.all([
    fetchPublicProfileForMetadata(username),
    fetchChronicleProfile(username),
  ]);

  if (!profileMeta && !chronicle) {
    notFound();
  }

  const profile = chronicle?.profile || (profileMeta as ChronicleProfile);
  const stats = chronicle?.stats;
  const url = `https://brandforge.gg/u/${encodeURIComponent(username)}`;

  // Generate JSON-LD structured data
  const jsonLdData = [
    generateProfilePageJsonLd({
      name: profile.full_name || username,
      username: profile.username || username,
      bio: profile.bio || undefined,
      avatarUrl: profile.avatar_url || undefined,
      skills: profile.skills || undefined,
      tier: profile.tier || undefined,
      updatedAt: profile.updated_at || undefined,
    }),
    generateBreadcrumbJsonLd([
      { name: "Home", url: "https://brandforge.gg" },
      { name: "Marketplace", url: "https://brandforge.gg/marketplace" },
      { name: profile.full_name || username, url },
    ]),
  ];

  return (
    <>
      <JsonLdScript data={jsonLdData} />
      <PublicProfileClient username={username} />
    </>
  );
}
