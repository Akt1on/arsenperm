import { useQuery } from "@tanstack/react-query";
import type { ComponentType } from "react";
import {
  Construction,
  Wrench,
  LayoutGrid,
  Shovel,
  Trash2,
  Truck,
  Hammer,
  Snowflake,
  PackageOpen,
  Trees,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SERVICES as FALLBACK_SERVICES } from "@/data/services";
import { PRICE_CATEGORIES as FALLBACK_PRICE_CATEGORIES } from "@/data/prices";
import { GALLERY as FALLBACK_GALLERY } from "@/data/gallery";
import { SITE as FALLBACK_SITE } from "@/data/site";

export const SERVICE_ICON_MAP = {
  construction: Construction,
  wrench: Wrench,
  "layout-grid": LayoutGrid,
  shovel: Shovel,
  trash: Trash2,
  truck: Truck,
  hammer: Hammer,
  snowflake: Snowflake,
  "package-open": PackageOpen,
  trees: Trees,
} as const;

export type ServiceIconKey = keyof typeof SERVICE_ICON_MAP;

export type Service = {
  id: string;
  slug: string;
  title: string;
  short: string;
  priceFrom: string;
  icon: ServiceIconKey | ComponentType<React.SVGProps<SVGSVGElement>>;
  hero: string;
  description: string;
  includes: string[];
  faq: { q: string; a: string }[];
  imageUrl?: string | null;
  order: number;
};

export type PriceItem = {
  id: string;
  category_id: string;
  category_title: string;
  name: string;
  price: string;
  order: number;
};

export type GalleryItem = {
  id: string;
  src: string;
  title: string;
  category: string;
  category_label: string;
  year: number;
  order: number;
};

export type SiteSettings = {
  name: string;
  domain: string;
  url: string;
  phone: string;
  phoneRaw: string;
  address: string;
  hours: string;
  whatsapp: string;
  telegram: string;
  vk: string;
  max: string;
  email: string;
  yearFounded: number;
  geo: { lat: number; lng: number };
  legal: { name: string; ogrn: string; inn: string };
  yandexMapEmbed: string;
};

export const getServiceIcon = (
  icon: Service["icon"],
): ComponentType<React.SVGProps<SVGSVGElement>> =>
  typeof icon === "string" ? SERVICE_ICON_MAP[icon] ?? Construction : icon;

// ---------- Row mappers ----------

type ServiceRow = {
  id: string;
  slug: string;
  title: string;
  short: string;
  price_from: string;
  icon: string;
  hero: string;
  description: string;
  includes: unknown;
  faq: unknown;
  image_url: string | null;
  position: number;
};

type PriceRow = {
  id: string;
  category_id: string;
  category_title: string;
  name: string;
  price: string;
  position: number;
};

type GalleryRow = {
  id: string;
  src: string;
  title: string;
  category: string;
  category_label: string;
  year: number;
  position: number;
};

function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    short: row.short,
    priceFrom: row.price_from,
    icon: (row.icon as ServiceIconKey) ?? "construction",
    hero: row.hero,
    description: row.description,
    includes: Array.isArray(row.includes) ? (row.includes as string[]) : [],
    faq: Array.isArray(row.faq) ? (row.faq as { q: string; a: string }[]) : [],
    imageUrl: row.image_url,
    order: row.position ?? 0,
  };
}

function mapPrice(row: PriceRow): PriceItem {
  return {
    id: row.id,
    category_id: row.category_id,
    category_title: row.category_title,
    name: row.name,
    price: row.price,
    order: row.position ?? 0,
  };
}

function mapGallery(row: GalleryRow): GalleryItem {
  return {
    id: row.id,
    src: row.src,
    title: row.title,
    category: row.category,
    category_label: row.category_label,
    year: row.year,
    order: row.position ?? 0,
  };
}

// ---------- Public fetchers (RLS allows anon SELECT) ----------

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapService(row as ServiceRow));
}

export async function fetchPriceItems(): Promise<PriceItem[]> {
  const { data, error } = await supabase
    .from("price_items")
    .select("*")
    .order("category_title", { ascending: true })
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapPrice(row as PriceRow));
}

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapGallery(row as GalleryRow));
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("data")
    .eq("id", "main")
    .maybeSingle();
  if (error) throw error;
  return (data?.data as SiteSettings) ?? (FALLBACK_SITE as SiteSettings);
}

// ---------- React Query hooks ----------

export function useServices() {
  return useQuery({
    queryKey: ["content", "services"],
    queryFn: fetchServices,
    placeholderData: FALLBACK_SERVICES as Service[],
    staleTime: 60_000,
  });
}

export function usePriceItems() {
  return useQuery({
    queryKey: ["content", "prices"],
    queryFn: fetchPriceItems,
    placeholderData: FALLBACK_PRICE_CATEGORIES.flatMap((c) =>
      c.rows.map((r, index) => ({
        id: `${c.id}-${index}`,
        category_id: c.id,
        category_title: c.title,
        name: r.name,
        price: r.price,
        order: index,
      })),
    ),
    staleTime: 60_000,
  });
}

