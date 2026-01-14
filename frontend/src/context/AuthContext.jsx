import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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

  const setSession = async (accessToken) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);

    const me = await authService.me();
    const currentUser = me.user || me;
    setUser(currentUser);
  };

  const clearSession = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    const accessToken = data.accessToken || data.token;
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
