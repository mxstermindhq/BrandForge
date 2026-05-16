import { redirect, notFound } from "next/navigation";
import { fetchPublicProfileForMetadata } from "@/lib/metadata-api";

function decodeUsername(seg: string): string {
  try {
    return decodeURIComponent(seg).replace(/^@+/, "");
  } catch {
    return seg;
  }
}

/** Legacy /u/:username — canonical profile is /:username */
export default async function LegacyUserProfileRedirect({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = await params;
  const username = decodeUsername(raw);
  const profile = await fetchPublicProfileForMetadata(username);
  if (!profile) notFound();
  redirect(`/${encodeURIComponent(username)}`);
}
