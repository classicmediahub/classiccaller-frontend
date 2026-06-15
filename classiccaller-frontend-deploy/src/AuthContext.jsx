import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const stored = localStorage.getItem("classiccaller_user");
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const data = await api.login(email, password);
    setToken(data.token);
    localStorage.setItem("classiccaller_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(email, password, full_name) {
    const data = await api.register(email, password, full_name);
    setToken(data.token);
    localStorage.setItem("classiccaller_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setToken(null);
    localStorage.removeItem("classiccaller_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
