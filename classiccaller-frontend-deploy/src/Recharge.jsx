import { useEffect, useState } from "react";
import { PURPLE, PURPLE_LIGHT, PURPLE_DARK, GREEN, GREEN_BG, RED, SectionLabel } from "./ui";
import { useAppData } from "./AppDataContext";
import { api } from "./api";

const NAVY = "#0D0F1A";
const GOLD = "#C9A84C";

// Paystack Inline JS is loaded once from their CDN
function loadPaystackScript() {
  return new Promise((resolve) => {
    if (window.PaystackPop) return resolve();
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = resolve;
    document.body.appendChild(script);
  });
}

const PLANS = [
  { id: 1, amount: 500,   label: "₦500",   minutes: 25,   validity: "7 days" },
  { id: 2, amount: 1000,  label: "₦1,000", minutes: 60,   validity: "14 days", popular: true },
  { id: 3, amount: 2000,  label: "₦2,000", minutes: 130,  validity: "30 days" },
  { id: 4, amount: 5000,  label: "₦5,000", minutes: 350,  validity: "30 days" },
  { id: 5, amount: 10000, label: "₦10,000",minutes: 750,  validity: "60 days" },
  { id: 6, amount: 20000, label: "₦20,000",minutes: 1600, validity: "90 days" },
];

