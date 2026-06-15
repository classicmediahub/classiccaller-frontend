import { useMemo } from "react";
import { PURPLE, PURPLE_DARK, PURPLE_LIGHT, GREEN, GREEN_BG, GREEN_DARK, AMBER_BG, AMBER_DARK, RED, Avatar, SectionLabel } from "./ui";
import { useAppData } from "./AppDataContext";
import { useAuth } from "./AuthContext";

const ICONS = {
  recharge: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7zM13 2v7h7M12 18v-6M9 15h6",
  dial: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  history: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 0v4m0 4v2l2 2",
  provision: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
};

function timeAgo(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function initialsFor(num) {
  return num ? num.slice(-4, -2) || "??" : "??";
}

export default function Dashboard({ onNav }) {
  const { wallet, primaryNumber, callLogs, loading, error, refresh } = useAppData();
  const { user } = useAuth();

  const metrics = useMemo(() => {
    const completed = callLogs.filter(c => c.status === "completed");
    const totalSeconds = completed.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60);

    const today = new Date().toDateString();
    const todayCalls = callLogs.filter(c => new Date(c.created_at).toDateString() === today);
    const outToday = todayCalls.filter(c => c.direction === "outbound").length;
    const inToday = todayCalls.filter(c => c.direction === "inbound").length;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekSpend = callLogs
      .filter(c => new Date(c.created_at) >= weekAgo)
      .reduce((sum, c) => sum + Number(c.cost || 0), 0);

    return {
      totalMinutes,
      callsToday: todayCalls.length,
      outToday,
      inToday,
      weekSpend,
    };
  }, [callLogs]);

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)", fontSize: 13 }}>Loading your account…</div>;
  }

  return (
    <div>
      {error && (
        <div style={{ background: "#FCEBEB", color: RED, fontSize: 12, padding: "8px 10px", borderRadius: 8, marginBottom: "1rem" }}>
          {error} — <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={refresh}>retry</span>
        </div>
      )}

      {/* SIM Card */}
      <div style={{
        background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
        borderRadius: 12, padding: "1.1rem", color: "#fff", marginBottom: "1rem",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1, textTransform: "uppercase" }}>Classic Caller eSIM</div>
            <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: 2, margin: "6px 0 2px" }}>
              {primaryNumber ? primaryNumber.phone_number : "No number yet"}
            </div>
            <div style={{ fontSize: 11, opacity: 0.75 }}>{user?.full_name}</div>
          </div>
          <div>
            <div style={{ width: 28, height: 18, background: "rgba(255,255,255,0.2)", borderRadius: 3 }} />
            <div style={{ fontSize: 8, opacity: 0.45, textAlign: "right", marginTop: 3, letterSpacing: 1 }}>ESIM</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.6 }}>Balance</div>
            <div style={{ fontSize: 20, fontWeight: 500 }}>
              {wallet ? `${wallet.currency === "USD" ? "$" : wallet.currency} ${Number(wallet.balance).toFixed(2)}` : "—"}
            </div>
          </div>
          <div style={{ fontSize: 10, background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: 20 }}>
            {primaryNumber ? "Active" : "Not provisioned"}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1rem" }}>
        {[
          { label: "Minutes used", value: String(metrics.totalMinutes), sub: "all time" },
          { label: "Calls today", value: String(metrics.callsToday), sub: `${metrics.outToday} out · ${metrics.inToday} in` },
          { label: "Spent this week", value: `${wallet?.currency === "USD" ? "$" : ""}${metrics.weekSpend.toFixed(2)}`, sub: "since 7 days ago" },
        ].map((m, i) => (
          <div key={i} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "0.75rem" }}>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 500 }}>{m.value}</div>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 1 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <SectionLabel>Quick actions</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: primaryNumber ? "repeat(3,1fr)" : "repeat(3,1fr)", gap: 8, marginBottom: "1rem" }}>
        {(primaryNumber
          ? [
              { label: "Recharge", screen: "recharge", icon: ICONS.recharge },
              { label: "Call", screen: "dial", icon: ICONS.dial },
              { label: "History", screen: "history", icon: ICONS.history },
            ]
          : [
              { label: "Get a number", screen: "numbers", icon: ICONS.provision },
              { label: "Recharge", screen: "recharge", icon: ICONS.recharge },
              { label: "History", screen: "history", icon: ICONS.history },
            ]
        ).map((a, i) => (
          <div key={i} onClick={() => a.screen && onNav(a.screen)} style={{
            background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 8, padding: "0.65rem 0.4rem", textAlign: "center", cursor: "pointer"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", margin: "0 auto 5px" }}>
              <path d={a.icon} />
            </svg>
            <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{a.label}</span>
          </div>
        ))}
      </div>

      {/* Recent Calls */}
      <SectionLabel>Recent calls</SectionLabel>
      {callLogs.length === 0 ? (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "1.25rem", textAlign: "center", fontSize: 12, color: "var(--color-text-secondary)" }}>
          No calls yet. Make your first call from the dialer.
        </div>
      ) : (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
          {callLogs.slice(0, 3).map((h, i) => {
            const type = h.direction === "inbound" ? "inc" : h.status === "failed" ? "miss" : "out";
            return (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 1rem", borderBottom: i < Math.min(3, callLogs.length) - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <Avatar initials={initialsFor(h.to_number)} bg={type === "inc" ? GREEN_BG : type === "miss" ? AMBER_BG : PURPLE_LIGHT} color={type === "inc" ? GREEN_DARK : type === "miss" ? AMBER_DARK : PURPLE_DARK} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{h.to_number}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 1 }}>{timeAgo(h.created_at)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                    {h.duration_seconds ? `${Math.floor(h.duration_seconds / 60)}m ${h.duration_seconds % 60}s` : "—"}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 1, color: type === "inc" ? GREEN : type === "miss" ? AMBER_DARK : RED }}>
                    {Number(h.cost) > 0 ? `−${wallet?.currency === "USD" ? "$" : ""}${Number(h.cost).toFixed(2)}` : "Free"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
