"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { apiMutateJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { StudioAgentPanel } from "./StudioAgentPanel";
import { StudioBottomToolbar } from "./StudioBottomToolbar";
import { StudioCanvas } from "./StudioCanvas";
import { StudioCopilotHud } from "./StudioCopilotHud";

const models = ["mxAI Turbo", "mxAI Pro", "Hybrid"];

export function StudioWorkspace() {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [model] = useState(models[0]);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const agentsRef = useRef<HTMLDivElement | null>(null);

  const getToken = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  const focusCanvas = () => canvasRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusAgents = () => agentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  async function deploy() {
    const description = brief.trim();
    if (!description) {
      setBanner("Add a brief on the canvas before deploy.");
      focusCanvas();
      return;
    }
    setBanner(null);
    setSubmitting(true);
    try {
      const t = await getToken();
      if (!t) throw new Error("Sign in required.");
      await apiMutateJson<unknown>("/api/agent-runs", "POST", { description, model }, t);
      router.push("/ai/agents");
      router.refresh();
    } catch (e) {
      setBanner(e instanceof Error ? e.message : "Deploy failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-7rem)] flex-col">
      <header className="border-outline-variant/15 shrink-0 border-b px-4 py-5 md:px-6">
        <h1 className="font-display text-on-surface text-2xl font-bold tracking-tight md:text-3xl">Creator Studio</h1>
        <p className="text-on-surface-variant mt-2 max-w-2xl text-sm font-light leading-relaxed">
          Refined workspace: agents, canvas, and co-pilot HUD. Deploy still posts to{" "}
          <code className="text-secondary/80 text-xs">POST /api/agent-runs</code>.
        </p>
        {banner ? <p className="text-error mt-3 text-sm">{banner}</p> : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div ref={agentsRef} className="shrink-0">
          <StudioAgentPanel />
        </div>
        <div ref={canvasRef} className="flex min-h-0 min-w-0 flex-1 flex-col">
          <StudioCanvas brief={brief} onBriefChange={setBrief} />
        </div>
        <StudioCopilotHud />
      </div>

      <StudioBottomToolbar onSynthesis={focusCanvas} onArtisan={focusAgents} onDeploy={() => void deploy()} deploying={submitting} />
    </div>
  );
}
