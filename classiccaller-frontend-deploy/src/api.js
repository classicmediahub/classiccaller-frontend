const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("classiccaller_token");
}

function setToken(token) {
  if (token) localStorage.setItem("classiccaller_token", token);
  else localStorage.removeItem("classiccaller_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const message = data?.error || data?.errors?.[0]?.msg || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  register: (email, password, full_name) =>
    request("/auth/register", { method: "POST", body: { email, password, full_name }, auth: false }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  getBalance: () => request("/wallet/balance"),
  recharge: (amount, reference) => request("/wallet/recharge", { method: "POST", body: { amount, reference } }),
  getTransactions: () => request("/wallet/transactions"),
  provisionNumber: (country = "NG") => request("/numbers/provision", { method: "POST", body: { country } }),
  getMyNumbers: () => request("/numbers/me"),
  outboundCheck: (to) => request("/calls/outbound", { method: "POST", body: { to } }),
  getCallLogs: () => request("/calls/logs"),
};

export { getToken, setToken };
