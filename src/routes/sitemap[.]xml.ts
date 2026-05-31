import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const BASE = "https://permasfalt59.ru";

const CITY_SLUGS = [
  "perm","krasnokamsk","berezniki","solikamsk","chaykovskiy",
  "kungur","lysva","chusovoy","dobryanka","osa","nytva",
  "vereshchagino","perm-rayon",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        const [{ data: services }, { data: projects }, { data: posts }] =
          await Promise.all([
            supabase.from("services").select("slug,updated_at").eq("is_active", true),
            supabase.from("projects").select("slug,updated_at").eq("is_active", true),
            supabase.from("posts").select("slug,updated_at").eq("is_published", true),
          ]);

        type Entry = { loc: string; lastmod?: string; changefreq: string; priority: string };

        const entries: Entry[] = [
          // Core pages — highest priority
          { loc: "/",         priority: "1.0", changefreq: "weekly",  lastmod: now },
          { loc: "/services", priority: "0.95", changefreq: "weekly", lastmod: now },
          { loc: "/goroda",   priority: "0.90", changefreq: "monthly", lastmod: now },
          { loc: "/tseny",    priority: "0.90", changefreq: "monthly", lastmod: now },
          { loc: "/portfolio",priority: "0.85", changefreq: "weekly",  lastmod: now },
          { loc: "/blog",     priority: "0.80", changefreq: "weekly",  lastmod: now },
          { loc: "/contacts", priority: "0.75", changefreq: "monthly", lastmod: now },
          { loc: "/about",    priority: "0.65", changefreq: "monthly", lastmod: now },
          { loc: "/privacy-policy", priority: "0.20", changefreq: "yearly", lastmod: now },
          { loc: "/cookie-policy",  priority: "0.10", changefreq: "yearly", lastmod: now },

          // City geo-pages — high SEO priority
          ...CITY_SLUGS.map((slug) => ({
            loc: `/goroda/${slug}`,
            priority: "0.88",
            changefreq: "monthly",
            lastmod: now,
          })),

          // Service pages (dynamic)
          ...(services ?? []).map((s: any) => ({
            loc: `/services/${s.slug}`,
            lastmod: s.updated_at
              ? new Date(s.updated_at).toISOString().split("T")[0]
              : now,
            priority: "0.88",
            changefreq: "monthly",
          })),

          // Portfolio pages
          ...(projects ?? []).map((p: any) => ({
            loc: `/portfolio/${p.slug}`,
            lastmod: p.updated_at
              ? new Date(p.updated_at).toISOString().split("T")[0]
              : now,
            priority: "0.70",
            changefreq: "monthly",
          })),

          // Blog posts
          ...(posts ?? []).map((p: any) => ({
            loc: `/blog/${p.slug}`,
            lastmod: p.updated_at
              ? new Date(p.updated_at).toISOString().split("T")[0]
              : now,
            priority: "0.78",
            changefreq: "monthly",
          })),
        ];

        const urlTags = entries
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE}${e.loc}</loc>`,
              e.lastmod     ? `    <lastmod>${e.lastmod}</lastmod>` : null,
              e.changefreq  ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority    ? `    <priority>${e.priority}</priority>` : null,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n")
          )
          .join("\n");

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset`,
          `  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
          `  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
          `  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9`,
          `    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`,
          urlTags,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type":  "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
            "X-Robots-Tag":  "noindex",
          },
        });
      },
    },
  },
});
