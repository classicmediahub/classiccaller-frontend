import { useState, useRef } from "react";

const NAVY   = "#0D0F1A";
const NAVY2  = "#161929";
const GOLD   = "#C9A84C";
const GOLD2  = "#E8C96A";
const CREAM  = "#F5F0E8";
const PURPLE = "#534AB7";
const MUTED  = "#6B7280";

// ─── Slide illustrations ──────────────────────────────────────────────────────

function IllustrationNumber() {
  // A floating virtual SIM card with signal arcs above it
  return (
    <svg width="200" height="180" viewBox="0 0 200 180">
      {/* Signal arcs */}
      {[55, 42, 30].map((r, i) => (
        <path key={r}
          d={`M ${100-r} 60 A ${r} ${r} 0 0 1 ${100+r} 60`}
          fill="none" stroke={GOLD} strokeWidth={2 - i * 0.4}
          strokeOpacity={0.3 + i * 0.25} strokeLinecap="round"
        />
      ))}
      {/* SIM card body */}
      <rect x="55" y="72" width="90" height="68" rx="8" fill={NAVY2} stroke={GOLD} strokeWidth="1.5" />
      {/* SIM chip */}
      <rect x="72" y="87" width="28" height="22" rx="3" fill={GOLD} fillOpacity="0.25" stroke={GOLD} strokeWidth="1" />
      <line x1="72" y1="96" x2="100" y2="96" stroke={GOLD} strokeWidth="0.8" strokeOpacity="0.5"/>
      <line x1="83" y1="87" x2="83" y2="109" stroke={GOLD} strokeWidth="0.8" strokeOpacity="0.5"/>
      <line x1="89" y1="87" x2="89" y2="109" stroke={GOLD} strokeWidth="0.8" strokeOpacity="0.5"/>
      {/* Phone number placeholder */}
      <rect x="108" y="89" width="28" height="5" rx="2.5" fill={CREAM} fillOpacity="0.15"/>
      <rect x="108" y="99" width="20" height="5" rx="2.5" fill={CREAM} fillOpacity="0.10"/>
      <rect x="108" y="109" width="24" height="5" rx="2.5" fill={CREAM} fillOpacity="0.10"/>
      {/* CC label */}
      <text x="100" y="156" textAnchor="middle" fill={GOLD} fontSize="10" fontFamily="Georgia, serif" opacity="0.7">+234 •• •• ••</text>
    </svg>
  );
}

function IllustrationCall() {
  // Globe with a call arc connecting two points
  return (
    <svg width="200" height="180" viewBox="0 0 200 180">
      {/* Globe circle */}
      <circle cx="100" cy="90" r="52" fill="none" stroke={GOLD} strokeWidth="1" strokeOpacity="0.2"/>
      <circle cx="100" cy="90" r="52" fill={NAVY2} />
      {/* Globe grid lines */}
      <ellipse cx="100" cy="90" rx="28" ry="52" fill="none" stroke={GOLD} strokeWidth="0.6" strokeOpacity="0.2"/>
      <ellipse cx="100" cy="90" rx="52" ry="20" fill="none" stroke={GOLD} strokeWidth="0.6" strokeOpacity="0.2"/>
      <ellipse cx="100" cy="90" rx="52" ry="38" fill="none" stroke={GOLD} strokeWidth="0.6" strokeOpacity="0.2"/>
      <line x1="48" y1="90" x2="152" y2="90" stroke={GOLD} strokeWidth="0.6" strokeOpacity="0.2"/>
      <line x1="100" y1="38" x2="100" y2="142" stroke={GOLD} strokeWidth="0.6" strokeOpacity="0.2"/>
      {/* Clipping */}
      <circle cx="100" cy="90" r="52" fill="none" stroke={GOLD} strokeWidth="1.5" strokeOpacity="0.35"/>
      {/* Point A — Nigeria */}
      <circle cx="118" cy="100" r="4" fill={GOLD}/>
      <circle cx="118" cy="100" r="8" fill={GOLD} fillOpacity="0.2"/>
      {/* Point B — remote */}
      <circle cx="68" cy="72" r="4" fill={PURPLE} fillOpacity="0.9"/>
      <circle cx="68" cy="72" r="8" fill={PURPLE} fillOpacity="0.2"/>
      {/* Call arc between them */}
      <path d="M 68 72 Q 93 44 118 100" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round"/>
      {/* Arrowhead */}
      <polygon points="118,100 112,93 120,92" fill={GOLD}/>
    </svg>
  );
}

