import { useEffect, useRef, useState } from "react";
import { Device } from "@twilio/voice-sdk";
import { PURPLE_LIGHT, PURPLE_DARK, GREEN, RED, RED as REDC } from "./ui";
import { useAppData } from "./AppDataContext";
import { api } from "./api";

const KEYPAD = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"],
  ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
  ["*", ""], ["0", "+"], ["#", ""],
];

const CALL_STATE = {
  IDLE: "idle",
  REQUESTING: "requesting", // checking balance + initializing device
  CONNECTING: "connecting", // ringing
  IN_CALL: "in-call",
  ENDED: "ended",
};

export default function Dialer() {
  const { wallet, primaryNumber, refresh } = useAppData();
  const [num, setNum] = useState("");
  const [callState, setCallState] = useState(CALL_STATE.IDLE);
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [muted, setMuted] = useState(false);

  const deviceRef = useRef(null);
  const connectionRef = useRef(null);
  const timerRef = useRef(null);

  // Clean up Twilio Device on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      connectionRef.current?.disconnect();
      deviceRef.current?.destroy();
    };
  }, []);

  function press(k) {
    if (callState !== CALL_STATE.IDLE) {
      // DTMF tone during an active call
      connectionRef.current?.sendDigits(k);
      return;
    }
    if (num.length >= 16) return;
    setNum(n => n + k);
  }

  function backspace() {
    if (callState !== CALL_STATE.IDLE) return;
    setNum(n => n.slice(0, -1));
  }

  async function ensureDevice() {
    if (deviceRef.current) return deviceRef.current;

    const { token } = await api.getVoiceToken();
    const device = new Device(token, { logLevel: "error" });

    device.on("error", (err) => {
      setErrorMsg(err.message || "Voice connection error");
      endCall();
    });

    await device.register();
    deviceRef.current = device;
    return device;
  }

  async function startCall() {
    if (!num) return;
    setErrorMsg("");

    if (!primaryNumber) {
      setErrorMsg("You need a virtual number before you can make calls.");
      return;
    }

    setCallState(CALL_STATE.REQUESTING);

    try {
      // Pre-flight balance check + create call_log row
      const to = num.startsWith("+") ? num : `+${num}`;
      const check = await api.outboundCheck(to);

      const device = await ensureDevice();

      setCallState(CALL_STATE.CONNECTING);

      const connection = await device.connect({
        params: {
          To: to,
          callLogId: String(check.call_log_id),
          From: primaryNumber.phone_number,
        },
      });

      connectionRef.current = connection;

      connection.on("accept", () => {
        setCallState(CALL_STATE.IN_CALL);
        let s = 0;
        timerRef.current = setInterval(() => { s++; setElapsed(s); }, 1000);
      });

      connection.on("disconnect", () => {
        endCall();
      });

      connection.on("cancel", () => {
        endCall();
      });

      connection.on("error", (err) => {
        setErrorMsg(err.message || "Call failed");
        endCall();
      });
    } catch (err) {
      setErrorMsg(err.message || "Could not start call");
      setCallState(CALL_STATE.IDLE);
    }
  }

  function endCall() {
    clearInterval(timerRef.current);
    connectionRef.current?.disconnect();
    connectionRef.current = null;
    setCallState(CALL_STATE.ENDED);
    setElapsed(0);
    setMuted(false);

    // Give the backend a moment to process the Twilio status callback, then refresh balance/logs
    setTimeout(() => {
      refresh();
      setCallState(CALL_STATE.IDLE);
      setNum("");
    }, 1500);
  }

  function toggleMute() {
    if (!connectionRef.current) return;
    const next = !muted;
    connectionRef.current.mute(next);
    setMuted(next);
  }

  const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const isActive = callState !== CALL_STATE.IDLE;
  const currencySymbol = wallet?.currency === "USD" ? "$" : (wallet?.currency || "");

  return (
    <div style={{ maxWidth: 250, margin: "0 auto" }}>
      {!isActive ? (
        <>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: 2, minHeight: 38 }}>{num}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
              {!primaryNumber
                ? "Get a virtual number to make calls"
                : num ? "Ready to call" : "Enter a number to call"}
            </div>
            {wallet && (
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 4 }}>
                Balance: {currencySymbol}{Number(wallet.balance).toFixed(2)}
              </div>
            )}
          </div>

          {errorMsg && (
            <div style={{ background: "#FCEBEB", color: RED, fontSize: 12, padding: "8px 10px", borderRadius: 8, marginBottom: "0.85rem", textAlign: "center" }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1rem" }}>
            {KEYPAD.map(([n, a]) => (
              <div key={n} onClick={() => press(n)} style={{
                background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "50%", width: 60, height: 60, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", cursor: "pointer", margin: "0 auto",
                userSelect: "none", transition: "transform 0.08s"
              }}>
                <span style={{ fontSize: 18, fontWeight: 500 }}>{n}</span>
                <span style={{ fontSize: 8, color: "var(--color-text-secondary)", letterSpacing: 1, marginTop: 1 }}>{a}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, alignItems: "center" }}>
            <div onClick={backspace} style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
            </div>
            <div onClick={startCall} style={{ width: 58, height: 58, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", cursor: primaryNumber && num ? "pointer" : "default", opacity: primaryNumber && num ? 1 : 0.5 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div style={{ width: 52, height: 52, visibility: "hidden" }} />
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: PURPLE_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 500, color: PURPLE_DARK, margin: "0 auto 1rem" }}>
            {num.slice(-4, -2) || "?"}
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 3 }}>{num}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
            {callState === CALL_STATE.REQUESTING && "Checking balance…"}
            {callState === CALL_STATE.CONNECTING && "Calling…"}
            {callState === CALL_STATE.IN_CALL && `Connected · ${fmtTime(elapsed)}`}
            {callState === CALL_STATE.ENDED && "Call ended"}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, alignItems: "center" }}>
            <div onClick={toggleMute} style={{
              width: 52, height: 52, borderRadius: "50%",
              background: muted ? "#FCEBEB" : "var(--color-background-secondary)",
              border: `0.5px solid ${muted ? RED : "var(--color-border-tertiary)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={muted ? RED : "var(--color-text-secondary)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </div>
            <div onClick={endCall} style={{ width: 58, height: 58, borderRadius: "50%", background: REDC, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91M23 1 1 23"/></svg>
            </div>
            <div style={{ width: 52, height: 52, visibility: "hidden" }} />
          </div>
        </div>
      )}
    </div>
  );
}
