import type { Metadata } from "next";
import { Suspense } from "react";
import { Confirm } from "./confirm";

export const metadata: Metadata = {
  title: "Confirming",
  robots: { index: false, follow: false },
};

export default function ConfirmPage() {
  return (
    <Suspense>
      <Confirm />
    </Suspense>
  );
}
