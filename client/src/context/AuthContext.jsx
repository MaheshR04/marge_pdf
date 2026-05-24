import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginUser, registerUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      localStorage.removeItem("user");
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  // When true, the Dashboard shows a "session expired — please login again" modal
  const [sessionExpired, setSessionExpired] = useState(false);

  const persistAuth = (payload) => {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem("token", payload.token);
    localStorage.setItem("user", JSON.stringify(payload.user));
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await loginUser(credentials);
      persistAuth(data);
      setSessionExpired(false);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const data = await registerUser(formData);
      persistAuth(data);
      setSessionExpired(false);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    setSessionExpired(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Called after profile update — API returns { user, token, message }
  const updateUser = (data) => {
    const updatedUser = data.user || data;
    const updatedToken = data.token || token;
    setUser(updatedUser);
    setToken(updatedToken);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("token", updatedToken);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      // Don't immediately logout — show a re-login prompt instead
      setSessionExpired(true);
    };

    window.addEventListener("app-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("app-unauthorized", handleUnauthorized);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      sessionExpired,
      isAuthenticated: Boolean(token) && !sessionExpired,
      login,
      register,
      logout,
      updateUser,
      dismissSessionExpired: () => setSessionExpired(false),
    }),
    [token, user, loading, sessionExpired]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
