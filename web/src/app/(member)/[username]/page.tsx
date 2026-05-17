import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicMemberProfile } from "./_components/PublicMemberProfile";
import { fetchPublicProfileForMetadata } from "@/lib/metadata-api";
import { getCuratedOperatorByUsername } from "@/content/curated-operators";
import { isReservedUsername } from "@/lib/reserved-paths";

function decodeUsername(seg: string): string {
  try {
    return decodeURIComponent(seg).replace(/^@+/, "").toLowerCase();
  } catch {
    return seg;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username: raw } = await params;
  const username = decodeUsername(raw);
  if (isReservedUsername(username)) {
    return { title: "Not found" };
  }
  const curated = getCuratedOperatorByUsername(username);
  if (curated) {
    const url = `https://brandforge.gg/${encodeURIComponent(username)}`;
    return {
      title: `${curated.name} — ${curated.role}`,
      description: curated.bio.slice(0, 160),
      alternates: { canonical: url },
      openGraph: {
        type: "profile",
        url,
        title: curated.name,
        description: curated.bio.slice(0, 200),
        images: [{ url: `/api/og/user/${encodeURIComponent(username)}`, width: 1200, height: 630 }],
      },
    };
  }
  const profile = await fetchPublicProfileForMetadata(username);
  if (!profile) {
    return { title: "Profile not found · BrandForge", robots: { index: false } };
  }
  const name = profile.full_name || profile.username || username;
  const url = `https://brandforge.gg/${encodeURIComponent(username)}`;
  return {
    title: `${name} — ${profile.headline || "BrandForge"}`,
    description: profile.bio?.slice(0, 160) || `${name} on BrandForge`,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      title: name,
      description: profile.bio?.slice(0, 200) || undefined,
      images: [{ url: `/api/og/user/${encodeURIComponent(username)}`, width: 1200, height: 630 }],
    },
  };
}

export default async function MemberProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: raw } = await params;
  const username = decodeUsername(raw);
  if (isReservedUsername(username)) notFound();
  return <PublicMemberProfile username={username} />;
}
