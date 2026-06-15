import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api, getToken } from "./api";

const AppDataContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export function AppDataProvider({ children }) {
  const [wallet, setWallet]           = useState(null);
  const [numbers, setNumbers]         = useState([]);
  const [callLogs, setCallLogs]       = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [connected, setConnected]     = useState(false); // SSE live status
  const esRef = useRef(null);

  // ── Full fetch (called once on mount and on manual refresh) ───────────────
  const refresh = useCallback(async () => {
    setError("");
    try {
      const [balanceRes, numbersRes, logsRes, txRes] = await Promise.all([
        api.getBalance(),
        api.getMyNumbers(),
        api.getCallLogs(),
        api.getTransactions(),
      ]);
      setWallet(balanceRes);
      setNumbers(numbersRes.numbers || []);
      setCallLogs(logsRes.calls || []);
      setTransactions(txRes.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── SSE handler — patches state from push events ──────────────────────────
  function handleEvent(payload) {
    switch (payload.type) {

      case "WALLET_UPDATE":
        setWallet(prev => prev
          ? { ...prev, balance: payload.balance, currency: payload.currency }
          : { balance: payload.balance, currency: payload.currency }
        );
        break;

      case "TRANSACTION":
        setTransactions(prev => [{
          type: payload.tx_type,
          amount: payload.amount,
          reference: payload.reference,
          created_at: payload.created_at,
        }, ...prev].slice(0, 100));
        break;

      case "CALL_UPDATE":
        setCallLogs(prev => {
          const idx = prev.findIndex(c => c.id === payload.call_id);
          if (idx === -1) {
            // New call row
            return [{
              id: payload.call_id,
              status: payload.status,
              direction: payload.direction,
              to_number: payload.to_number,
              from_number: payload.from_number,
              duration_seconds: payload.duration_seconds,
              cost: payload.cost,
              created_at: payload.created_at,
            }, ...prev].slice(0, 100);
          }
          // Update existing call row in-place
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...payload, id: payload.call_id };
          return updated;
        });
        break;

      case "NUMBER_UPDATE":
        setNumbers(prev => {
          const idx = prev.findIndex(n => n.phone_number === payload.phone_number);
          if (idx === -1) return [payload, ...prev];
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...payload };
          return updated;
        });
        break;

      default:
        break;
    }
  }

  // ── Open SSE connection ───────────────────────────────────────────────────
  // EventSource doesn't support custom headers, so we pass the JWT as a
  // query param. The backend auth middleware checks req.query.token as fallback.
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const url = `${BASE_URL}/events?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        handleEvent(payload);
      } catch {
        // heartbeat comments ": ping" don't trigger onmessage, so this is safe
      }
    };

    es.onerror = () => {
      setConnected(false);
      // Browser auto-reconnects EventSource — we just reflect the status
    };

    return () => {
      es.close();
      esRef.current = null;
      setConnected(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial full load
  useEffect(() => {
    refresh();
  }, [refresh]);

  const primaryNumber = numbers.find(n => n.status === "active") || numbers[0] || null;

  return (
    <AppDataContext.Provider value={{
      wallet, numbers, primaryNumber,
      callLogs, transactions,
      loading, error, connected,
      refresh,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
