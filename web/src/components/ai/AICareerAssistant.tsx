"use client";

import { useState, useRef } from "react";
import { apiMutateJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { AuthWall } from "@/components/ui/AuthWall";
import { Sparkles, Send, User, Bot, Loader2, Lightbulb, TrendingUp, DollarSign, BookOpen } from "lucide-react";

interface CareerAdvice {
  id: string;
  question: string;
  advice: string;
  timestamp: string;
}

interface SuggestedQuestion {
  icon: React.ReactNode;
  text: string;
}

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { icon: <DollarSign className="w-4 h-4" />, text: "How should I price my services?" },
  { icon: <TrendingUp className="w-4 h-4" />, text: "How do I get more clients?" },
  { icon: <BookOpen className="w-4 h-4" />, text: "What skills should I learn next?" },
  { icon: <Lightbulb className="w-4 h-4" />, text: "How do I stand out from competitors?" },
];

export function AICareerAssistant() {
  const { session, accessToken } = useAuth();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<CareerAdvice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function askQuestion(question: string) {
    if (!question.trim()) return;

    // AuthWall handles the login UI for non-authenticated users
    if (!session) return;

    setIsLoading(true);
    setError(null);

    // Add user question immediately
    const userMessage: CareerAdvice = {
      id: `user-${Date.now()}`,
      question: question,
      advice: "",
      timestamp: new Date().toISOString(),
    };
    setConversations((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await apiMutateJson<{ advice: string }>(
        "/api/ai/career-advice",
        "POST",
        { question },
        accessToken
      );

      // Add AI response
      const aiMessage: CareerAdvice = {
        id: `ai-${Date.now()}`,
        question: question,
        advice: response.advice,
        timestamp: new Date().toISOString(),
      };
      setConversations((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get advice");
      // Remove the user message if AI failed
      setConversations((prev) => prev.filter((c) => c.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      // Scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    askQuestion(input);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI Career Assistant</span>
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-2">
          Get Expert Career Advice
        </h1>
        <p className="text-on-surface-variant max-w-lg mx-auto">
          Ask anything about pricing, client acquisition, skill development, or growing your freelance business.
        </p>
      </div>

      {/* Suggested Questions */}
      {conversations.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q.text}
              onClick={() => askQuestion(q.text)}
              className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant bg-surface-container hover:bg-surface-container-high transition text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {q.icon}
              </div>
              <span className="text-sm font-medium text-on-surface">{q.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat Area */}
      <div className="space-y-4 mb-6">
        {conversations.map((conv, index) => {
          const isUser = conv.id.startsWith("user-");
          const isAI = conv.id.startsWith("ai-");

          if (isUser) {
            return (
              <div key={conv.id} className="flex items-start gap-3 justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3">
                  <p className="text-on-primary text-sm">{conv.question}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-on-surface-variant" />
                </div>
              </div>
            );
          }

          if (isAI) {
            return (
              <div key={conv.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-surface-container border border-outline-variant px-4 py-3">
                  <p className="text-on-surface text-sm whitespace-pre-wrap">{conv.advice}</p>
                </div>
              </div>
            );
          }

          return null;
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-surface-container border border-outline-variant px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      {/* Input */}
      <AuthWall
        feature="AI Career Assistant"
        ctaText="Sign in to get career advice"
        preview={
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant">
            <p className="text-sm text-on-surface-variant text-center">
              Sign in to ask unlimited career questions and get personalized advice
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a career question..."
            className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-container border border-outline-variant text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center transition hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </AuthWall>

      {/* Footer */}
      <p className="text-center text-xs text-on-surface-variant/50 mt-4">
        AI-generated advice. Always use your judgment and consult professionals for critical decisions.
      </p>
    </div>
  );
}