export function useGalleryItems() {
  return useQuery({
    queryKey: ["content", "gallery"],
    queryFn: fetchGalleryItems,
    placeholderData: FALLBACK_GALLERY.map((g, index) => ({
      id: `fallback-${index}`,
      src: g.src,
      title: g.title,
      category: g.category,
      category_label: g.categoryLabel,
      year: g.year,
      order: index,
    })) as GalleryItem[],
    staleTime: 60_000,
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["content", "site"],
    queryFn: fetchSiteSettings,
    placeholderData: FALLBACK_SITE as SiteSettings,
    staleTime: 60_000,
  });
}

// ---------- Grouping helpers (used by UI) ----------

export type PriceCategory = {
  category_id: string;
  category_title: string;
  rows: { id: string; name: string; price: string; order: number }[];
};

export function groupPriceItems(items: PriceItem[]) {
  const groups = new Map<string, PriceCategory>();
  items.forEach((item) => {
    const existing = groups.get(item.category_id);
    if (!existing) {
      groups.set(item.category_id, {
        category_id: item.category_id,
        category_title: item.category_title,
        rows: [item],
      });
    } else {
      existing.rows.push(item);
    }
  });
  return Array.from(groups.values())
    .map((group) => ({ ...group, rows: group.rows.sort((a, b) => a.order - b.order) }))
    .sort((a, b) => a.category_title.localeCompare(b.category_title, "ru"));
}

export function groupGalleryCategories(items: GalleryItem[]) {
  const categories = new Map<string, { id: string; label: string }>();
  items.forEach((item) => {
    if (!categories.has(item.category)) {
      categories.set(item.category, { id: item.category, label: item.category_label });
    }
  });
  return Array.from(categories.values());
}

// ---------- Admin operations (RLS gates writes via has_role('admin')) ----------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v: string) => UUID_RE.test(v);

export async function saveServicesDiff(draft: Service[], original: Service[]) {
  const draftIds = new Set(draft.filter((s) => isUuid(s.id)).map((s) => s.id));
  const toDelete = original.filter((s) => isUuid(s.id) && !draftIds.has(s.id)).map((s) => s.id);

  if (toDelete.length) {
    const { error } = await supabase.from("services").delete().in("id", toDelete);
    if (error) throw error;
  }

  for (const s of draft) {
    const row = {
      slug: s.slug,
      title: s.title,
      short: s.short,
      price_from: s.priceFrom,
      icon: typeof s.icon === "string" ? s.icon : "construction",
      hero: s.hero,
      description: s.description,
      includes: s.includes,
      faq: s.faq,
      image_url: s.imageUrl ?? null,
      position: s.order,
    };
    if (isUuid(s.id)) {
      const { error } = await supabase.from("services").update(row).eq("id", s.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("services").insert(row);
      if (error) throw error;
    }
  }
}

export async function savePricesDiff(draft: PriceItem[], original: PriceItem[]) {
  const draftIds = new Set(draft.filter((p) => isUuid(p.id)).map((p) => p.id));
  const toDelete = original.filter((p) => isUuid(p.id) && !draftIds.has(p.id)).map((p) => p.id);

  if (toDelete.length) {
    const { error } = await supabase.from("price_items").delete().in("id", toDelete);
    if (error) throw error;
  }

  for (const p of draft) {
    const row = {
      category_id: p.category_id,
      category_title: p.category_title,
      name: p.name,
      price: p.price,
      position: p.order,
    };
    if (isUuid(p.id)) {
      const { error } = await supabase.from("price_items").update(row).eq("id", p.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("price_items").insert(row);
      if (error) throw error;
    }
  }
}

export async function saveGalleryDiff(draft: GalleryItem[], original: GalleryItem[]) {
  const draftIds = new Set(draft.filter((g) => isUuid(g.id)).map((g) => g.id));
  const toDelete = original.filter((g) => isUuid(g.id) && !draftIds.has(g.id)).map((g) => g.id);

  if (toDelete.length) {
    const { error } = await supabase.from("gallery_items").delete().in("id", toDelete);
    if (error) throw error;
  }

  for (const g of draft) {
    const row = {
      src: g.src,
      title: g.title,
      category: g.category,
      category_label: g.category_label,
      year: g.year,
      position: g.order,
    };
    if (isUuid(g.id)) {
      const { error } = await supabase.from("gallery_items").update(row).eq("id", g.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("gallery_items").insert(row);
      if (error) throw error;
    }
  }
}

export async function saveSiteSettings(settings: SiteSettings) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: "main", data: settings }, { onConflict: "id" });
  if (error) throw error;
}

export async function uploadSiteImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("site-images").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("site-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return !!data;
}
