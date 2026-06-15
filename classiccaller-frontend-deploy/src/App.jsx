import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { AppDataProvider, useAppData } from "./AppDataContext";
import Splash from "./Splash";
import Onboarding from "./Onboarding";
import AuthScreen from "./AuthScreen";
import Dashboard from "./Dashboard";
import Dialer from "./Dialer";
import Recharge from "./Recharge";
import History from "./History";
import Numbers from "./Numbers";
import Settings from "./Settings";
import { PURPLE, PURPLE_LIGHT, PURPLE_DARK, GREEN } from "./ui";

const NAV_ICONS = {
  home:     "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  dial:     "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  recharge: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  history:  "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
};

const TABS = [
  { id: "home",     label: "Home",    icon: NAV_ICONS.home },
  { id: "dial",     label: "Call",    icon: NAV_ICONS.dial },
  { id: "recharge", label: "Top up",  icon: NAV_ICONS.recharge },
  { id: "history",  label: "History", icon: NAV_ICONS.history },
  { id: "settings", label: "Profile", icon: NAV_ICONS.settings },
];

const SCREEN_TITLES = {
  home:     "Home",
  dial:     "Dialer",
  recharge: "Top up",
  history:  "Call history",
  numbers:  "My numbers",
  settings: "Profile",
};

// ─── Live wallet badge + SSE dot ─────────────────────────────────────────────
function LiveWalletBadge() {
  const { wallet, connected } = useAppData();
  const currency = wallet?.currency === "USD" ? "$" : (wallet?.currency || "");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        title={connected ? "Live updates connected" : "Reconnecting…"}
        style={{
          width: 7, height: 7, borderRadius: "50%",
          background: connected ? GREEN : "#d1d5db",
          boxShadow: connected ? `0 0 0 2px ${GREEN}33` : "none",
          flexShrink: 0, transition: "background 0.3s",
        }}
      />
      {wallet && (
        <div style={{
          fontSize: 11, background: PURPLE_LIGHT, color: PURPLE_DARK,
          padding: "4px 10px", borderRadius: 20, fontWeight: 500,
        }}>
          {currency}{Number(wallet.balance).toFixed(2)}
        </div>
      )}
    </div>
  );
}

// ─── Main app shell (post-auth) ───────────────────────────────────────────────
function AppShell() {
  const [screen, setScreen] = useState("home");
  return (
    <AppDataProvider>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "var(--font-sans)" }}>
        {/* Header */}
        <div style={{
          padding: "0.85rem 1.1rem 0.6rem",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          {!TABS.find(t => t.id === screen) && (
            <div onClick={() => setScreen("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{SCREEN_TITLES[screen] || screen}</div>
          </div>
          <LiveWalletBadge />
        </div>

        {/* Screen */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.1rem" }}>
          {screen === "home"     && <Dashboard onNav={setScreen} />}
          {screen === "dial"     && <Dialer />}
          {screen === "recharge" && <Recharge />}
          {screen === "history"  && <History />}
          {screen === "numbers"  && <Numbers />}
          {screen === "settings" && <Settings />}
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex",
          borderTop: "0.5px solid var(--color-border-tertiary)",
          background: "var(--color-background-primary)",
          flexShrink: 0,
        }}>
          {TABS.map(tab => {
            const active = screen === tab.id;
            return (
              <div key={tab.id} onClick={() => setScreen(tab.id)} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", padding: "8px 0 6px",
                cursor: "pointer",
                color: active ? PURPLE : "var(--color-text-secondary)",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d={tab.icon} />
                </svg>
                <span style={{ fontSize: 9, marginTop: 3, fontWeight: active ? 500 : 400 }}>{tab.label}</span>
                {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: PURPLE, marginTop: 2 }} />}
              </div>
            );
          })}
        </div>
      </div>
    </AppDataProvider>
  );
}

// ─── Flow controller ──────────────────────────────────────────────────────────
// splash → onboarding (first visit) → auth → app
// Returning users who are already logged in skip straight to app.

const ONBOARDED_KEY = "cc_onboarded";

function FlowController() {
  const { user } = useAuth();

  // Check if they've seen onboarding before
  const hasOnboarded = !!localStorage.getItem(ONBOARDED_KEY);

  // phase: splash | onboarding | auth | app
  const [phase, setPhase] = useState(
    user ? "app" : "splash"
  );
  const [fadeIn, setFadeIn] = useState(false);

  // If user logs in from auth screen, transition to app
  useEffect(() => {
    if (user && phase === "auth") {
      setFadeIn(false);
      setTimeout(() => { setPhase("app"); setFadeIn(true); }, 80);
    }
  }, [user]);

  function afterSplash() {
    if (user) {
      setPhase("app");
    } else if (hasOnboarded) {
      setPhase("auth");
    } else {
      setPhase("onboarding");
    }
  }

  function afterOnboarding() {
    localStorage.setItem(ONBOARDED_KEY, "1");
    setPhase("auth");
  }

  return (
    <>
      <style>{`
        @keyframes phaseIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
      `}</style>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {phase === "splash" && <Splash onDone={afterSplash} />}
        {phase === "onboarding" && <Onboarding onDone={afterOnboarding} />}
        {phase === "auth" && (
          <div style={{ padding: "1.25rem", height: "100%", boxSizing: "border-box", overflowY: "auto", animation: "phaseIn 0.4s ease" }}>
            <AuthScreen />
          </div>
        )}
        {phase === "app" && (
          <div style={{ height: "100%", animation: "phaseIn 0.35s ease" }}>
            <AppShell />
          </div>
        )}
      </div>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        minHeight: "100vh", background: "#0a0b10", padding: "1rem",
      }}>
        <div style={{
          width: 360, height: 700,
          borderRadius: 32, overflow: "hidden",
          background: "var(--color-background-primary)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
          position: "relative",
        }}>
          <FlowController />
        </div>
      </div>
    </AuthProvider>
  );
}
