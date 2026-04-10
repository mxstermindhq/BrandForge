import type { ReactNode } from "react";

/** Fill `main` so the thread + rail meet the bottom edge; scroll stays inside the stream. */
export default function ChatThreadLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
}
