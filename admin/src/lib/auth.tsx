import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { api, ApiError, setCsrfToken, setUnauthorizedHandler } from "./api";
import type { Permission, User } from "./types";

interface MeResponse {
  user: User;
  csrfToken: string;
}

interface AuthValue {
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  can(permission: Permission): boolean;
  refresh(): Promise<unknown>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const res = await api<MeResponse>("/api/auth/me");
        setCsrfToken(res.csrfToken);
        return res.user;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });

  // Any 401 (expired or revoked session) drops back to the sign-in screen.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      qc.setQueryData(["me"], null);
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" });
    });
  }, [qc]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api<MeResponse>("/api/auth/login", { method: "POST", body: { email, password } });
      setCsrfToken(res.csrfToken);
      qc.setQueryData(["me"], res.user);
    },
    [qc],
  );

  const logout = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setCsrfToken("");
    qc.clear();
    qc.setQueryData(["me"], null);
  }, [qc]);

  const value = useMemo<AuthValue>(
    () => ({
      user: me.data ?? null,
      loading: me.isLoading,
      login,
      logout,
      can: (p) => !!me.data?.permissions.includes(p),
      refresh: () => me.refetch(),
    }),
    [me, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