function IllustrationWallet() {
  // Wallet with coin stack, clean geometric style
  return (
    <svg width="200" height="180" viewBox="0 0 200 180">
      {/* Wallet body */}
      <rect x="42" y="68" width="116" height="76" rx="10" fill={NAVY2} stroke={GOLD} strokeWidth="1.5"/>
      {/* Wallet flap top */}
      <rect x="42" y="56" width="116" height="24" rx="10" fill={NAVY2} stroke={GOLD} strokeWidth="1" strokeOpacity="0.5"/>
      {/* Coin pocket */}
      <rect x="112" y="84" width="38" height="38" rx="8" fill={GOLD} fillOpacity="0.12" stroke={GOLD} strokeWidth="1"/>
      <circle cx="131" cy="103" r="11" fill={GOLD} fillOpacity="0.2" stroke={GOLD} strokeWidth="1"/>
      <text x="131" y="107" textAnchor="middle" fill={GOLD} fontSize="10" fontFamily="Georgia,serif" fontWeight="700">₦</text>
      {/* Card lines */}
      <rect x="56" y="86" width="46" height="6" rx="3" fill={CREAM} fillOpacity="0.18"/>
      <rect x="56" y="98" width="32" height="5" rx="2.5" fill={CREAM} fillOpacity="0.10"/>
      <rect x="56" y="110" width="38" height="5" rx="2.5" fill={CREAM} fillOpacity="0.10"/>
      {/* Top glow line */}
      <line x1="62" y1="56" x2="138" y2="56" stroke={GOLD2} strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Slide data ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    Illustration: IllustrationNumber,
    headline: "Your own\nphone number",
    body: "Get a real virtual number in seconds — no SIM card, no paperwork, no waiting.",
    cta: null,
  },
  {
    Illustration: IllustrationCall,
    headline: "Call anyone,\nanywhere",
    body: "Crystal-clear calls over the internet. Reach numbers across Nigeria and beyond.",
    cta: null,
  },
  {
    Illustration: IllustrationWallet,
    headline: "Top up,\ncall freely",
    body: "Recharge your wallet anytime. Pay only for what you use, billed by the minute.",
    cta: "Get started",
  },
];

export default function Onboarding({ onDone }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = back
  const [animating, setAnimating] = useState(false);
  const touchStart = useRef(null);

  function goTo(next) {
    if (animating || next === idx) return;
    setDir(next > idx ? 1 : -1);
    setAnimating(true);
    setTimeout(() => {
      setIdx(next);
      setAnimating(false);
    }, 280);
  }

  function next() {
    if (idx < SLIDES.length - 1) goTo(idx + 1);
    else onDone();
  }

  function onTouchStart(e) {
    touchStart.current = e.touches[0].clientX;
  }
  function onTouchEnd(e) {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (dx < -40 && idx < SLIDES.length - 1) goTo(idx + 1);
    if (dx > 40 && idx > 0) goTo(idx - 1);
  }

  const { Illustration, headline, body, cta } = SLIDES[idx];

  return (
    <>
      <style>{`
        @keyframes slideInRight  { from { opacity:0; transform: translateX(48px);  } to { opacity:1; transform: translateX(0); } }
        @keyframes slideInLeft   { from { opacity:0; transform: translateX(-48px); } to { opacity:1; transform: translateX(0); } }
        @keyframes slideOutRight { from { opacity:1; transform: translateX(0); } to { opacity:0; transform: translateX(48px);  } }
        @keyframes slideOutLeft  { from { opacity:1; transform: translateX(0); } to { opacity:0; transform: translateX(-48px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div
        style={{
          position: "absolute", inset: 0, background: NAVY,
          display: "flex", flexDirection: "column",
          userSelect: "none",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Skip */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem 1.25rem 0" }}>
          <span
            onClick={onDone}
            style={{ fontSize: 12, color: CREAM, opacity: 0.4, cursor: "pointer", letterSpacing: 0.5 }}
          >
            Skip
          </span>
        </div>

        {/* Illustration area */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          animation: animating
            ? `${dir > 0 ? "slideOutLeft" : "slideOutRight"} 0.28s ease-in forwards`
            : `${dir > 0 ? "slideInRight" : "slideInLeft"} 0.32s ease-out forwards`,
        }}>
          <Illustration />
        </div>

        {/* Text + controls */}
        <div style={{ padding: "0 2rem 2.5rem", textAlign: "center" }}>
          {/* Headline */}
          <div
            key={`h-${idx}`}
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 26, fontWeight: 700, color: CREAM,
              lineHeight: 1.2, whiteSpace: "pre-line",
              marginBottom: "0.85rem",
              animation: "fadeUp 0.35s ease-out 0.1s both",
            }}
          >
            {headline}
          </div>

          {/* Body */}
          <div
            key={`b-${idx}`}
            style={{
              fontSize: 13, color: CREAM, opacity: 0.55,
              lineHeight: 1.65, marginBottom: "2rem",
              animation: "fadeUp 0.35s ease-out 0.2s both",
            }}
          >
            {body}
          </div>

          {/* Dot indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: "1.75rem" }}>
            {SLIDES.map((_, i) => (
              <div
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === idx ? 22 : 7, height: 7, borderRadius: 4,
                  background: i === idx ? GOLD : CREAM,
                  opacity: i === idx ? 1 : 0.22,
                  cursor: "pointer",
                  transition: "width 0.3s ease, background 0.3s ease, opacity 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* CTA button */}
          <button
            onClick={next}
            style={{
              width: "100%", padding: "13px 0",
              background: cta ? GOLD : "transparent",
              color: cta ? NAVY : CREAM,
              border: cta ? "none" : `1.5px solid ${CREAM}26`,
              borderRadius: 12, fontSize: 14, fontWeight: 600,
              fontFamily: "inherit", cursor: "pointer",
              letterSpacing: 0.3,
              transition: "all 0.2s",
            }}
          >
            {cta || "Next →"}
          </button>
        </div>
      </div>
    </>
  );
}
