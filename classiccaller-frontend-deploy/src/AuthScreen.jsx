import { useState } from "react";
import { useAuth } from "./AuthContext";

const NAVY   = "#0D0F1A";
const GOLD   = "#C9A84C";
const GOLD2  = "#E8C96A";
const CREAM  = "#F5F0E8";
const PURPLE = "#534AB7";
const RED    = "#E24B4A";

// Small animated signal icon for the auth header
function LogoMark() {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: 14, background: NAVY,
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 0.85rem", flexShrink: 0,
      boxShadow: `0 0 0 1px ${GOLD}33, 0 4px 16px rgba(0,0,0,0.18)`,
    }}>
      <svg width="28" height="28" viewBox="0 0 28 28">
        {/* Concentric arcs */}
        {[11, 8, 5].map((r, i) => (
          <path key={r}
            d={`M ${14-r} 16 A ${r} ${r} 0 0 1 ${14+r} 16`}
            fill="none" stroke={GOLD} strokeWidth={i === 2 ? 2 : 1.5}
            strokeOpacity={0.35 + i * 0.25} strokeLinecap="round"
          />
        ))}
        {/* Phone dot */}
        <circle cx="14" cy="16" r="2.5" fill={GOLD}/>
      </svg>
    </div>
  );
}

function Input({ label, type, value, onChange, placeholder, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "0.85rem" }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: NAVY, opacity: 0.5, display: "block", marginBottom: 5, letterSpacing: 0.3 }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "11px 13px", fontSize: 14,
          borderRadius: 10, fontFamily: "inherit",
          border: `1.5px solid ${focused ? GOLD : "#e2ddd6"}`,
          outline: "none", background: "#fdfaf6",
          color: NAVY, transition: "border-color 0.18s",
          boxSizing: "border-box",
          boxShadow: focused ? `0 0 0 3px ${GOLD}18` : "none",
        }}
      />
    </div>
  );
}

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, fullName);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes authIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        minHeight: "100%", padding: "0 0.25rem",
        animation: "authIn 0.4s ease both",
      }}>

        {/* Brand header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <LogoMark />
          <div style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 22, fontWeight: 700, color: NAVY, lineHeight: 1.1,
          }}>Classic Caller</div>
          <div style={{ fontSize: 12, color: NAVY, opacity: 0.4, marginTop: 4, letterSpacing: 0.3 }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </div>
        </div>

        {/* Form card */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "1.5rem",
          border: "1px solid #ede8e0",
          boxShadow: "0 2px 16px rgba(13,15,26,0.06)",
        }}>
          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <Input label="Full name" type="text" value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ade Olawale" autoComplete="name" />
            )}
            <Input label="Email address" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" />
            <Input label="Password" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />

            {error && (
              <div style={{
                background: "#FEF2F2", color: RED, fontSize: 12,
                padding: "9px 12px", borderRadius: 8, marginBottom: "1rem",
                border: "1px solid #FECACA",
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "12px 0",
              background: loading ? `${NAVY}99` : NAVY,
              color: GOLD, border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 600, fontFamily: "inherit",
              cursor: loading ? "default" : "pointer", letterSpacing: 0.4,
              transition: "background 0.2s",
            }}>
              {loading
                ? "Please wait…"
                : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

        {/* Mode switcher */}
        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: 12, color: NAVY, opacity: 0.5 }}>
          {mode === "login" ? (
            <>No account?{" "}
              <span onClick={() => { setMode("register"); setError(""); }}
                style={{ color: PURPLE, opacity: 1, cursor: "pointer", fontWeight: 500 }}>
                Create one
              </span>
            </>
          ) : (
            <>Already have an account?{" "}
              <span onClick={() => { setMode("login"); setError(""); }}
                style={{ color: PURPLE, opacity: 1, cursor: "pointer", fontWeight: 500 }}>
                Sign in
              </span>
            </>
          )}
        </div>

        {/* Legal note */}
        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 10, color: NAVY, opacity: 0.25, lineHeight: 1.6 }}>
          By continuing you agree to Classic Caller's{"\n"}Terms of Service and Privacy Policy.
        </div>
      </div>
    </>
  );
}
