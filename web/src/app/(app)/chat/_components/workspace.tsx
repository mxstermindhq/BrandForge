"use client";

import { useState } from "react";
import { LINE_ITEM_DEFAULT_AMOUNT, LINE_ITEM_LABEL } from "../_lib/format";
import type { EscrowLine, Milestone, Task, WorkspaceUser } from "@/types/workspace";

const COLUMNS: { key: Task["column"]; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

function Kanban({
  tasks,
  me,
  onMove,
  onAdd,
}: {
  tasks: Task[];
  me: WorkspaceUser;
  onMove: (taskId: string, column: Task["column"], position: number) => void;
  onAdd: (column: Task["column"], title: string) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState<Task["column"] | null>(null);

  return (
    <div className="ws-kanban">
      {COLUMNS.map((col) => {
        const cards = tasks
          .filter((t) => t.column === col.key)
          .sort((a, b) => a.position - b.position);
        return (
          <div
            key={col.key}
            className={`ws-kcol${dragOver === col.key ? " dragover" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(col.key);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const id = e.dataTransfer.getData("text/plain");
              if (!id) return;
              onMove(id, col.key, cards.length);
            }}
          >
            <div className="ws-kcol-head">
              <span>{col.label}</span>
              <span>{cards.length}</span>
            </div>
            {cards.map((task) => (
              <div
                key={task.id}
                className="ws-tcard"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", task.id)}
              >
                <div className="t-title">{task.title}</div>
                {task.tag && <span className="t-tag">{task.tag}</span>}
              </div>
            ))}
            <div className="ws-task-add">
              <input
                placeholder="Add task…"
                value={draft[col.key] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [col.key]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = (draft[col.key] ?? "").trim();
                    if (v) onAdd(col.key, v);
                  }
                }}
              />
              <button
                onClick={() => {
                  const v = (draft[col.key] ?? "").trim();
                  if (v) onAdd(col.key, v);
                }}
              >
                Add
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Finance({
  escrow,
  me,
  onStatus,
  onAddLedger,
  canEdit,
}: {
  escrow: EscrowLine[];
  me: WorkspaceUser;
  onStatus: (id: string, status: EscrowLine["status"]) => void;
  onAddLedger: () => void;
  canEdit: boolean;
}) {
  return (
    <div>
      <div className="ws-finance-row">
        {escrow.length === 0 && (
          <div className="ws-empty" style={{ gridColumn: "1 / -1" }}>
            No escrow line items yet.
          </div>
        )}
        {escrow.map((line) => (
          <div className="ws-fplate" key={line.id}>
            <div className="f-label">{LINE_ITEM_LABEL[line.line_item] ?? line.line_item}</div>
            <div className="f-amount">${Number(line.amount).toLocaleString()}</div>
            <div className={`f-status ws-fstatus ${line.status}`}>
              {line.status === "pending"
                ? "Pending final delivery"
                : line.status === "paid"
                  ? "Paid"
                  : "Released"}
            </div>
            {canEdit && (
              <select
                className="ws-status-select"
                value={line.status}
                onChange={(e) => onStatus(line.id, e.target.value as EscrowLine["status"])}
              >
                <option value="pending">pending</option>
                <option value="paid">paid</option>
                <option value="released">released</option>
              </select>
            )}
          </div>
        ))}
      </div>
      {canEdit && (
        <button className="ws-ledger-action" onClick={onAddLedger}>
          + Add missing ledger line items (match fee / initiation / completion)
        </button>
      )}
    </div>
  );
}

function Roadmap({
  milestones,
  me,
  canEdit,
  onAdd,
  onCycle,
  onDelete,
}: {
  milestones: Milestone[];
  me: WorkspaceUser;
  canEdit: boolean;
  onAdd: (label: string) => void;
  onCycle: (id: string, status: Milestone["status"]) => void;
  onDelete: (id: string) => void;
}) {
  const [label, setLabel] = useState("");

  function cycle(status: Milestone["status"]): Milestone["status"] {
    return status === "done" ? "upcoming" : status === "current" ? "done" : "current";
  }

  return (
    <div>
      <div className="ws-roadmap">
        {milestones.length === 0 && (
          <div className="ws-empty">
            No milestones yet.
            {canEdit && " Add the first one below."}
          </div>
        )}
        {milestones.map((m) => (
          <div key={m.id} className={`ws-rnode ${m.status}`}>
            <div
              className="ws-rdot"
              title={canEdit ? "Click to advance" : m.status}
              onClick={() => canEdit && onCycle(m.id, cycle(m.status))}
            />
            <div className="r-label">{m.label}</div>
            <div className="r-date">{m.date ? new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}</div>
            {canEdit && (
              <button className="ws-rm-del" onClick={() => onDelete(m.id)}>
                remove
              </button>
            )}
          </div>
        ))}
      </div>
      {canEdit && (
        <div className="ws-roadmap-add">
          <input
            placeholder="Add milestone…"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = label.trim();
                if (v) onAdd(v);
              }
            }}
          />
          <button
            onClick={() => {
              const v = label.trim();
              if (v) onAdd(v);
            }}
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export function WorkspaceView({
  tasks,
  escrow,
  milestones,
  me,
  onMoveTask,
  onAddTask,
  onEscrowStatus,
  onAddLedger,
  onAddMilestone,
  onCycleMilestone,
  onDeleteMilestone,
}: {
  tasks: Task[];
  escrow: EscrowLine[];
  milestones: Milestone[];
  me: WorkspaceUser;
  onMoveTask: (taskId: string, column: Task["column"], position: number) => void;
  onAddTask: (column: Task["column"], title: string) => void;
  onEscrowStatus: (id: string, status: EscrowLine["status"]) => void;
  onAddLedger: () => void;
  onAddMilestone: (label: string) => void;
  onCycleMilestone: (id: string, status: Milestone["status"]) => void;
  onDeleteMilestone: (id: string) => void;
}) {
  const isFounder = me.role === "founder";
  const isOperator = me.role === "operator";
  const roadmapEditable = isFounder || isOperator;

  return (
    <div className="ws-view active" id="view-workspace">
      <div className="ws-workspace-view" style={{ display: "flex", flexDirection: "column" }}>
        <div className="ws-section">
          <div className="ws-eyebrow">Tasks</div>
          <div className="ws-title">Board</div>
          <Kanban tasks={tasks} me={me} onMove={onMoveTask} onAdd={onAddTask} />
        </div>

        <div className="ws-section">
          <div className="ws-eyebrow">Escrow</div>
          <div className="ws-title">Finance</div>
          <Finance escrow={escrow} me={me} onStatus={onEscrowStatus} onAddLedger={onAddLedger} canEdit={isFounder} />
        </div>

        <div className="ws-section">
          <div className="ws-eyebrow">Timeline</div>
          <div className="ws-title">Roadmap</div>
          <Roadmap
            milestones={milestones}
            me={me}
            canEdit={roadmapEditable}
            onAdd={onAddMilestone}
            onCycle={onCycleMilestone}
            onDelete={onDeleteMilestone}
          />
        </div>
      </div>
    </div>
  );
}
