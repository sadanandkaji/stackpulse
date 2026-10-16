import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "../lib/api";

export interface User {
  id: number;
  email: string;
  createdAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from a stored token
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api<{ user: User }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = (r: AuthResponse) => {
    tokenStore.set(r.token);
    setUser(r.user);
  };

  const login = async (email: string, password: string) =>
    handleAuth(await api<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }));

  const signup = async (email: string, password: string) =>
    handleAuth(await api<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) }));

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}