"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";

interface ThemeToggleProps {
  variant?: "icon" | "dropdown";
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ variant = "icon", size = "md" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  if (variant === "dropdown") {
    return (
      <div className="relative group">
        <button
          className={`${sizeClasses[size]} flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white transition-all`}
          title={`Theme: ${theme}`}
        >
          {resolvedTheme === "dark" ? (
            <Moon size={iconSizes[size]} />
          ) : (
            <Sun size={iconSizes[size]} />
          )}
        </button>

        {/* Dropdown */}
        <div className="absolute top-full right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="p-2 space-y-1">
            <button
              onClick={() => setTheme("light")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                theme === "light" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Sun size={16} />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                theme === "dark" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Moon size={16} />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                theme === "system" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Monitor size={16} />
              <span>System</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Simple icon button
  return (
    <button
      onClick={toggleTheme}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white transition-all`}
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {resolvedTheme === "dark" ? (
        <Sun size={iconSizes[size]} />
      ) : (
        <Moon size={iconSizes[size]} />
      )}
    </button>
  );
}

// Inline version for navbars
export function ThemeToggleInline() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
    >
      {resolvedTheme === "dark" ? (
        <>
          <Sun size={16} />
          <span className="text-sm hidden lg:inline">Light</span>
        </>
      ) : (
        <>
          <Moon size={16} />
          <span className="text-sm hidden lg:inline">Dark</span>
        </>
      )}
    </button>
  );
}
