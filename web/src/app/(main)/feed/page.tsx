import { permanentRedirect } from "next/navigation";

/** Feed removed — unified discovery lives on the marketplace. */
export default function FeedRedirect() {
  permanentRedirect("/marketplace");
}
