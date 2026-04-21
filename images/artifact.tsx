// components/ChatWorkspace.tsx
import { useState, useRef, useEffect } from "react";
import {
  Bot, User, Send, Paperclip, Smile, Mic, Search, Plus,
  Pin, MoreHorizontal, Copy, RefreshCw, ThumbsUp, ThumbsDown,
  Sparkles, Share2, ChevronDown, PanelRight, X, Download,
  FileText, Code2, Image as ImageIcon, Mail, Phone, Building2,
  DollarSign, Calendar, Tag, ExternalLink, Eye, Check,
} from "lucide-react";

type Mode = "ai" | "human";

interface Message {
  id: string;
  role: "user" | "assistant" | "contact";
  content: string;
  timestamp: string;
  author?: { name: string; avatar?: string };
  status?: "sent" | "delivered" | "seen";
  artifacts?: Artifact[];
}

interface Artifact {
  id: string;
  type: "code" | "file" | "image";
  name: string;
  language?: string;
  size?: string;
  preview?: string;
  content?: string;
}

interface DealContext {
  company: string;
  stage: "Lead" | "Qualified" | "Proposal" | "Negotiation" | "Closed";
  value: string;
  closeDate: string;
  owner: string;
  tags: string[];
  email: string;
  phone: string;
  notes: string;
}

interface Conversation {
  id: string;
  mode: Mode;
  title: string;
  lastMessage?: string;
  timestamp: string;
  pinned?: boolean;
  unread?: number;
  online?: boolean;
  messages: Message[];
  deal?: DealContext;
}

// ——— Mock data ———
const mockConversations: Conversation[] = [
  {
    id: "ai-1", mode: "ai", title: "Marketing plan Q2",
    lastMessage: "Here's a draft outline…", timestamp: "10:42", pinned: true,
    messages: [
      { id: "m1", role: "user", content: "Draft a Q2 marketing plan for Gen Z.", timestamp: "10:40" },
      {
        id: "m2", role: "assistant",
        content: "Here's a draft outline:\n\n1. Audience insights\n2. Channel mix (TikTok, IG Reels)\n3. Creator partnerships\n4. Measurement framework",
        timestamp: "10:42",
        artifacts: [
          { id: "a1", type: "file", name: "Q2-marketing-plan.md", size: "4.2 KB", content: "# Q2 Marketing Plan\n\n## Audience\nGen Z, 18-24..." },
          { id: "a2", type: "code", name: "tracking.ts", language: "typescript", size: "1.1 KB", content: "export const track = (event: string) => {\n  analytics.log(event);\n};" },
        ],
      },
    ],
  },
  {
    id: "ai-2", mode: "ai", title: "Build error fix", lastMessage: "Regenerate lockfile…", timestamp: "09:15",
    messages: [
      { id: "m1", role: "user", content: "npm ci fails in CI", timestamp: "09:10" },
      {
        id: "m2", role: "assistant", content: "Run these commands:", timestamp: "09:15",
        artifacts: [
          { id: "a3", type: "code", name: "fix.sh", language: "bash", size: "0.3 KB", content: "rm -rf node_modules package-lock.json\nnpm install --include=optional\ngit add -f package-lock.json" },
        ],
      },
    ],
  },
  { id: "ai-3", mode: "ai", title: "Logo ideas", lastMessage: "Here are 5 concepts…", timestamp: "Yesterday", messages: [] },
  {
    id: "h-1", mode: "human", title: "Sarah Kim",
    lastMessage: "Sounds good, let's ship it", timestamp: "11:02",
    unread: 2, online: true,
    deal: {
      company: "Acme Corp", stage: "Proposal", value: "$48,000",
      closeDate: "May 15, 2026", owner: "You",
      tags: ["Enterprise", "Priority", "Q2"],
      email: "sarah@acme.com", phone: "+1 555 0142",
      notes: "Decision maker. Prefers async comms. Budget approved last week.",
    },
    messages: [
      { id: "m1", role: "contact", content: "Did you see the new designs?", timestamp: "10:58", author: { name: "Sarah Kim" } },
      { id: "m2", role: "user", content: "Yeah — love the toggle interaction", timestamp: "11:00", status: "seen" },
      { id: "m3", role: "contact", content: "Sounds good, let's ship it", timestamp: "11:02", author: { name: "Sarah Kim" } },
    ],
  },
  {
    id: "h-2", mode: "human", title: "Marcus Tan", lastMessage: "Thanks!", timestamp: "Yesterday",
    deal: {
      company: "Beta Studio", stage: "Qualified", value: "$12,500",
      closeDate: "Jun 1, 2026", owner: "You",
      tags: ["SMB"], email: "marcus@beta.io", phone: "+1 555 0199",
      notes: "Evaluating 3 vendors. Needs case study by next week.",
    },
    messages: [],
  },
  { id: "h-3", mode: "human", title: "Design team", lastMessage: "Meeting at 3", timestamp: "Yesterday", unread: 5, messages: [] },
];

