import type { Metadata } from "next";
import { UserInbox } from "@/components/inbox/UserInbox";

export const metadata: Metadata = {
  title: "Inbox",
  description: "Your notifications, deal alerts, and AI-powered inbox summaries.",
};

export default function InboxPage() {
  return (
    <div className="page-root">
      <div className="page-content">
        <UserInbox />
      </div>
    </div>
  );
}
