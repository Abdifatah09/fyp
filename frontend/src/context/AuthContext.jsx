import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { gamificationService } from "../services/gamificationService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null); 
  const [isReady, setIsReady] = useState(false);

  const [pendingVerifyEmail, setPendingVerifyEmailState] = useState(
    localStorage.getItem("pendingVerifyEmail") || ""
  );

  const setPendingVerifyEmail = (email) => {
    const value = email || "";
    setPendingVerifyEmailState(value);
    if (value) localStorage.setItem("pendingVerifyEmail", value);
    else localStorage.removeItem("pendingVerifyEmail");
  };

  const clearPendingVerifyEmail = () => {
    setPendingVerifyEmail("");
  };

  const refreshStats = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const data = await gamificationService.me();
    const normalized = data?.stats || data || null;
    setStats(normalized);
    return normalized;
  };

  const updateStats = (nextStats) => {
    if (nextStats) setStats(nextStats);
  };

  const setSession = async (accessToken) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);

    const me = await authService.me();
    const currentUser = me.user || me;
    setUser(currentUser);

    try {
      await refreshStats();
    } catch {
      setStats(null);
    }
  };

  const clearSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setStats(null); 
  };

  const login = async (email, password) => {
    const data = await authService.login({ email, password });

    const accessToken = data.accessToken || data.token;
    const refreshToken = data.refreshToken;

    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    await setSession(accessToken);

    return data;
  };

  const register = async (payload) => {
    const res = await authService.register(payload);
    setPendingVerifyEmail(payload?.email || res?.email || "");
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  };

  const forgotpassword = async (email) => {
    setPendingVerifyEmail(email);
    return authService.forgotPassword({ email });
  };

  const resetpassword = async (payload) => {
    return authService.resetPassword(payload);
  };

  const verifyEmail = async ({ email, code }) => {
    const res = await authService.verifyEmail({ email, code });
    clearPendingVerifyEmail();
    return res;
  };

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsReady(true);
        return;
      }
      try {
        await setSession(token);
      } catch {
        clearSession();
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        stats, // ✅ expose stats
        isReady,

        login,
        register,
        logout,

        forgotpassword,
        resetpassword,

        pendingVerifyEmail,
        setPendingVerifyEmail,
        clearPendingVerifyEmail,
        verifyEmail,

        refreshStats, // ✅ expose helpers
        updateStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}