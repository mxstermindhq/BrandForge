import { ChatThreadClient } from "./_components/ChatThreadClient";

export default async function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatThreadClient id={id} />;
}
