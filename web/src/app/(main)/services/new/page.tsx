import type { Metadata } from "next";
import { NewServiceForm } from "@/app/(main)/_services/new/_components/NewServiceForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NewServicePage() {
  return (
    <div className="px-4 py-6 md:px-8">
      <NewServiceForm />
    </div>
  );
}
