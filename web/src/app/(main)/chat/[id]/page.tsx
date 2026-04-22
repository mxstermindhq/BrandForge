import { SimpleChat } from "../_components/SimpleChat";

export default async function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SimpleChat threadId={id} />;
}
