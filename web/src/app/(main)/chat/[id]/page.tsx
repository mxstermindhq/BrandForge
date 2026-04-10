import { ChatThreadClient } from "./_components/ChatThreadClient";

export default function ChatThreadPage({ params }: { params: { id: string } }) {
  return <ChatThreadClient id={params.id} />;
}
