import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

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
    
    return authService.register(payload);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  };

  const forgotpassword = async (email) => {
    return authService.forgotPassword({ email });
  };
  
  const resetpassword = async (payload) => {  
    return authService.resetPassword(payload);
  }

 
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
    <AuthContext.Provider value={{ user, isReady, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
