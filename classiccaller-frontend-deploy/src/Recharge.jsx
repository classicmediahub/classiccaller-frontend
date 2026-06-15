import { useState } from "react";
import { PURPLE, PURPLE_LIGHT, PURPLE_DARK, GREEN, GREEN_BG, RED, Badge, SectionLabel } from "./ui";
import { useAppData } from "./AppDataContext";
import { api } from "./api";

const PLANS = [
  { id: 1, amount: 5, minutes: 60, validity: "7 days" },
  { id: 2, amount: 10, minutes: 150, validity: "14 days", popular: true },
  { id: 3, amount: 20, minutes: 350, validity: "30 days" },
  { id: 4, amount: 35, minutes: 650, validity: "30 days" },
  { id: 5, amount: 50, minutes: 1000, validity: "60 days" },
  { id: 6, amount: 100, minutes: 2500, validity: "90 days" },
];

export default function Recharge() {
  const { wallet, refresh } = useAppData();
  const [selected, setSelected] = useState(2);
  const [custom, setCustom] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const currencySymbol = wallet?.currency === "USD" ? "$" : (wallet?.currency || "");

  const getAmt = () => {
    if (custom) return Number(custom);
    const p = PLANS.find(p => p.id === selected);
    return p ? p.amount : 0;
  };

  async function handlePay() {
    const amount = getAmt();
    if (amount <= 0) return;
    setStatus("loading");
    setError("");
    try {
      // NOTE: in production this call happens from your payment provider's
      // webhook (Stripe/Paystack/Flutterwave) after payment is confirmed,
      // not directly from the client.
      const reference = `manual-${Date.now()}`;
      await api.recharge(amount, reference);
      await refresh();
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div>
      <SectionLabel>Choose a plan</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1rem" }}>
        {PLANS.map(p => (
          <div key={p.id} onClick={() => { setSelected(p.id); setCustom(""); setStatus("idle"); }} style={{
            border: `${selected === p.id && !custom ? "1.5px" : "0.5px"} solid ${selected === p.id && !custom ? PURPLE : "var(--color-border-tertiary)"}`,
            background: selected === p.id && !custom ? PURPLE_LIGHT : "var(--color-background-primary)",
            borderRadius: 8, padding: "0.85rem", cursor: "pointer", transition: "all 0.12s"
          }}>
            {p.popular && <Badge bg={PURPLE_LIGHT} color={PURPLE_DARK}>Most popular</Badge>}
            <div style={{ fontSize: 19, fontWeight: 500, color: PURPLE }}>{currencySymbol}{p.amount.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "2px 0" }}>{p.minutes.toLocaleString()} minutes</div>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>Valid {p.validity}</div>
          </div>
        ))}
      </div>

      <SectionLabel>Or enter custom amount</SectionLabel>
      <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "0.85rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-secondary)" }}>{currencySymbol}</span>
          <input
            type="number" min="1" value={custom} placeholder="0.00"
            onChange={e => { setCustom(e.target.value); setStatus("idle"); }}
            style={{ flex: 1, border: "none", outline: "none", fontSize: 20, fontWeight: 500, background: "transparent", color: "var(--color-text-primary)", fontFamily: "inherit" }}
          />
        </div>
      </div>

      {status === "success" ? (
        <div style={{ background: GREEN_BG, borderRadius: 8, padding: "0.85rem", textAlign: "center", color: GREEN, fontWeight: 500, fontSize: 13 }}>
          ✓ Payment of {currencySymbol}{getAmt().toLocaleString()} successful! Balance updated.
        </div>
      ) : (
        <>
          {status === "error" && (
            <div style={{ background: "#FCEBEB", color: RED, fontSize: 12, padding: "8px 10px", borderRadius: 8, marginBottom: "0.85rem" }}>
              {error}
            </div>
          )}
          <button onClick={handlePay} disabled={getAmt() <= 0 || status === "loading"} style={{
            width: "100%", padding: "10px", background: PURPLE, color: "#fff", border: "none",
            borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: status === "loading" ? "default" : "pointer",
            opacity: status === "loading" ? 0.7 : 1, fontFamily: "inherit"
          }}>
            {status === "loading" ? "Processing…" : `Pay with card · ${currencySymbol}${getAmt().toLocaleString()}`}
          </button>
        </>
      )}

      <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 10, textAlign: "center" }}>
        Demo recharge — connect Stripe/Paystack/Flutterwave for real payments.
      </div>
    </div>
  );
}
