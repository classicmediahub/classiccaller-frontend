export const PURPLE = "#534AB7";
export const PURPLE_LIGHT = "#EEEDFE";
export const PURPLE_DARK = "#3C3489";
export const GREEN = "#1D9E75";
export const RED = "#E24B4A";
export const AMBER = "#BA7517";
export const AMBER_BG = "#FAEEDA";
export const GREEN_BG = "#EAF3DE";
export const GREEN_DARK = "#27500A";
export const AMBER_DARK = "#633806";

export function Avatar({ initials, bg = PURPLE_LIGHT, color = PURPLE_DARK, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size < 36 ? 11 : 14, fontWeight: 500, color, flexShrink: 0
    }}>{initials}</div>
  );
}

export function Badge({ children, bg, color }) {
  return (
    <span style={{
      fontSize: 10, background: bg, color, padding: "2px 8px",
      borderRadius: 20, display: "inline-block", marginBottom: 5
    }}>{children}</span>
  );
}

export function SignalPill({ active }) {
  const ok = active !== false;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      fontSize: 11, color: ok ? "#15803d" : AMBER, background: ok ? "#dcfce7" : AMBER_BG,
      padding: "3px 10px", borderRadius: 20
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/>
      </svg>
      {ok ? "Active" : "No number"}
    </div>
  );
}

export function HistIcon({ type }) {
  const cfg = {
    out: { bg: "#FCEBEB", color: RED, d: "M7 17L17 7M17 7H7M17 7v10" },
    inc: { bg: GREEN_BG, color: GREEN, d: "M17 7L7 17M7 17h10M7 17V7" },
    miss: { bg: AMBER_BG, color: AMBER, d: "M16.5 9.4 7.55 4.24M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A3 3 0 0 0 8 17.07a19.79 19.79 0 0 1-3.07-8.67 2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L11 13.88" },
  }[type] || { bg: PURPLE_LIGHT, color: PURPLE_DARK, d: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" };
  return (
    <div style={{ width: 34, height: 34, borderRadius: "50%", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={cfg.d} />
      </svg>
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: "0.65rem" }}>
      {children}
    </div>
  );
}
