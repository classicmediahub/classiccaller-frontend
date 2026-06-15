import { useState } from "react";
import { PURPLE, PURPLE_DARK, RED, SectionLabel } from "./ui";
import { useAppData } from "./AppDataContext";
import { api } from "./api";

const COUNTRIES = [
  { code: "NG", label: "Nigeria" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "DE", label: "Germany" },
];

export default function Numbers() {
  const { numbers, primaryNumber, refresh } = useAppData();
  const [country, setCountry] = useState("NG");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleProvision() {
    setLoading(true);
    setError("");
    try {
      await api.provisionNumber(country);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <SectionLabel>Your numbers</SectionLabel>

      {numbers.length === 0 ? (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "1.25rem", textAlign: "center", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
          You don't have a virtual number yet. Get one below to start making calls.
        </div>
      ) : (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden", marginBottom: "1rem" }}>
          {numbers.map((n, i) => (
            <div key={n.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 1rem", borderBottom: i < numbers.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: 1 }}>{n.phone_number}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{n.country}</div>
              </div>
              <span style={{
                fontSize: 10, padding: "3px 10px", borderRadius: 20,
                background: n.status === "active" ? "#dcfce7" : "var(--color-background-secondary)",
                color: n.status === "active" ? "#15803d" : "var(--color-text-secondary)"
              }}>{n.status}</span>
            </div>
          ))}
        </div>
      )}

      {!primaryNumber && (
        <>
          <SectionLabel>Get a virtual number</SectionLabel>
          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "0.85rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6 }}>Country</div>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", fontSize: 13, borderRadius: 8,
                border: "0.5px solid var(--color-border-tertiary)", outline: "none",
                background: "var(--color-background-primary)", color: "var(--color-text-primary)",
                fontFamily: "inherit"
              }}
            >
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>

          {error && (
            <div style={{ background: "#FCEBEB", color: RED, fontSize: 12, padding: "8px 10px", borderRadius: 8, marginBottom: "0.85rem" }}>
              {error}
            </div>
          )}

          <button onClick={handleProvision} disabled={loading} style={{
            width: "100%", padding: 10, background: PURPLE, color: "#fff", border: "none",
            borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1, fontFamily: "inherit"
          }}>
            {loading ? "Provisioning…" : "Get a virtual number"}
          </button>
        </>
      )}
    </div>
  );
}
