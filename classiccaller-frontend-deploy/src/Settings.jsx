import { useState } from "react";
import { PURPLE, PURPLE_LIGHT, PURPLE_DARK, RED, GREEN, GREEN_BG, SectionLabel } from "./ui";
import { useAppData } from "./AppDataContext";
import { useAuth } from "./AuthContext";

function Row({ label, value, onClick, danger }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "11px 1rem", cursor: onClick ? "pointer" : "default",
      borderBottom: "0.5px solid var(--color-border-tertiary)"
    }}>
      <span style={{ fontSize: 13, color: danger ? RED : "var(--color-text-primary)" }}>{label}</span>
      {value && <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{value}</span>}
      {onClick && !danger && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      )}
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const { wallet, primaryNumber, transactions } = useAppData();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const currency = wallet?.currency === "USD" ? "$" : (wallet?.currency || "");
  const initials = user?.full_name?.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() || "??";

  return (
    <div>
      {/* Avatar */}
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <div style={{
          width: 62, height: 62, borderRadius: "50%", background: PURPLE_LIGHT,
          color: PURPLE_DARK, fontSize: 22, fontWeight: 500, margin: "0 auto 0.6rem",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>{initials}</div>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{user?.full_name}</div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{user?.email}</div>
      </div>

      {/* Account */}
      <SectionLabel>Account</SectionLabel>
      <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden", marginBottom: "1rem" }}>
        <Row label="Email" value={user?.email} />
        <Row label="Wallet balance" value={wallet ? `${currency}${Number(wallet.balance).toFixed(2)}` : "—"} />
        <Row label="Virtual number" value={primaryNumber?.phone_number || "None"} />
        <Row label="Transactions" value={String(transactions.length)} />
      </div>

      {/* Plan */}
      <SectionLabel>Plan</SectionLabel>
      <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden", marginBottom: "1rem" }}>
        <Row label="Current plan" value="Pay as you go" />
        <Row label="Rate" value="$0.02–$0.05 / min" />
        <Row label="SMS" value="Coming soon" />
      </div>

      {/* Support */}
      <SectionLabel>Support</SectionLabel>
      <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden", marginBottom: "1rem" }}>
        <Row label="Help & FAQ" onClick={() => {}} />
        <Row label="Contact support" onClick={() => {}} />
        <div style={{ padding: "11px 1rem" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Version 1.0.0</span>
        </div>
      </div>

      {/* Danger zone */}
      {!confirmLogout ? (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
          <Row label="Sign out" danger onClick={() => setConfirmLogout(true)} />
        </div>
      ) : (
        <div style={{ border: `0.5px solid ${RED}`, borderRadius: 8, padding: "0.85rem", textAlign: "center" }}>
          <div style={{ fontSize: 13, marginBottom: "0.75rem" }}>Sign out of Classic Caller?</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setConfirmLogout(false)} style={{ flex: 1, padding: 9, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            <button onClick={logout} style={{ flex: 1, padding: 9, background: RED, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
          </div>
        </div>
      )}
    </div>
  );
}
