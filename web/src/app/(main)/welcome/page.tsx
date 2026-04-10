import type { Metadata } from "next";
import { WelcomeClient } from "./_components/WelcomeClient";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  return <WelcomeClient />;
}
