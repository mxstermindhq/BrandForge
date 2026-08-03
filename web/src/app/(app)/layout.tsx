import type { Metadata } from "next";
import "./workspace.css";

export const metadata: Metadata = {
  title: {
    default: "BrandForge Workspace",
    template: "%s · BrandForge",
  },
  description: "Chat-first workspace for matched operators and clients.",
};

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="ws-root">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
      />
      {children}
    </div>
  );
}
