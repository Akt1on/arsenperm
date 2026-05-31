import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAdmin } from "../_lib/auth";
import { supabaseAdmin } from "../_lib/supabase-admin";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://permasfalt59.ru";
function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

const siteSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  url: z.string().min(1),
  phone: z.string().min(1),
  phoneRaw: z.string().min(1),
  address: z.string().min(1),
  hours: z.string().min(1),
  whatsapp: z.string().min(1),
  telegram: z.string().min(1),
  vk: z.string().min(1),
  max: z.string().min(1),
  email: z.string().email(),
  yearFounded: z.number().int().positive(),
  geo: z.object({ lat: z.number(), lng: z.number() }),
  legal: z.object({ name: z.string().min(1), ogrn: z.string().min(1), inn: z.string().min(1) }),
  yandexMapEmbed: z.string().min(1),
});
const payloadSchema = z.object({ settings: siteSchema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const { isAdmin } = await requireAdmin(req);
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("id", "main")
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ settings: data?.data ?? null });
  }

  if (req.method === "PATCH") {
    const parsed = payloadSchema.safeParse(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ id: "main", data: parsed.data.settings }, { onConflict: "id" });
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
