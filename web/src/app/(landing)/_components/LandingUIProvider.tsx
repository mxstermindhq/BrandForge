"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { TalentProfileEditor } from "./TalentProfileEditor";

type LandingUIContextValue = {
  openProfileEditor: () => void;
  refreshDirectory: () => void;
  directoryVersion: number;
};

const LandingUIContext = createContext<LandingUIContextValue | null>(null);

export function useLandingUI() {
  const ctx = useContext(LandingUIContext);
  if (!ctx) throw new Error("useLandingUI must be used within LandingUIProvider");
  return ctx;
}

export function LandingUIProvider({ children }: { children: React.ReactNode }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [directoryVersion, setDirectoryVersion] = useState(0);

  const openProfileEditor = useCallback(() => setEditorOpen(true), []);
  const refreshDirectory = useCallback(() => setDirectoryVersion((v) => v + 1), []);

  const value = useMemo(
    () => ({ openProfileEditor, refreshDirectory, directoryVersion }),
    [openProfileEditor, refreshDirectory, directoryVersion],
  );

  return (
    <LandingUIContext.Provider value={value}>
      {children}
      <TalentProfileEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSaved={() => {
          refreshDirectory();
          setEditorOpen(false);
        }}
      />
    </LandingUIContext.Provider>
  );
}
