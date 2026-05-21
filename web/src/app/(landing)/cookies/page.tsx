import type { Metadata } from "next";
import { ForgePage } from "@/components/forge/ForgePage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "BrandForge cookie policy",
};

export default function CookiesPage() {
  return (
    <ForgePage title="Cookie Policy" eyebrow="Legal" narrow>
      <div className="forge-prose">
        <p>Last updated: May 2026</p>
        <h2>What are cookies</h2>
        <p>
          Cookies are small text files stored on your device when you visit brandforge.gg. We use them to keep you
          signed in, remember preferences, and measure how the forge is used.
        </p>
        <h2>How we use cookies</h2>
        <p>
          Essential cookies power authentication and security. Analytics cookies (when enabled) help us improve
          marketplace discovery and performance.
        </p>
        <h2>Managing cookies</h2>
        <p>You can block or delete cookies in your browser settings. Some forge features may not work without them.</p>
      </div>
    </ForgePage>
  );
}
