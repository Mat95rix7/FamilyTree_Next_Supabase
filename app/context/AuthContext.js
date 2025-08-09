"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export function AuthProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [isActive, setIsActive] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Récupération de l'utilisateur et du profil
  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/auth/user", { cache: "no-store" });
      if (!res.ok) {
        setIsConnected(false);
        setRole(null);
        setUsername(null);
        setIsActive(null);
        return;
      }

      const data = await res.json();
      if (data?.user) {
        setIsConnected(true);
        setRole(data.profile?.role || "user");
        setUsername(data.profile?.username || data.user.email.split("@")[0]);
        setIsActive(data.profile?.isActive ?? false);
      } else {
        setIsConnected(false);
        setRole(null);
        setUsername(null);
        setIsActive(null);
      }
    } catch (err) {
      console.error("Erreur récupération profil:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // 🔹 Login
  const login = async ( email, password ) => {
    setIsLoading(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });
    setIsLoading(false);
    if (res.ok) {
      await fetchUserProfile();
      return true;
    }
    return false;
  };

  // 🔹 Register
  const register = async ( email, password, username ) => {
    setIsLoading(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", email, password, username }),
    });
    setIsLoading(false);
    if (res.ok) {
      await fetchUserProfile();
      return { success: true };
    }
    const error = await res.json();
    return { success: false, error: error.message };
  };

  // 🔹 Logout
  const logout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setIsConnected(false);
    setRole(null);
    setUsername(null);
    setIsActive(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isConnected,
        role,
        username,
        isActive,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
