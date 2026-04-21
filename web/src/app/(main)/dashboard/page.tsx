import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Dashboard is now the Deal Room — redirect to chat
  redirect("/chat");
}
