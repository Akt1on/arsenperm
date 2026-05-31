import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Plus, Trash2, Pencil, Images, Filter } from "lucide-react";
import { toast } from "sonner";
import {
  TitleBar, AdminModal, ModalActions, Field, Input,
  SkeletonCard, EmptyState, ActionBtn,
} from "@/components/admin/ui";
import { fetchGalleryItems, saveGalleryDiff, type GalleryItem } from "@/lib/content";

export const Route = createFileRoute("/admin/gallery")({ component: AdminGallery });

const CATEGORIES = [
  { id: "roads", label: "Дороги" },
  { id: "parking", label: "Парковки" },
  { id: "snt", label: "СНТ / дачи" },
  { id: "warehouses", label: "Склады" },
  { id: "tiles", label: "Тротуарная плитка" },
  { id: "industrial", label: "Промышленные" },
  { id: "yards", label: "Дворы" },
  { id: "other", label: "Прочее" },
];

function AdminGallery() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: fetchGalleryItems,
  });
  const [edit, setEdit] = useState<Partial<GalleryItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const saveMut = useMutation({
    mutationFn: (draft: GalleryItem[]) => saveGalleryDiff(draft, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      qc.invalidateQueries({ queryKey: ["content", "gallery"] });
    },
  });

  const save = async () => {
    if (!edit?.src) { toast.error("Загрузите изображение"); return; }
    setSaving(true);
    try {
      const cat = CATEGORIES.find((c) => c.id === (edit.category ?? "other")) ?? CATEGORIES[CATEGORIES.length - 1];
      const item: GalleryItem = {
        id: edit.id ?? `new-${Date.now()}`,
        src: edit.src,
        title: edit.title ?? "",
        category: cat.id,
        category_label: cat.label,
        year: edit.year ?? new Date().getFullYear(),
        order: edit.order ?? items.length,
      };
      const isDraft = !items.some((i) => i.id === item.id);
      const newItems = isDraft ? [...items, item] : items.map((i) => i.id === item.id ? item : i);
      await saveMut.mutateAsync(newItems);
      toast.success("Сохранено");
      setEdit(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Удалить фото?")) return;
    const newItems = items.filter((i) => i.id !== id);
    try {
      await saveMut.mutateAsync(newItems);
      toast.success("Удалено");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = categoryFilter === "all" ? items : items.filter((i) => i.category === categoryFilter);
  const categoryCounts = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <TitleBar
        title="Галерея"
        description="Изображения разбиты по категориям. Отображаются на странице /портфолио и главной."
        action={
          <button
            onClick={() => setEdit({ category: "other", year: new Date().getFullYear(), order: items.length })}
            className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            <Plus className="h-4 w-4" /> Добавить фото
          </button>
        }
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            categoryFilter === "all"
              ? "bg-primary text-primary-foreground shadow-[var(--shadow-gold)]"
              : "bg-white border border-border text-muted-foreground hover:border-primary/40"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          Все
          <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${categoryFilter === "all" ? "bg-black/20" : "bg-surface-2"}`}>
            {items.length}
          </span>
        </button>
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.id] ?? 0;
          if (count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                categoryFilter === cat.id
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-gold)]"
                  : "bg-white border border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {cat.label}
              <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${categoryFilter === cat.id ? "bg-black/20" : "bg-surface-2"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl">
          <EmptyState
            icon={Images}
            title="Фотографий нет"
            description="Добавьте первое изображение в галерею"
            action={
              <button
                onClick={() => setEdit({ category: "other", year: new Date().getFullYear() })}
                className="btn-gold rounded-xl px-5 py-2.5 text-sm font-bold"
              >
                Добавить фото
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="group relative bg-white border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-[0_4px_20px_-4px_oklch(0.82_0.19_85/0.15)] transition-all">
              <div className="aspect-square overflow-hidden bg-surface-2">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">{item.category_label}</div>
                <div className="text-sm font-semibold text-foreground truncate">{item.title || "Без названия"}</div>
                <div className="text-xs text-muted-foreground">{item.year}</div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEdit(item)}
                  aria-label="Редактировать"
                  className="h-8 w-8 grid place-items-center rounded-xl bg-white/90 backdrop-blur border border-border hover:bg-white shadow-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => del(item.id)}
                  aria-label="Удалить"
                  className="h-8 w-8 grid place-items-center rounded-xl bg-white/90 backdrop-blur border border-border hover:bg-destructive/10 hover:border-destructive/30 shadow-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                #{item.order + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <AdminModal
          title={edit.id && items.some((i) => i.id === edit.id) ? "Редактировать фото" : "Добавить фото"}
          onClose={() => setEdit(null)}
        >
          <div className="grid gap-4">
            <Field label="Изображение" required>
              <ImageUpload value={edit.src ?? null} onChange={(url) => setEdit({ ...edit, src: url ?? "" })} />
            </Field>
            <Field label="Название / описание">
              <Input value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} placeholder="Асфальтирование парковки, г. Пермь" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Категория">
                <select
                  value={edit.category ?? "other"}
                  onChange={(e) => setEdit({ ...edit, category: e.target.value })}
                  className="bg-input border border-border rounded-xl px-4 py-2.5 w-full text-sm focus:border-primary focus:outline-none"
                >
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Год">
                <Input type="number" value={String(edit.year ?? new Date().getFullYear())} onChange={(v) => setEdit({ ...edit, year: Number(v) })} min={2000} max={2099} />
              </Field>
            </div>
            <Field label="Порядок (меньше = выше)">
              <Input type="number" value={String(edit.order ?? 0)} onChange={(v) => setEdit({ ...edit, order: Number(v) })} />
            </Field>
          </div>
          <ModalActions onCancel={() => setEdit(null)} onSave={save} saving={saving} />
        </AdminModal>
      )}
    </div>
  );
}