export default function ChatWorkspace() {
  const [conversations, setConversations] = useState(mockConversations);
  const [activeId, setActiveId] = useState<string>("ai-1");
  const [mode, setMode] = useState<Mode>("ai");
  const [historyTab, setHistoryTab] = useState<Mode>("ai");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    if (active) {
      setMode(active.mode);
      setHistoryTab(active.mode);
    }
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length]);

  const sendMessage = () => {
    if (!input.trim() || !active) return;
    const newMsg: Message = {
      id: `m${Date.now()}`, role: "user", content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setConversations((prev) =>
      prev.map((c) => c.id === activeId ? { ...c, messages: [...c.messages, newMsg] } : c)
    );
    setInput("");

    if (mode === "ai") {
      setTimeout(() => {
        const reply: Message = {
          id: `m${Date.now() + 1}`, role: "assistant",
          content: "Got it — here's my take. (Hook to your model API.)",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setConversations((prev) =>
          prev.map((c) => c.id === activeId ? { ...c, messages: [...c.messages, reply] } : c)
        );
      }, 700);
    }
  };

  const newChat = (m: Mode) => {
    const id = `${m}-${Date.now()}`;
    const convo: Conversation = {
      id, mode: m,
      title: m === "ai" ? "New AI chat" : "New conversation",
      timestamp: "now", messages: [],
    };
    setConversations((prev) => [convo, ...prev]);
    setActiveId(id);
    setMode(m);
    setHistoryTab(m);
  };

  const filtered = conversations
    .filter((c) => c.mode === historyTab)
    .filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-screen w-full bg-zinc-50 text-zinc-900">
      {/* ——— Left Sidebar ——— */}
      <aside className="hidden md:flex w-60 flex-col border-r border-zinc-200 bg-white">
        <div className="p-4 border-b border-zinc-200">
          <div className="font-semibold">Workspace</div>
        </div>
        <nav className="flex-1 p-3 space-y-1 text-sm">
          {["Dashboard", "Chats", "Projects", "Settings"].map((item) => (
            <button key={item} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 text-zinc-700">
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* ——— Center: Chat ——— */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 bg-white">
          <ModeToggle mode={mode} onChange={(m) => {
            setMode(m);
            setHistoryTab(m);
            const firstOfMode = conversations.find((c) => c.mode === m);
            if (firstOfMode) setActiveId(firstOfMode.id);
          }} />
          <div className="flex items-center gap-3">
            <div className="text-sm text-zinc-500">
              {mode === "ai" ? (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> GPT-4 <ChevronDown className="w-3 h-3" />
                </span>
              ) : active?.online ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online
                </span>
              ) : (
                <span className="text-zinc-400">Offline</span>
              )}
            </div>
            <button
              onClick={() => setContextOpen(!contextOpen)}
              className={`p-2 rounded-lg transition ${
                contextOpen ? "bg-indigo-50 text-indigo-600" : "text-zinc-500 hover:bg-zinc-100"
              }`}
              title="Toggle context panel"
            >
              <PanelRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {!active || active.messages.length === 0 ? (
            <EmptyState mode={mode} onPrompt={(p) => setInput(p)} />
          ) : (
            active.messages.map((msg) => <MessageBubble key={msg.id} msg={msg} mode={mode} />)
          )}
        </div>

        <div className="border-t border-zinc-200 bg-white px-6 py-4">
          <div className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 focus-within:border-indigo-400 focus-within:bg-white transition px-3 py-2">
            <button className="p-2 text-zinc-500 hover:text-zinc-700 rounded-lg hover:bg-zinc-100">
              <Paperclip className="w-4 h-4" />
            </button>
            {mode === "human" && (
              <>
                <button className="p-2 text-zinc-500 hover:text-zinc-700 rounded-lg hover:bg-zinc-100">
                  <Smile className="w-4 h-4" />
                </button>
                <button className="p-2 text-zinc-500 hover:text-zinc-700 rounded-lg hover:bg-zinc-100">
                  <Mic className="w-4 h-4" />
                </button>
              </>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={mode === "ai" ? "Ask anything…" : "Type a message…"}
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm py-2 max-h-40"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-2 rounded-lg bg-indigo-600 text-white disabled:bg-zinc-300 hover:bg-indigo-700 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {mode === "ai" && (
            <div className="flex gap-2 mt-2 text-xs text-zinc-500">
              {["Summarize this", "Draft a reply", "Brainstorm ideas"].map((s) => (
                <button key={s} onClick={() => setInput(s)} className="px-2 py-1 rounded-md hover:bg-zinc-100">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ——— History Panel (tabbed) ——— */}
      <aside className="hidden lg:flex w-72 flex-col border-l border-zinc-200 bg-white">
        {/* Tab switcher */}
        <div className="px-3 pt-3">
          <div className="flex bg-zinc-100 rounded-lg p-1">
            <button
              onClick={() => setHistoryTab("ai")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                historyTab === "ai" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Bot className="w-4 h-4" /> AI
              <span className="text-xs text-zinc-400">
                {conversations.filter((c) => c.mode === "ai").length}
              </span>
            </button>
            <button
              onClick={() => setHistoryTab("human")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                historyTab === "human" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <User className="w-4 h-4" /> Human
              {conversations.filter((c) => c.mode === "human").reduce((s, c) => s + (c.unread || 0), 0) > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                  {conversations.filter((c) => c.mode === "human").reduce((s, c) => s + (c.unread || 0), 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-3 border-b border-zinc-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${historyTab === "ai" ? "AI chats" : "conversations"}…`}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-zinc-100 border-0 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <button
            onClick={() => newChat(historyTab)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" /> New {historyTab === "ai" ? "AI chat" : "conversation"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-400">
              No {historyTab === "ai" ? "AI chats" : "conversations"} found
            </div>
          ) : (
            <>
              {filtered.filter((c) => c.pinned).map((c) => (
                <ConvoItem key={c.id} convo={c} active={c.id === activeId} onClick={() => setActiveId(c.id)} />
              ))}
              {filtered.filter((c) => !c.pinned).map((c) => (
                <ConvoItem key={c.id} convo={c} active={c.id === activeId} onClick={() => setActiveId(c.id)} />
              ))}
            </>
          )}
        </div>
      </aside>

      {/* ——— Right Context Panel (collapsible) ——— */}
      {contextOpen && active && (
        <ContextPanel conversation={active} onClose={() => setContextOpen(false)} />
      )}
    </div>
  );
}

// ——— Context Panel ———
function ContextPanel({ conversation, onClose }: { conversation: Conversation; onClose: () => void }) {
  return (
    <aside className="w-80 flex flex-col border-l border-zinc-200 bg-white animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
        <div className="font-semibold text-sm">
          {conversation.mode === "ai" ? "Artifacts & Files" : "Deal Context"}
        </div>
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversation.mode === "ai" ? <AIContext conversation={conversation} /> : <HumanContext conversation={conversation} />}
      </div>
    </aside>
  );
}

function AIContext({ conversation }: { conversation: Conversation }) {
  const [tab, setTab] = useState<"artifacts" | "files" | "code">("artifacts");
  const allArtifacts = conversation.messages.flatMap((m) => m.artifacts || []);
  const files = allArtifacts.filter((a) => a.type === "file");
  const code = allArtifacts.filter((a) => a.type === "code");

  return (
    <div>
      <div className="flex border-b border-zinc-200">
        {[
          { id: "artifacts", label: "All", count: allArtifacts.length },
          { id: "code", label: "Code", count: code.length },
          { id: "files", label: "Files", count: files.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition border-b-2 ${
              tab === t.id ? "text-indigo-600 border-indigo-600" : "text-zinc-500 border-transparent hover:text-zinc-700"
            }`}
          >
            {t.label} <span className="text-zinc-400 ml-1">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="p-3 space-y-2">
        {(tab === "artifacts" ? allArtifacts : tab === "files" ? files : code).map((a) => (
          <ArtifactCard key={a.id} artifact={a} />
        ))}
        {allArtifacts.length === 0 && (
          <div className="text-center py-8 text-sm text-zinc-400">
            No artifacts yet. AI-generated files and code will appear here.
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-200">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Conversation</div>
        <div className="space-y-1.5 text-sm">
          <Row label="Messages" value={`${conversation.messages.length}`} />
          <Row label="Started" value={conversation.timestamp} />
          <Row label="Model" value="GPT-4" />
        </div>
        <button className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 transition">
          <Download className="w-4 h-4" /> Export chat
        </button>
      </div>
    </div>
  );
}

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const [preview, setPreview] = useState(false);
  const Icon = artifact.type === "code" ? Code2 : artifact.type === "image" ? ImageIcon : FileText;
  const colors = artifact.type === "code"
    ? "bg-violet-50 text-violet-600"
    : artifact.type === "image"
    ? "bg-emerald-50 text-emerald-600"
    : "bg-sky-50 text-sky-600";

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden hover:border-zinc-300 transition">
      <div className="flex items-center gap-2.5 p-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colors}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{artifact.name}</div>
          <div className="text-xs text-zinc-500">
            {artifact.language && <span className="uppercase mr-2">{artifact.language}</span>}
            {artifact.size}
          </div>
        </div>
        <div className="flex gap-0.5">
          <button onClick={() => setPreview(!preview)} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded" title="Preview">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded" title="Download">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {preview && artifact.content && (
        <div className="border-t border-zinc-200 bg-zinc-900 text-zinc-100 p-3 max-h-48 overflow-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap">{artifact.content}</pre>
        </div>
      )}
    </div>
  );
}

function HumanContext({ conversation }: { conversation: Conversation }) {
  const deal = conversation.deal;
  if (!deal) {
    return <div className="p-6 text-center text-sm text-zinc-400">No deal attached to this conversation.</div>;
  }

  const stageColors: Record<string, string> = {
    Lead: "bg-zinc-100 text-zinc-700",
    Qualified: "bg-blue-100 text-blue-700",
    Proposal: "bg-amber-100 text-amber-700",
    Negotiation: "bg-violet-100 text-violet-700",
    Closed: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="p-4 space-y-5">
      {/* Header card */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
          {conversation.title.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold">{conversation.title}</div>
          <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3" /> {deal.company}
          </div>
          <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${stageColors[deal.stage]}`}>
            {deal.stage}
          </span>
        </div>
      </div>

      {/* Deal stats */}
      <div className="grid grid-cols-2 gap-2">
        <Stat icon={<DollarSign className="w-3.5 h-3.5" />} label="Value" value={deal.value} />
        <Stat icon={<Calendar className="w-3.5 h-3.5" />} label="Close" value={deal.closeDate} />
      </div>

      {/* Contact */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Contact</div>
        <div className="space-y-1">
          <a href={`mailto:${deal.email}`} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-zinc-50 text-zinc-700">
            <Mail className="w-3.5 h-3.5 text-zinc-400" /> {deal.email}
            <ExternalLink className="w-3 h-3 text-zinc-400 ml-auto" />
          </a>
          <a href={`tel:${deal.phone}`} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-zinc-50 text-zinc-700">
            <Phone className="w-3.5 h-3.5 text-zinc-400" /> {deal.phone}
          </a>
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Tags</div>
        <div className="flex flex-wrap gap-1.5">
          {deal.tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-xs text-zinc-700">
              <Tag className="w-2.5 h-2.5" /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Notes</div>
        <div className="text-sm text-zinc-700 bg-amber-50 border border-amber-100 rounded-lg p-3 leading-relaxed">
          {deal.notes}
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-1.5">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 transition">
          <Sparkles className="w-4 h-4 text-indigo-600" /> Summarize conversation with AI
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 transition">
          <Check className="w-4 h-4 text-emerald-600" /> Log a task
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 transition">
          <ExternalLink className="w-4 h-4 text-zinc-500" /> Open in CRM
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-zinc-200 rounded-lg p-2.5">
      <div className="text-xs text-zinc-500 flex items-center gap-1 mb-0.5">{icon} {label}</div>
      <div className="text-sm font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-900 font-medium">{value}</span>
    </div>
  );
}

// ——— Reused components ———
function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="relative inline-flex items-center bg-zinc-100 rounded-xl p-1">
      <div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-200 ease-out"
        style={{ transform: mode === "ai" ? "translateX(100%)" : "translateX(0)" }}
      />
      <button
        onClick={() => onChange("human")}
        className={`relative z-10 flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
          mode === "human" ? "text-zinc-900" : "text-zinc-500"
        }`}
      >
        <User className="w-4 h-4" /> Human
      </button>
      <button
        onClick={() => onChange("ai")}
        className={`relative z-10 flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
          mode === "ai" ? "text-zinc-900" : "text-zinc-500"
        }`}
      >
        <Bot className="w-4 h-4" /> AI
      </button>
    </div>
  );
}

function MessageBubble({ msg, mode }: { msg: Message; mode: Mode }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%]">
          <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">{msg.content}</div>
          <div className="flex justify-end items-center gap-1 mt-1 text-xs text-zinc-400">
            {msg.timestamp}
            {msg.status === "seen" && <span>· Seen</span>}
          </div>
        </div>
      </div>
    );
  }

  const isAI = msg.role === "assistant";
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isAI ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white" : "bg-zinc-200 text-zinc-700"
      }`}>
        {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div className="max-w-[70%]">
        {msg.author && (
          <div className="text-xs font-medium text-zinc-600 mb-1">
            {msg.author.name} <span className="text-zinc-400 font-normal ml-1">{msg.timestamp}</span>
          </div>
        )}
        <div className={`rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm whitespace-pre-wrap ${
          isAI ? "bg-zinc-100 text-zinc-900" : "bg-white border border-zinc-200 text-zinc-900"
        }`}>
          {msg.content}
        </div>
        {msg.artifacts && msg.artifacts.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {msg.artifacts.map((a) => (
              <div key={a.id} className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-zinc-200 rounded-lg bg-white text-xs hover:border-indigo-300 transition cursor-pointer">
                {a.type === "code" ? <Code2 className="w-3.5 h-3.5 text-violet-600" /> : <FileText className="w-3.5 h-3.5 text-sky-600" />}
                <span className="font-medium">{a.name}</span>
                <span className="text-zinc-400">{a.size}</span>
                <Download className="w-3 h-3 text-zinc-400" />
              </div>
            ))}
          </div>
        )}
        {isAI && (
          <div className="flex items-center gap-1 mt-1.5 text-zinc-400">
            <button className="p-1 hover:text-zinc-700 hover:bg-zinc-100 rounded"><Copy className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:text-zinc-700 hover:bg-zinc-100 rounded"><RefreshCw className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:text-zinc-700 hover:bg-zinc-100 rounded"><ThumbsUp className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:text-zinc-700 hover:bg-zinc-100 rounded"><ThumbsDown className="w-3.5 h-3.5" /></button>
            <button className="ml-2 flex items-center gap-1 px-2 py-1 text-xs hover:text-indigo-600 hover:bg-indigo-50 rounded">
              <Share2 className="w-3 h-3" /> Share with human
            </button>
          </div>
        )}
        {!isAI && mode === "human" && (
          <button className="mt-1.5 flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded">
            <Sparkles className="w-3 h-3" /> Ask AI about this
          </button>
        )}
      </div>
    </div>
  );
}

function ConvoItem({ convo, active, onClick }: { convo: Conversation; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-zinc-50 transition ${
        active ? "bg-indigo-50 hover:bg-indigo-50" : ""
      }`}
    >
      {convo.mode === "human" ? (
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center text-xs font-medium text-white">
            {convo.title.charAt(0)}
          </div>
          {convo.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
          {convo.pinned ? <Pin className="w-3.5 h-3.5 text-indigo-600" /> : <Bot className="w-4 h-4 text-zinc-500" />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm truncate ${active ? "text-indigo-900 font-medium" : "text-zinc-800"}`}>{convo.title}</span>
          <span className="text-xs text-zinc-400 flex-shrink-0 ml-2">{convo.timestamp}</span>
        </div>
        {convo.lastMessage && <div className="text-xs text-zinc-500 truncate">{convo.lastMessage}</div>}
      </div>
      {convo.unread ? (
        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-600 text-white text-xs font-medium flex items-center justify-center">
          {convo.unread}
        </span>
      ) : (
        <button className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-700 rounded">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      )}
    </button>
  );
}

function EmptyState({ mode, onPrompt }: { mode: Mode; onPrompt: (p: string) => void }) {
  if (mode === "ai") {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold">How can I help today?</h2>
        <p className="text-sm text-zinc-500 mt-1">Ask anything or pick a starting point.</p>
        <div className="grid grid-cols-2 gap-2 mt-6 max-w-md w-full">
          {["Draft a marketing email", "Summarize a document", "Brainstorm product names", "Explain a concept"].map((p) => (
            <button key={p} onClick={() => onPrompt(p)} className="px-4 py-3 text-sm text-left border border-zinc-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition">
              {p}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
        <User className="w-8 h-8 text-zinc-500" />
      </div>
      <h2 className="text-xl font-semibold">Start a conversation</h2>
      <p className="text-sm text-zinc-500 mt-1">Pick someone from the right panel or start a new chat.</p>
    </div>
  );
}
