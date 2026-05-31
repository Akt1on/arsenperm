import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllProjects, fetchProjectPhotos, type Project } from "@/lib/site-data";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, Images, X, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import {
  TitleBar, AdminModal, ModalActions, Field, Input, Textarea,
  CheckboxRow, SkeletonCard, EmptyState, ActionBtn,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/projects")({ component: AdminProjects });

const CATEGORIES = ["Дороги", "Парковки", "СНТ / дачи", "Склады", "Тротуарная плитка", "Промышленные объекты", "Дворы", "Прочее"];

function AdminProjects() {
  const qc = useQueryClient();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: fetchAllProjects,
  });
  const [edit, setEdit] = useState<Partial<Project> | null>(null);
  const [photoEditId, setPhotoEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!edit?.title || !edit?.slug) { toast.error("Название и slug обязательны"); return; }
    setSaving(true);
    const payload: any = {
      title: edit.title, slug: edit.slug,
      category: edit.category ?? null,
      location: edit.location ?? null,
      description: edit.description ?? null,
      cover_image: edit.cover_image ?? null,
      sort_order: edit.sort_order ?? 0,
      is_active: edit.is_active ?? true,
    };
    const { error } = edit.id
      ? await supabase.from("projects").update(payload).eq("id", edit.id)
      : await supabase.from("projects").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
    qc.invalidateQueries({ queryKey: ["projects"] });
  };

  const del = async (id: string) => {
    if (!confirm("Удалить проект? Все фотографии также будут удалены.")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
  };

  return (
    <div className="space-y-6">
      <TitleBar
        title="Портфолио"
        description="Управление проектами и фотографиями. Изменения сразу отображаются на сайте."
        action={
          <button
            onClick={() => setEdit({ is_active: true, sort_order: projects.length })}
            className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            <Plus className="h-4 w-4" /> Добавить проект
          </button>
        }
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl">
          <EmptyState icon={FolderKanban} title="Проектов пока нет" description="Добавьте первый проект в портфолио" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div key={p.id} className="bg-white border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-[0_4px_20px_-4px_oklch(0.82_0.19_85/0.15)] transition-all group">
              <div className="relative aspect-video bg-surface-2">
                {p.cover_image ? (
                  <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                    <Images className="h-8 w-8 opacity-30" />
                  </div>
                )}
                {!p.is_active && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Скрыт
                  </div>
                )}
              </div>
              <div className="p-4">
                {p.category && (
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{p.category}</div>
                )}
                <div className="font-bold text-foreground leading-tight">{p.title}</div>
                {p.location && <div className="text-xs text-muted-foreground mt-1">📍 {p.location}</div>}
                <div className="mt-4 flex items-center gap-1">
                  <ActionBtn onClick={() => setEdit(p)} icon={Pencil} label="Редактировать" />
                  <ActionBtn onClick={() => setPhotoEditId(p.id)} icon={Images} label="Управление фото" />
                  <ActionBtn onClick={() => del(p.id)} icon={Trash2} label="Удалить" variant="danger" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <AdminModal
          title={edit.id ? "Редактировать проект" : "Новый проект"}
          onClose={() => setEdit(null)}
          size="lg"
        >
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Название" required>
                <Input value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} placeholder="Асфальтирование парковки ТЦ" />
              </Field>
              <Field label="Slug" required hint="Только латиница и дефисы">
                <Input value={edit.slug ?? ""} onChange={(v) => setEdit({ ...edit, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="parking-tc-2024" />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Категория">
                <select
                  value={edit.category ?? ""}
                  onChange={(e) => setEdit({ ...edit, category: e.target.value })}
                  className="bg-input border border-border rounded-xl px-4 py-2.5 w-full text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">— выберите —</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Локация">
                <Input value={edit.location ?? ""} onChange={(v) => setEdit({ ...edit, location: v })} placeholder="Пермь, ул. Ленина" />
              </Field>
            </div>

            <Field label="Описание">
              <Textarea value={edit.description ?? ""} onChange={(v) => setEdit({ ...edit, description: v })} rows={4} placeholder="Краткое описание проекта…" />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Порядок сортировки">
                <Input type="number" value={String(edit.sort_order ?? 0)} onChange={(v) => setEdit({ ...edit, sort_order: Number(v) })} />
              </Field>
              <div className="flex items-end pb-1">
                <CheckboxRow checked={edit.is_active ?? true} onChange={(v) => setEdit({ ...edit, is_active: v })} label="Опубликован" />
              </div>
            </div>

            <Field label="Обложка проекта">
              <ImageUpload value={edit.cover_image} onChange={(url) => setEdit({ ...edit, cover_image: url })} />
            </Field>
          </div>
          <ModalActions onCancel={() => setEdit(null)} onSave={save} saving={saving} />
        </AdminModal>
      )}

      {photoEditId && (
        <PhotosModal projectId={photoEditId} onClose={() => setPhotoEditId(null)} />
      )}
    </div>
  );
}

function PhotosModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["photos", projectId],
    queryFn: () => fetchProjectPhotos(projectId),
  });

  const add = async (url: string | null) => {
    if (!url) return;
    const { error } = await supabase.from("project_photos").insert({
      project_id: projectId, image_url: url, sort_order: photos.length,
    });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["photos", projectId] });
    qc.invalidateQueries({ queryKey: ["project-photos"] });
  };

  const del = async (id: string) => {
    await supabase.from("project_photos").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["photos", projectId] });
  };

  return (
    <AdminModal title="Фотографии проекта" onClose={onClose} size="lg">
      <div className="space-y-5">
        <div>
          <p className="text-sm text-muted-foreground mb-3">Добавьте одно или несколько фото</p>
          <ImageUpload value={null} onChange={add} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-square bg-surface-2 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Фотографий пока нет</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {photos.map((p: any) => (
              <div key={p.id} className="relative rounded-xl overflow-hidden group aspect-square">
                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => del(p.id)}
                  aria-label="Удалить фото"
                  className="absolute top-1.5 right-1.5 h-7 w-7 grid place-items-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminModal>
  );
}
