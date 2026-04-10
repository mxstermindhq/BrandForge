import type { Metadata } from "next";
import { PublicProfileClient } from "./_components/PublicProfileClient";
import {
  fetchPublicProfileForMetadata,
} from "@/lib/metadata-api";

function decodeUsername(seg: string) {
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const username = decodeUsername(params.username);
  const profile = await fetchPublicProfileForMetadata(username);
  const display = profile?.full_name || profile?.username || username;
  const bio = profile?.bio?.trim() || "Professional services and deal rooms.";
  const ogImages = profile?.avatar_url
    ? [{ url: profile.avatar_url }]
    : [{ url: "/og-image.png" }];
  return {
    title: display,
    description: `${display} on BrandForge — ${bio}`,
    openGraph: {
      url: `https://brandforge.gg/p/${encodeURIComponent(username)}`,
      images: ogImages,
    },
  };
}

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  return <PublicProfileClient username={decodeUsername(params.username)} />;
}
