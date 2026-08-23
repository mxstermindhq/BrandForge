import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ForgotPasswordForm } from "./forgot-password-form";
import "../signin/signin.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--t-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reset password",
  description: "Request a password reset link for your BrandForge account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className={`signin-page ${bricolage.variable}`}>
      <ForgotPasswordForm />
    </div>
  );
}
