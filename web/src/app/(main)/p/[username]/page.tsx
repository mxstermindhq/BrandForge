import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { fetchPublicProfileForMetadata, metadataApiBase } from "@/lib/metadata-api";

function decodeUsername(seg: string) {
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

// Verify profile exists before redirect
async function verifyProfile(username: string): Promise<boolean> {
  try {
    const base = metadataApiBase();
    const res = await fetch(`${base}/api/profiles/${encodeURIComponent(username)}/public`, {
      next: { revalidate: 60 },
    });
    return res.ok;
  } catch {
    return false;
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

  const display = profile.full_name || profile.username || username;
  const canonicalUrl = `https://brandforge.gg/u/${encodeURIComponent(username)}`;

  // This metadata is for the redirect page - it tells crawlers where to go
  return {
    title: `${display} · BrandForge`,
    description: `${display} on BrandForge — ${profile.bio?.slice(0, 120) || "Professional services and deal rooms"}`,
    alternates: {
      canonical: canonicalUrl,
    },
    // Tell bots this page redirects permanently
    other: {
      "http-equiv": "refresh",
      content: `0; url=${canonicalUrl}`,
    },
    // Don't index the legacy URL
    robots: {
      index: false,
      follow: true,
      nocache: true,
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = await params;
  const username = decodeUsername(raw);

  // Verify profile exists first
  const exists = await verifyProfile(username);
  if (!exists) {
    notFound();
  }

  // Permanent redirect to canonical /u/ URL
  redirect(`/u/${encodeURIComponent(username)}`);
}
