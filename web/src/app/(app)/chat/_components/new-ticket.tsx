"use client";

import { useState } from "react";
import type { WorkspaceUser } from "@/types/workspace";

export function NewTicketModal({
  me,
  users,
  onClose,
  onCreate,
}: {
  me: WorkspaceUser;
  users: WorkspaceUser[];
  onClose: () => void;
  onCreate: (clientId: string, projectName: string, note: string) => Promise<void>;
}) {
  const isFounder = me.role === "founder";
  const [clientId, setClientId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = projectName.trim();
    if (!name) return;
    setBusy(true);
    setError("");
    try {
      await onCreate(isFounder ? clientId : me.id, name, note);
      onClose();
    } catch {
      setError("Could not create the ticket — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ws-modal-backdrop" onClick={onClose}>
      <div className="ws-modal" onClick={(e) => e.stopPropagation()}>
        <h3>New ticket</h3>
        <form onSubmit={submit}>
          {isFounder && (
            <div className="ws-field">
              <label>Client</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                <option value="">Select client…</option>
                {users
                  .filter((u) => u.role === "client")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email ?? "no email"})
                    </option>
                  ))}
              </select>
            </div>
          )}
          <div className="ws-field">
            <label>Project name</label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. CarSpotLive App"
              required
            />
          </div>
          <div className="ws-field">
            <label>First note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What are we building?"
            />
          </div>
          {error && <div className="ws-form-error">{error}</div>}
          <div className="ws-modal-actions">
            <button type="button" className="ws-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ws-btn" disabled={busy}>
              {busy ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
