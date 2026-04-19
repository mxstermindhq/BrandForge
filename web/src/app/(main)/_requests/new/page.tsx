import type { Metadata } from "next";
import { NewRequestForm } from "./_components/NewRequestForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NewRequestPage() {
  return <NewRequestForm />;
}
