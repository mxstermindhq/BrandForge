import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function MessageThreadDeprecatedRedirect({ params }: { params: { id: string } }) {
  permanentRedirect(`/chat/${params.id}`);
}
