import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Primary admin email — change in Supabase SQL if needed (see supabase/README.md)
const ADMIN_EMAIL = "permsite1@gmail.com";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;

    const checkAdmin = async (u: User | null) => {
      if (!u) { if (alive) setIsAdmin(false); return; }
      // Fast path: email whitelist
      if (u.email === ADMIN_EMAIL) { if (alive) setIsAdmin(true); return; }
      // Slow path: user_roles table (for additional admins added via SQL)
      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", u.id)
          .eq("role", "admin")
          .maybeSingle();
        if (alive) setIsAdmin(!!data);
      } catch {
        if (alive) setIsAdmin(false);
      }
    };

    const applySession = (sess: Session | null) => {
      if (!alive) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
      checkAdmin(sess?.user ?? null);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setTimeout(() => applySession(sess), 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user, isAdmin, loading };
}
