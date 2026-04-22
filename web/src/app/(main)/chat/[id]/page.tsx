import { WorkflowWorkspace } from "../_components/WorkflowWorkspace";

export default async function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkflowWorkspace threadId={id} />;
}
