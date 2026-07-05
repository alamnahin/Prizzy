import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileChannelRef = useRef(null);
  const initialSessionHandled = useRef(false);

  const enrichUser = async (authUser) => {
    if (!authUser) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, phone, role, avatar_url, is_banned")
      .eq("id", authUser.id)
      .maybeSingle();

    return {
      ...authUser,
      name:
        profile?.name ||
        authUser.user_metadata?.name ||
        authUser.email?.split("@")[0] ||
        "User",
      phone: profile?.phone || authUser.user_metadata?.phone || "",
      role: profile?.role || "customer",
      avatar_url: profile?.avatar_url || null,
      is_banned: profile?.is_banned || false,
    };
  };

  const subscribeToProfile = (userId) => {
    if (profileChannelRef.current) {
      supabase.removeChannel(profileChannelRef.current);
    }

    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user) {
            const enriched = await enrichUser(session.user);
            // If admin banned this user while they were logged in, kick them out
            if (enriched?.is_banned) {
              unsubscribeFromProfile();
              await supabase.auth.signOut();
              setUser(null);
              return;
            }
            setUser(enriched);
          }
        },
      )
      .subscribe();

    profileChannelRef.current = channel;
  };

  const unsubscribeFromProfile = () => {
    if (profileChannelRef.current) {
      supabase.removeChannel(profileChannelRef.current);
      profileChannelRef.current = null;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      try {
        const authUser = data?.session?.user ?? null;
        const enriched = await enrichUser(authUser);

        if (enriched?.is_banned) {
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(enriched);
          if (enriched) subscribeToProfile(enriched.id);
        }
      } catch (err) {
        console.error("AuthContext: failed to enrich initial session", err);
      } finally {
        initialSessionHandled.current = true;
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!initialSessionHandled.current) return;
        if (event === "INITIAL_SESSION") return;

        try {
          const authUser = session?.user ?? null;
          const enriched = await enrichUser(authUser);

          if (enriched?.is_banned) {
            unsubscribeFromProfile();
            await supabase.auth.signOut();
            setUser(null);
            return;
          }

          setUser(enriched);
          if (enriched) {
            subscribeToProfile(enriched.id);
          } else {
            unsubscribeFromProfile();
          }
        } catch (err) {
          console.error(
            "AuthContext: onAuthStateChange enrichUser failed",
            err,
          );
        }
      },
    );

    return () => {
      sub.subscription.unsubscribe();
      unsubscribeFromProfile();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login — blocks banned accounts ───────────────────────────────
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, error: error.message };

    const enriched = await enrichUser(data.user);

    if (enriched?.is_banned) {
      await supabase.auth.signOut();
      return {
        success: false,
        error:
          "Your account has been suspended. Please contact support for assistance.",
      };
    }

    setUser(enriched);
    subscribeToProfile(enriched.id);
    return { success: true, role: enriched.role };
  };

  // ── Register ──────────────────────────────────────────────────────
  const register = async ({
    email,
    password,
    name,
    phone,
    role = "customer",
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, role } },
    });
    if (error) return { success: false, error: error.message };

    await new Promise((r) => setTimeout(r, 1500));
    const enriched = await enrichUser(data.user);
    setUser(enriched);
    if (enriched) subscribeToProfile(enriched.id);
    return { success: true, role: enriched?.role };
  };

  // ── Logout ────────────────────────────────────────────────────────
  const logout = async () => {
    unsubscribeFromProfile();
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
