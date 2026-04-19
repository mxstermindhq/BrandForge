"use client";

import { useState, useEffect, useCallback } from "react";
import { Terminal, Play, Pause, RotateCcw } from "lucide-react";

interface Line {
  text: string;
  delay: number;
  color?: string;
}

const DEMO_LINES: Line[] = [
  { text: "$ brandforge match \"logo designer under $500\"", delay: 0, color: "text-white" },
  { text: "🔍 Searching 247 specialists...", delay: 800, color: "text-zinc-400" },
  { text: "✨ Found 3 perfect matches (98% fit)", delay: 1400, color: "text-emerald-400" },
  { text: "", delay: 1800 },
  { text: "┌─────────────────────────────────────┐", delay: 2000, color: "text-zinc-600" },
  { text: "│ 🎨 @novadesign                      │", delay: 2100, color: "text-white" },
  { text: "│ ⭐ 4.9★ · $450 · Brand Identity     │", delay: 2200, color: "text-zinc-400" },
  { text: "│ 🏆 Gladiator tier · Top 1%          │", delay: 2300, color: "text-amber-400" },
  { text: "└─────────────────────────────────────┘", delay: 2400, color: "text-zinc-600" },
  { text: "", delay: 2600 },
  { text: "📊 Smart Match Analysis:", delay: 2800, color: "text-sky-400" },
  { text: "   ✓ Budget match: 90% ($450/$500)", delay: 3000, color: "text-zinc-400" },
  { text: "   ✓ Style alignment: 95%", delay: 3200, color: "text-zinc-400" },
  { text: "   ✓ Availability: Within 48h", delay: 3400, color: "text-zinc-400" },
  { text: "", delay: 3600 },
  { text: "💡 Suggested action: Deploy BidCrafter agent", delay: 3800, color: "text-purple-400" },
  { text: "   to generate a competitive proposal", delay: 4000, color: "text-zinc-500" },
];

export function StreamingTerminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentLine, setCurrentLine] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const reset = useCallback(() => {
    setLines([]);
    setCurrentLine(0);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentLine >= DEMO_LINES.length) {
      // Loop after 3 second pause
      const timeout = setTimeout(() => {
        reset();
      }, 3000);
      return () => clearTimeout(timeout);
    }

    const line = DEMO_LINES[currentLine];
    const timeout = setTimeout(() => {
      setLines((prev) => [...prev, line]);
      setCurrentLine((prev) => prev + 1);
    }, currentLine === 0 ? 500 : line.delay - (DEMO_LINES[currentLine - 1]?.delay || 0));

    return () => clearTimeout(timeout);
  }, [currentLine, isPlaying, reset]);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-zinc-500" />
          <span className="text-xs text-zinc-500 font-medium">BrandForge CLI Demo</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={reset}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 font-mono text-sm min-h-[320px] bg-gradient-to-b from-zinc-900 to-zinc-950">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`${line.color || "text-zinc-300"} leading-relaxed`}
            style={{
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            {line.text}
          </div>
        ))}
        
        {/* Cursor */}
        {currentLine < DEMO_LINES.length && (
          <span
            className={`inline-block w-2 h-4 bg-amber-400 ml-1 transition-opacity ${
              showCursor ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Completed indicator */}
        {currentLine >= DEMO_LINES.length && (
          <div className="mt-4 flex items-center gap-2 text-emerald-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs">Demo complete — Start your journey</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-zinc-800">
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{
            width: `${(currentLine / DEMO_LINES.length) * 100}%`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
