import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { SignUpForm } from "./signup-form";
import "../signin/signin.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--t-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a BrandForge account and start your first client thread.",
};

export default function SignUpPage() {
  return (
    <div className={`signin-page ${bricolage.variable}`}>
      <SignUpForm />
    </div>
  );
}
