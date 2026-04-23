import type { Metadata } from "next";
import { NewRequestForm } from "@/app/(main)/_requests/new/_components/NewRequestForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NewRequestPage() {
  return <NewRequestForm />;
}
