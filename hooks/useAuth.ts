"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
  });

  const supabase = createClient();

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      return data as Profile | null;
    },
    [supabase]
  );

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const profile = await fetchProfile(user.id);
        setState({ user, profile, isLoading: false });
      } else {
        setState({ user: null, profile: null, isLoading: false });
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({ user: session.user, profile, isLoading: false });
      } else if (event === "SIGNED_OUT") {
        setState({ user: null, profile: null, isLoading: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signInWithGoogle = async (returnTo?: string) => {
    const redirectTo = `${window.location.origin}/auth/callback${
      returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""
    }`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    ...state,
    signInWithGoogle,
    signOut,
    isAdmin: state.profile?.role === "admin",
    isInstructor:
      state.profile?.role === "instructor" || state.profile?.role === "admin",
    isStudent: state.profile?.role === "student",
  };
}
