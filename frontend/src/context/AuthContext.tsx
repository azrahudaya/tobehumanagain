import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setAccessToken, setRefreshHandler } from "../api/client";
import type { AuthSession, AuthUser } from "../types/api";

const ACCESS_TOKEN_STORAGE_KEY = "tbh_access_token";

type SignupStartPayload = {
  username: string;
  email: string;
  password: string;
};

type LoginPayload = {
  identifier: string;
  password: string;
};

type UpdateProfilePayload = {
  displayName?: string;
  email?: string;
  avatarDataUrl?: string | null;
  currentPassword?: string;
};

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

type OtpResponse = {
  message: string;
  debugOtp?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  startSignup: (payload: SignupStartPayload) => Promise<OtpResponse>;
  verifySignup: (email: string, code: string) => Promise<AuthUser>;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  refreshSession: () => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const persistToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const applySession = useCallback((session: AuthSession) => {
    setUser(session.user);
    setAccessTokenState(session.accessToken);
    setAccessToken(session.accessToken);
    persistToken(session.accessToken);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessTokenState(null);
    setAccessToken(null);
    persistToken(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await api.post<AuthSession>("/auth/refresh");
      applySession(data);
      return data.accessToken;
    } catch {
      clearSession();
      return null;
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    setRefreshHandler(refreshSession);
    return () => {
      setRefreshHandler(null);
    };
  }, [refreshSession]);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

      if (storedToken) {
        setAccessToken(storedToken);
        setAccessTokenState(storedToken);
        try {
          const { data } = await api.get<AuthUser>("/auth/me");
          setUser(data);
          setIsBootstrapping(false);
          return;
        } catch {
          // fallback to refresh token cookie
        }
      }

      await refreshSession();
      setIsBootstrapping(false);
    };

    void bootstrap();
  }, [refreshSession]);

  const startSignup = useCallback(async (payload: SignupStartPayload) => {
    const { data } = await api.post<OtpResponse>("/auth/signup/start", payload);
    return data;
  }, []);

  const verifySignup = useCallback(
    async (email: string, code: string) => {
      const { data } = await api.post<AuthSession>("/auth/signup/verify", { email, code });
      applySession(data);
      return data.user;
    },
    [applySession],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await api.post<AuthSession>("/auth/login", payload);
      applySession(data);
      return data.user;
    },
    [applySession],
  );

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const { data } = await api.patch<{ user: AuthUser; accessToken?: string }>("/auth/profile", payload);
    setUser(data.user);

    if (data.accessToken) {
      setAccessTokenState(data.accessToken);
      setAccessToken(data.accessToken);
      persistToken(data.accessToken);
    }

    return data.user;
  }, []);

  const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
    await api.post("/auth/password", payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isBootstrapping,
      startSignup,
      verifySignup,
      login,
      updateProfile,
      changePassword,
      refreshSession,
      logout,
    }),
    [
      user,
      accessToken,
      isBootstrapping,
      startSignup,
      verifySignup,
      login,
      updateProfile,
      changePassword,
      refreshSession,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
