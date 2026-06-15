import { useState } from "react";
import { PURPLE, PURPLE_LIGHT, PURPLE_DARK, GREEN, GREEN_BG, GREEN_DARK, RED, AMBER_BG, AMBER_DARK, Avatar, SectionLabel, HistIcon } from "./ui";
import { useAppData } from "./AppDataContext";

function fmt(sec) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function timeAgo(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(d);
}

function typeOf(log) {
  if (log.direction === "inbound") return "inc";
  if (log.status === "failed" || log.status === "no-answer") return "miss";
  return "out";
}

const FILTER_LABELS = ["All", "Outbound", "Inbound", "Missed"];

export default function History() {
  const { callLogs, wallet, refresh } = useAppData();
  const [filter, setFilter] = useState("All");

  const currency = wallet?.currency === "USD" ? "$" : (wallet?.currency || "");

  const filtered = callLogs.filter(c => {
    if (filter === "All") return true;
    if (filter === "Outbound") return c.direction === "outbound";
    if (filter === "Inbound") return c.direction === "inbound";
    if (filter === "Missed") return c.status === "failed" || c.status === "no-answer";
    return true;
  });

  const totalCost = callLogs.reduce((s, c) => s + Number(c.cost || 0), 0);
  const totalMin = Math.round(callLogs.reduce((s, c) => s + (c.duration_seconds || 0), 0) / 60);

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1rem" }}>
        {[
          { label: "Total calls", value: String(callLogs.length) },
          { label: "Minutes talked", value: String(totalMin) },
          { label: "Total spent", value: `${currency}${totalCost.toFixed(2)}` },
          { label: "Completed", value: String(callLogs.filter(c => c.status === "completed").length) },
        ].map((m, i) => (
          <div key={i} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "0.65rem 0.75rem" }}>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{m.label}</div>
            <div style={{ fontSize: 17, fontWeight: 500, marginTop: 2 }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: "0.85rem", overflowX: "auto" }}>
        {FILTER_LABELS.map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap",
            background: filter === f ? PURPLE : "var(--color-background-secondary)",
            color: filter === f ? "#fff" : "var(--color-text-secondary)",
            border: `0.5px solid ${filter === f ? PURPLE : "var(--color-border-tertiary)"}`,
          }}>{f}</div>
        ))}
      </div>

      <SectionLabel>{filter} calls ({filtered.length})</SectionLabel>

      {filtered.length === 0 ? (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "1.5rem", textAlign: "center", fontSize: 12, color: "var(--color-text-secondary)" }}>
          No {filter.toLowerCase()} calls yet.
        </div>
      ) : (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
          {filtered.map((log, i) => {
            const type = typeOf(log);
            const label = type === "inc" ? "Incoming" : type === "miss" ? "Missed" : "Outgoing";
            return (
              <div key={log.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 1rem",
                borderBottom: i < filtered.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none"
              }}>
                <HistIcon type={type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.to_number || log.from_number || "Unknown"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
                    {label} · {timeAgo(log.created_at)}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{fmt(log.duration_seconds)}</div>
                  {Number(log.cost) > 0 && (
                    <div style={{ fontSize: 11, color: RED, marginTop: 2 }}>−{currency}{Number(log.cost).toFixed(2)}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
