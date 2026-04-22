import { createClient } from "@/lib/supabase/server";

type ChatMessageRecord = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: unknown;
  created_at: string;
};

function parseWindow(searchParams: URLSearchParams) {
  const limitRaw = Number.parseInt(searchParams.get("limit") || "50", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 50;
  const before = searchParams.get("before");
  return { before, limit };
}

export async function listConversationMessages(
  conversationId: string,
  request: Request,
): Promise<{
  messages: ChatMessageRecord[];
  window: { hasMoreOlder: boolean; oldestId: string | null; newestId: string | null; limit: number };
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: conversation, error: convError } = await supabase
    .from("chat_threads")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (convError || !conversation) throw new Error("Conversation not found");

  const { searchParams } = new URL(request.url);
  const { before, limit } = parseWindow(searchParams);

  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (messagesError) throw new Error("Failed to fetch messages");

  let filteredMessages = (messages || []) as ChatMessageRecord[];
  if (before) {
    const beforeIndex = filteredMessages.findIndex((message) => message.id === before);
    if (beforeIndex > -1) filteredMessages = filteredMessages.slice(0, beforeIndex);
  }

  const hasMoreOlder = filteredMessages.length > limit;
  if (hasMoreOlder) filteredMessages = filteredMessages.slice(-limit);

  return {
    messages: filteredMessages,
    window: {
      hasMoreOlder,
      oldestId: filteredMessages[0]?.id || null,
      newestId: filteredMessages[filteredMessages.length - 1]?.id || null,
      limit,
    },
  };
}

export async function createConversationMessage(
  conversationId: string,
  body: { content?: unknown; role?: string },
): Promise<{ message: ChatMessageRecord }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: conversation, error: convError } = await supabase
    .from("chat_threads")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (convError || !conversation) throw new Error("Conversation not found");

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) throw new Error("Message content is required");

  const { data: message, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      role: body.role || "user",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !message) throw new Error("Failed to create message");

  await supabase
    .from("chat_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("user_id", user.id);

  return { message: message as ChatMessageRecord };
}
