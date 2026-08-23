import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ResetPasswordForm } from "./reset-password-form";
import "../signin/signin.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--t-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Set new password",
  description: "Choose a new password for your BrandForge account.",
};

export default function ResetPasswordPage() {
  return (
    <div className={`signin-page ${bricolage.variable}`}>
      <ResetPasswordForm />
    </div>
  );
}
