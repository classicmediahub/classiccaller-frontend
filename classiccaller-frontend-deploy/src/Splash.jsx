import { useEffect, useState } from "react";

const NAVY   = "#0D0F1A";
const GOLD   = "#C9A84C";
const GOLD2  = "#E8C96A";
const CREAM  = "#F5F0E8";
const PURPLE = "#534AB7";

// ─── Animated concentric signal rings ────────────────────────────────────────
function SignalRings({ animate }) {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" style={{ display: "block" }}>
      {/* Outer rings — pulse outward */}
      {[90, 72, 54].map((r, i) => (
        <circle
          key={r} cx="110" cy="110" r={r}
          fill="none" stroke={GOLD} strokeWidth={i === 0 ? 1 : 1.5}
          strokeOpacity={animate ? 0 : 0.15 + i * 0.1}
          style={animate ? {
            animation: `ringPulse 2.4s ease-out ${i * 0.3}s infinite`,
          } : {}}
        />
      ))}
      {/* Inner filled circle */}
      <circle cx="110" cy="110" r="38"
        fill={GOLD} fillOpacity="0.12"
        style={animate ? { animation: "innerGlow 2.4s ease-in-out infinite" } : {}}
      />
      <circle cx="110" cy="110" r="28" fill={GOLD} fillOpacity="0.22" />
      {/* Phone icon */}
      <g transform="translate(110,110)">
        <path
          d="M-8 -10 C-8 -10 -6 -12 -3 -12 L3 -12 C6 -12 8 -10 8 -7 L8 -3 C8 0 6 2 3 2 L1 2 C-1 4 -1 7 1 9 L3 9 C6 9 8 11 8 14 L8 16 C8 19 6 21 3 21 L-2 21 C-5 21 -8 18 -8 15 L-8 -7 C-8 -8.6 -8 -10 -8 -10 Z"
          fill={GOLD}
          style={{ display: "none" }}
        />
        {/* Handset SVG path — clean minimal */}
        <path
          d="M-9 -8 C-7 -13 -2 -13 0 -11 L4 -5 C5 -3 4 -1 2 0 L0 1 C2 5 5 8 9 10 L10 8 C11 6 13 5 15 6 L21 10 C23 12 23 17 18 19 C10 22 -14 8 -16 -2 C-17 -6 -12 -10 -9 -8 Z"
          fill={GOLD}
          transform="scale(0.7) translate(-5,-8)"
        />
      </g>
    </svg>
  );
}

export default function Splash({ onDone }) {
  const [phase, setPhase] = useState("enter"); // enter → hold → exit

  useEffect(() => {
    // hold for 1.8s then start exit
    const t1 = setTimeout(() => setPhase("exit"), 1800);
    // call onDone after exit animation (0.5s)
    const t2 = setTimeout(() => onDone(), 2350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <>
      <style>{`
        @keyframes ringPulse {
          0%   { r: 38; stroke-opacity: 0.7; }
          100% { r: 95; stroke-opacity: 0; }
        }
        @keyframes innerGlow {
          0%, 100% { fill-opacity: 0.12; }
          50%       { fill-opacity: 0.22; }
        }
        @keyframes splashFadeIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes splashFadeOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(1.04); }
        }
        @keyframes wordmarkIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        position: "absolute", inset: 0,
        background: NAVY,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        animation: phase === "exit"
          ? "splashFadeOut 0.5s ease-in forwards"
          : "splashFadeIn 0.6s ease-out forwards",
        zIndex: 100,
      }}>
        {/* Signal rings logo */}
        <div style={{ animation: "splashFadeIn 0.7s ease-out 0.1s both" }}>
          <SignalRings animate />
        </div>

        {/* Wordmark */}
        <div style={{
          marginTop: "1.5rem", textAlign: "center",
          animation: "wordmarkIn 0.6s ease-out 0.5s both",
        }}>
          <div style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 28, fontWeight: 700,
            color: CREAM, letterSpacing: 1,
            lineHeight: 1.1,
          }}>
            Classic
          </div>
          <div style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 28, fontWeight: 400,
            color: GOLD, letterSpacing: 4,
            textTransform: "uppercase", fontSize: 14,
            marginTop: 2,
          }}>
            Caller
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          marginTop: "0.85rem", fontSize: 12,
          color: CREAM, opacity: 0.4,
          letterSpacing: 0.5, fontFamily: "inherit",
          animation: "wordmarkIn 0.6s ease-out 0.75s both",
        }}>
          Your number. Anywhere.
        </div>
      </div>
    </>
  );
}
