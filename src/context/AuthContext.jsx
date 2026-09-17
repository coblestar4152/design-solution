import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function checkAdmin(currentSession) {
    if (!currentSession?.user) {
      setIsAdmin(false);
      return;
    }
    const { data, error } = await supabase
      .from("admins")
      .select("id")
      .eq("id", currentSession.user.id)
      .maybeSingle();

    setIsAdmin(!!data && !error);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      await checkAdmin(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        await checkAdmin(newSession);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) return { error: error.message };

    const { data: adminRow } = await supabase
      .from("admins")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!adminRow) {
      await supabase.auth.signOut();
      return { error: "This account is not authorized as an administrator." };
    }

    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const value = {
    session,
    user: session?.user || null,
    isAdmin,
    loading,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