export default function Recharge() {
  const { wallet, refresh } = useAppData();
  const [selected, setSelected] = useState(2);
  const [custom, setCustom] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | verifying | success | error
  const [error, setError] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);

  // Check if we just came back from Paystack redirect (callback_url)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      verifyPayment(ref);
      // Clean the URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function verifyPayment(reference) {
    setStatus("verifying");
    setError("");
    try {
      const result = await api.paystackVerify(reference);
      if (result.success) {
        setPaidAmount(result.amount_ngn || 0);
        setStatus("success");
        await refresh();
      } else {
        throw new Error("Payment could not be verified");
      }
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  function getAmount() {
    if (custom) return Number(custom);
    return PLANS.find(p => p.id === selected)?.amount || 0;
  }

  async function handlePay() {
    const amount = getAmount();
    if (amount < 100) {
      setError("Minimum recharge is ₦100");
      return;
    }
    setError("");
    setStatus("loading");

    try {
      // 1. Get Paystack authorization URL + reference from backend
      const { authorization_url, reference, access_code } = await api.paystackInit(amount);

      // 2. Load Paystack Inline JS
      await loadPaystackScript();

      setStatus("idle");

      // 3. Open Paystack popup
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: "", // Paystack fills this from the transaction
        amount: amount * 100, // kobo
        ref: reference,
        currency: "NGN",
        onClose: () => {
          setStatus("idle");
        },
        callback: async (response) => {
          // Payment done — verify on backend
          await verifyPayment(response.reference);
        },
      });

      handler.openIframe();
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  const balanceDisplay = wallet
    ? `₦${Number(wallet.balance).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
    : "—";

  return (
    <div>
      {/* Balance card */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY}, #1a1f35)`,
        borderRadius: 12, padding: "1rem", marginBottom: "1rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 10, color: "#fff", opacity: 0.5, marginBottom: 3, letterSpacing: 0.5 }}>
            CURRENT BALANCE
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: GOLD }}>
            {balanceDisplay}
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#fff", opacity: 0.35 }}>Classic Caller</div>
      </div>

      {status === "verifying" && (
        <div style={{ background: PURPLE_LIGHT, borderRadius: 8, padding: "0.85rem", textAlign: "center", marginBottom: "1rem" }}>
          <div style={{ fontSize: 13, color: PURPLE_DARK, fontWeight: 500 }}>⏳ Verifying your payment…</div>
          <div style={{ fontSize: 11, color: PURPLE_DARK, opacity: 0.7, marginTop: 4 }}>Please wait</div>
        </div>
      )}

      {status === "success" && (
        <div style={{ background: GREEN_BG, borderRadius: 8, padding: "1rem", textAlign: "center", marginBottom: "1rem", border: `1px solid ${GREEN}33` }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>🎉</div>
          <div style={{ fontSize: 14, color: GREEN, fontWeight: 600 }}>Payment successful!</div>
          <div style={{ fontSize: 12, color: GREEN, opacity: 0.8, marginTop: 3 }}>
            ₦{Number(paidAmount).toLocaleString()} added to your wallet
          </div>
          <div onClick={() => setStatus("idle")} style={{
            marginTop: "0.85rem", fontSize: 12, color: GREEN,
            textDecoration: "underline", cursor: "pointer",
          }}>Top up again</div>
        </div>
      )}

      {status !== "success" && status !== "verifying" && (
        <>
          <SectionLabel>Choose a plan</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1rem" }}>
            {PLANS.map(p => {
              const active = selected === p.id && !custom;
              return (
                <div key={p.id} onClick={() => { setSelected(p.id); setCustom(""); setStatus("idle"); setError(""); }}
                  style={{
                    border: `${active ? "1.5px" : "0.5px"} solid ${active ? PURPLE : "var(--color-border-tertiary)"}`,
                    background: active ? PURPLE_LIGHT : "var(--color-background-primary)",
                    borderRadius: 8, padding: "0.75rem 0.5rem", cursor: "pointer",
                    transition: "all 0.12s", position: "relative",
                  }}>
                  {p.popular && (
                    <div style={{
                      position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                      background: GOLD, color: NAVY, fontSize: 8, fontWeight: 600,
                      padding: "2px 7px", borderRadius: 10, whiteSpace: "nowrap",
                    }}>POPULAR</div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 600, color: active ? PURPLE_DARK : "var(--color-text-primary)" }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 2 }}>
                    ~{p.minutes} mins
                  </div>
                  <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginTop: 1 }}>
                    {p.validity}
                  </div>
                </div>
              );
            })}
          </div>

          <SectionLabel>Or enter custom amount</SectionLabel>
          <div style={{
            border: `1px solid ${custom ? PURPLE : "var(--color-border-tertiary)"}`,
            borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: custom ? `0 0 0 3px ${PURPLE}18` : "none",
          }}>
            <span style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-secondary)" }}>₦</span>
            <input
              type="number" min="100" value={custom}
              placeholder="Enter amount (min ₦100)"
              onChange={e => { setCustom(e.target.value); setStatus("idle"); setError(""); }}
              style={{
                flex: 1, border: "none", outline: "none", fontSize: 16,
                fontWeight: 500, background: "transparent",
                color: "var(--color-text-primary)", fontFamily: "inherit",
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#FEF2F2", color: RED, fontSize: 12,
              padding: "9px 12px", borderRadius: 8, marginBottom: "0.85rem",
              border: "1px solid #FECACA",
            }}>
              {error}
            </div>
          )}

          <button onClick={handlePay}
            disabled={getAmount() < 100 || status === "loading"}
            style={{
              width: "100%", padding: "13px 0",
              background: getAmount() >= 100 ? NAVY : "var(--color-background-secondary)",
              color: getAmount() >= 100 ? GOLD : "var(--color-text-secondary)",
              border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
              fontFamily: "inherit", cursor: getAmount() >= 100 ? "pointer" : "default",
              letterSpacing: 0.3, transition: "all 0.2s",
              opacity: status === "loading" ? 0.7 : 1,
            }}>
            {status === "loading"
              ? "Opening payment…"
              : `Pay ₦${getAmount() >= 100 ? Number(getAmount()).toLocaleString() : "—"} with Paystack`}
          </button>

          <div style={{ textAlign: "center", marginTop: "0.75rem", fontSize: 10, color: "var(--color-text-secondary)" }}>
            🔒 Secured by Paystack · Visa, Mastercard, Bank Transfer, USSD
          </div>
        </>
      )}
    </div>
  );
}
