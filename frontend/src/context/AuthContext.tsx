import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMe, login as loginRequest, type LoginPayload } from "../api/auth";
import { tokenStore } from "../api/tokenStore";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginError: string | null;
  isLoggingIn: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => !!tokenStore.getAccess());

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: async (data) => {
      tokenStore.setTokens(data.access, data.refresh);
      setHasToken(true);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const logout = useCallback(() => {
    tokenStore.clear();
    setHasToken(false);
    queryClient.clear();
  }, [queryClient]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      await loginMutation.mutateAsync(payload);
    },
    [loginMutation]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: hasToken ? meQuery.data ?? null : null,
      isLoading: hasToken && meQuery.isLoading,
      isAuthenticated: hasToken && !!meQuery.data && !meQuery.isError,
      login,
      loginError: loginMutation.error
        ? extractLoginError(loginMutation.error)
        : null,
      isLoggingIn: loginMutation.isPending,
      logout,
    }),
    [hasToken, meQuery.data, meQuery.isLoading, meQuery.isError, login, loginMutation.error, loginMutation.isPending, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function extractLoginError(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data as Record<string, unknown> | undefined;
    if (data) {
      if (typeof data.detail === "string") return data.detail;
      const first = Object.values(data)[0];
      if (Array.isArray(first)) return String(first[0]);
      if (typeof first === "string") return first;
    }
  }
  return "Login failed. Check your username and password.";
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
