import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="font-display text-2xl text-gold">
        ⬡ LeadForge
      </Link>
      <div className="mt-8 w-full max-w-sm">{children}</div>
    </div>
  );
}
