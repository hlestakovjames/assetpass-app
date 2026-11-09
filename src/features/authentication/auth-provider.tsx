"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  login as authenticate,
  logout as endSession,
  restoreSession,
  subscribeToAuth,
  type AuthenticatedUser,
  type LoginResponse,
} from "./auth-client";

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

type AuthContextValue = {
  user: AuthenticatedUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  retrySessionRestore: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const unsubscribe = subscribeToAuth((nextUser) => {
      setUser(nextUser);
      setStatus(nextUser ? "authenticated" : "unauthenticated");
    });

    restoreSession()
      .then((restoredUser) => {
        setUser(restoredUser);
        setStatus(
          restoredUser ? "authenticated" : "unauthenticated",
        );
      })
      .catch(() => {
        setStatus("error");
      });

    return unsubscribe;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setStatus("loading");

      try {
        const result = await authenticate(email, password);
        setUser(result.user);
        setStatus("authenticated");
        return result;
      } catch (error) {
        setStatus("unauthenticated");
        throw error;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await endSession();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const retrySessionRestore = useCallback(async () => {
    setStatus("loading");

    try {
      const restoredUser = await restoreSession();
      setUser(restoredUser);
      setStatus(
        restoredUser ? "authenticated" : "unauthenticated",
      );
    } catch {
      setStatus("error");
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      login,
      logout,
      retrySessionRestore,
    }),
    [user, status, login, logout, retrySessionRestore],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
