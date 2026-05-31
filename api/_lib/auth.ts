import type { VercelRequest } from "@vercel/node";
import { supabaseAdmin } from "./supabase-admin";

export async function getUserFromRequest(req: VercelRequest) {
  const auth = req.headers.authorization || req.headers.Authorization;
  const header = Array.isArray(auth) ? auth[0] : auth;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function requireAdmin(req: VercelRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return { user: null, isAdmin: false };
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  return { user, isAdmin: !!data };
}
