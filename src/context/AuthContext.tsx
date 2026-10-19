import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "../interface/user";
import { getMyProfile } from "../services/user.service";
import axios from "axios";

interface AuthProviderType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  saveUserToken: (token: string, user?: User) => void;
  removeUserToken: () => void;
}

const AuthContext = createContext<AuthProviderType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("user_token"));
  const profile = useQuery({
    queryKey: ["session", token],
    queryFn: getMyProfile,
    enabled: Boolean(token),
    retry: false,
    initialData: () => {
      if (!token) return undefined;
      try {
        const saved = JSON.parse(localStorage.getItem("user_info") || "null");
        return saved?._id ? saved as User : undefined;
      } catch { return undefined; }
    },
    initialDataUpdatedAt: 0,
  });

  useEffect(() => {
    if (profile.data && token) localStorage.setItem("user_info", JSON.stringify(profile.data));
  }, [profile.data, token]);
  const sessionExpired = axios.isAxiosError(profile.error) && profile.error.response?.status === 401;
  useEffect(() => {
    if (sessionExpired) {
      localStorage.removeItem("user_token");
      localStorage.removeItem("user_info");
    }
  }, [sessionExpired]);

  function saveUserToken(nextToken: string, user?: User) {
    if (nextToken !== token) client.clear();
    localStorage.setItem("user_token", nextToken);
    if (user) {
      localStorage.setItem("user_info", JSON.stringify(user));
      client.setQueryData(["session", nextToken], user);
    }
    setToken(nextToken);
  }

  function removeUserToken() {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_info");
    setToken(null);
    client.clear();
  }

  return <AuthContext.Provider value={{ token: sessionExpired ? null : token, user: token && !sessionExpired ? profile.data ?? null : null, isAuthenticated: Boolean(token) && !sessionExpired, saveUserToken, removeUserToken }}>{children}</AuthContext.Provider>;
}

// This hook is intentionally colocated with its private context.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}


