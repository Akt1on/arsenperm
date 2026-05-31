import { supabase } from "@/integrations/supabase/client";

export type Service = {
  id: string; slug: string; title: string; short_description: string | null;
  description: string | null; image_url: string | null; icon: string | null;
  price_from: number | null; price_unit: string | null; sort_order: number; is_active: boolean;
};
export type Project = {
  id: string; slug: string; title: string; category: string | null;
  description: string | null; cover_image: string | null; location: string | null;
  completed_at: string | null; sort_order: number; is_active: boolean;
};
export type ProjectPhoto = { id: string; project_id: string; image_url: string; caption: string | null; sort_order: number };
export type SiteSettings = Record<string, any>;

export async function fetchServices(): Promise<Service[]> {
  const { data } = await supabase.from("services").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []) as Service[];
}
export async function fetchAllServices(): Promise<Service[]> {
  const { data } = await supabase.from("services").select("*").order("sort_order");
  return (data ?? []) as Service[];
}
export async function fetchService(slug: string): Promise<Service | null> {
  const { data } = await supabase.from("services").select("*").eq("slug", slug).maybeSingle();
  return (data as Service) ?? null;
}
export async function fetchProjects(): Promise<Project[]> {
  const { data } = await supabase.from("projects").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []) as Project[];
}
export async function fetchAllProjects(): Promise<Project[]> {
  const { data } = await supabase.from("projects").select("*").order("sort_order");
  return (data ?? []) as Project[];
}
export async function fetchProject(slug: string): Promise<Project | null> {
  const { data } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
  return (data as Project) ?? null;
}
export async function fetchProjectPhotos(projectId: string): Promise<ProjectPhoto[]> {
  const { data } = await supabase.from("project_photos").select("*").eq("project_id", projectId).order("sort_order");
  return (data ?? []) as ProjectPhoto[];
}
export async function fetchSettings(): Promise<SiteSettings> {
  const { data } = await supabase.from("site_settings").select("*");
  const out: SiteSettings = {};
  for (const row of (data ?? []) as { key: string; value: any }[]) out[row.key] = row.value;
  return out;
}
export async function fetchPricing(serviceId: string) {
  const { data } = await supabase.from("pricing_items").select("*").eq("service_id", serviceId).order("sort_order");
  return data ?? [];
}

export type Review = {
  id: string; author_name: string; author_role: string | null;
  content: string; rating: number; photo_url: string | null;
  is_active: boolean; sort_order: number;
};
export async function fetchReviews(): Promise<Review[]> {
  const { data } = await supabase.from("reviews").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []) as Review[];
}

export type Post = {
  id: string; slug: string; title: string; excerpt: string | null;
  content: string | null; cover_image: string | null; keywords: string | null;
  read_minutes: number; is_published: boolean; published_at: string | null;
  sort_order: number; created_at: string; updated_at: string;
};
export async function fetchPosts(): Promise<Post[]> {
  const { data } = await supabase.from("posts").select("*").eq("is_published", true).order("published_at", { ascending: false });
  return (data ?? []) as Post[];
}
export async function fetchAllPosts(): Promise<Post[]> {
  const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Post[];
}
export async function fetchPost(slug: string): Promise<Post | null> {
  const { data } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  return (data as Post) ?? null;
}
