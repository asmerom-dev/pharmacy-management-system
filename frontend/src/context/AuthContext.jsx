import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../api";

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: () => {},
  changePassword: async () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("luna_auth_token") || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("luna_auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on app start
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem("luna_auth_token");
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiFetch("/api/auth/verify", {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(savedToken);
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.warn("Auth verification network error, keeping cached session:", err);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (username, password) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("luna_auth_token", data.token);
    localStorage.setItem("luna_auth_user", JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("luna_auth_token");
    localStorage.removeItem("luna_auth_user");
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!token) throw new Error("Not authenticated");

    const res = await apiFetch("/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to change password");
    }
    return data.message;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
