import { NextResponse } from "next/server";
import { createConversationMessage, listConversationMessages } from "@/app/api/chat/_lib/messages";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const result = await listConversationMessages(id, request);
    return NextResponse.json({
      thread: { id },
      messages: result.messages,
      hasMoreOlder: result.window.hasMoreOlder,
      oldestId: result.window.oldestId,
      newestId: result.window.newestId,
      limit: result.window.limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch messages";
    const status = message === "Unauthorized" ? 401 : message === "Conversation not found" ? 404 : 500;
    if (status === 500) console.error("Failed to fetch thread messages:", error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const result = await createConversationMessage(id, body);
    return NextResponse.json({ message: result.message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create message";
    const status =
      message === "Unauthorized" ? 401 :
      message === "Conversation not found" ? 404 :
      message === "Message content is required" ? 400 :
      500;
    if (status === 500) console.error("Failed to create message:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
