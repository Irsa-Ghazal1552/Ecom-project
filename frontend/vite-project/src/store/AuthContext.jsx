import { createContext, useContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const persistUser = (nextUser, token) => {
    setUser(nextUser);
    if (token) localStorage.setItem("token", token);
    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      await API.post("/auth/signup", payload);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.response?.data?.message || "Signup failed" };
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload, adminMode = false) => {
    setLoading(true);
    try {
      const path = adminMode ? "/auth/admin/login" : "/auth/login";
      const res = await API.post(path, payload);
      persistUser(res.data.user, res.data.token);
      return { ok: true };
    } catch (error) {
      const fallback = adminMode
        ? "Admin login failed. If this is a normal account, switch off admin mode."
        : "Login failed. Check your email/password or create an account first.";
      return { ok: false, message: error.response?.data?.message || fallback };
    } finally {
      setLoading(false);
    }
  };

  const bootstrapAdmin = async (payload) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/bootstrap-admin", payload);
      return { ok: true, data: res.data };
    } catch (error) {
      return { ok: false, message: error.response?.data?.message || "Failed to create admin" };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await API.get("/users/me");
      const nextUser = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role
      };
      persistUser(nextUser, token);
    } catch {
      persistUser(null);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const logout = () => persistUser(null);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refreshProfile, bootstrapAdmin }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
