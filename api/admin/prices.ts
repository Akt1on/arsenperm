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

const priceItemSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().min(1),
  category_title: z.string().min(1),
  name: z.string().min(1),
  price: z.string().min(1),
  order: z.number().int().nonnegative().optional().default(0),
});
const payloadSchema = z.object({ items: z.array(priceItemSchema) });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const { isAdmin } = await requireAdmin(req);
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("price_items")
      .select("*")
      .order("category_title", { ascending: true })
      .order("order", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data ?? [] });
  }

  if (req.method === "PATCH") {
    const parsed = payloadSchema.safeParse(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const items = parsed.data.items.map((item) => ({ ...item, id: item.id || undefined }));

    const { error: upsertError } = await supabaseAdmin
      .from("price_items")
      .upsert(items, { onConflict: "id" });
    if (upsertError) return res.status(500).json({ error: upsertError.message });

    const ids = items.filter((item) => item.id).map((item) => item.id as string);
    if (ids.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from("price_items")
        .delete()
        .not("id", "in", `(${ids.map((id) => `'${id}'`).join(",")})`);
      if (deleteError) return res.status(500).json({ error: deleteError.message });
    } else {
      const { error: deleteError } = await supabaseAdmin.from("price_items").delete();
      if (deleteError) return res.status(500).json({ error: deleteError.message });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
