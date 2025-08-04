"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const AuthContext = createContext();
export default AuthContext;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const updateUserState = async (supabaseUser, session = null) => {
    if (!supabaseUser) {
      setIsConnected(false);
      setRole(null);
      setToken(null);
      setUsername(null);
      return;
    }

    // 🔽 Lecture du profil (role + username)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, username")
      .eq("id", supabaseUser.id)
      .single();

    if (error) {
      console.warn("Erreur récupération profil:", error.message);
    }

    setIsConnected(true);
    setToken(session?.access_token || null);
    setRole(profile?.role || "user");
    setUsername(profile?.display_name || profile?.username || supabaseUser.email.split("@")[0]);
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) await updateUserState(session.user, session);
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (["SIGNED_IN", "TOKEN_REFRESHED"].includes(event) && session?.user) {
          await updateUserState(session.user, session);
        } else if (event === "SIGNED_OUT") {
          await updateUserState(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async ({ email, password }) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Login failed:", error.message);
      setIsLoading(false);
      return false;
    }

    if (data.session?.user) await updateUserState(data.session.user, data.session);
    setIsLoading(false);
    return true;
  };

  const register = async ({ email, password, username }) => {
    setIsLoading(true);
    
    try {
      // 1. Créer le compte utilisateur
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username // Métadonnées utilisateur optionnelles
          }
        }
      });

      if (error) {
        console.error("Registration failed:", error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      // 2. Mise à jour de l’état utilisateur si session active
      if (data.session?.user) {
        await updateUserState(data.session.user, data.session);
      }

      setIsLoading(false);
      return { 
        success: true, 
        message: data.user?.email_confirmed_at ? 
          "Compte créé avec succès !" : 
          "Compte créé ! Vérifiez votre email pour confirmer votre inscription."
      };

    } catch (err) {
      console.error("Erreur inattendue lors de l'inscription:", err);
      setIsLoading(false);
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // setIsConnected(false);
    // setToken(null);
    // setRole(null);
    // setUsername(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        isConnected,
        isLoading,
        token,
        role,
        username,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};