import { AppShell } from "@/components/app/AppShell";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <AppShell>{children}</AppShell>;
}
