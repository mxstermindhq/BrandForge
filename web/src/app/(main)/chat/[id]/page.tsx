import { DealThreadClient } from "./_components/DealThreadClient";

export default async function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DealThreadClient threadId={id} />;
}
