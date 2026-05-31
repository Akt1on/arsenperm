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

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  short: z.string().min(1),
  priceFrom: z.string().min(1),
  icon: z.string().min(1),
  hero: z.string().min(1),
  description: z.string().min(1),
  includes: z.array(z.string()).optional().default([]),
  faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).optional().default([]),
  imageUrl: z.string().nullable().optional(),
  order: z.number().int().nonnegative().optional().default(0),
});

const payloadSchema = z.object({ services: z.array(serviceSchema) });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const { isAdmin } = await requireAdmin(req);
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .order("order", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ services: data ?? [] });
  }

  if (req.method === "PATCH") {
    const parsed = payloadSchema.safeParse(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const services = parsed.data.services.map((service) => ({
      ...service,
      id: service.id || undefined,
    }));

    const { error: upsertError } = await supabaseAdmin
      .from("services")
      .upsert(services, { onConflict: "id" });
    if (upsertError) return res.status(500).json({ error: upsertError.message });

    const ids = services.filter((item) => item.id).map((item) => item.id as string);
    if (ids.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from("services")
        .delete()
        .not("id", "in", `(${ids.map((id) => `'${id}'`).join(",")})`);
      if (deleteError) return res.status(500).json({ error: deleteError.message });
    } else {
      const { error: deleteError } = await supabaseAdmin.from("services").delete();
      if (deleteError) return res.status(500).json({ error: deleteError.message });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
