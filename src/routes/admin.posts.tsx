import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllPosts, type Post } from "@/lib/site-data";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, Newspaper } from "lucide-react";
import { toast } from "sonner";
import {
  TitleBar, AdminModal, ModalActions, Field, Input, Textarea,
  CheckboxRow, AdminTable, SkeletonRow, EmptyState, ActionBtn,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/posts")({ component: AdminPosts });

function AdminPosts() {
  const qc = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: fetchAllPosts,
  });
  const [edit, setEdit] = useState<Partial<Post> | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!edit?.title || !edit?.slug) { toast.error("Заголовок и slug обязательны"); return; }
    setSaving(true);
    const payload: any = {
      title: edit.title, slug: edit.slug,
      excerpt: edit.excerpt ?? null, content: edit.content ?? null,
      keywords: edit.keywords ?? null,
      read_minutes: edit.read_minutes ?? 5,
      sort_order: edit.sort_order ?? 0,
      is_published: edit.is_published ?? false,
      cover_image: edit.cover_image ?? null,
      published_at: edit.is_published && !edit.published_at
        ? new Date().toISOString() : edit.published_at ?? null,
    };
    const { error } = edit.id
      ? await supabase.from("posts").update(payload).eq("id", edit.id)
      : await supabase.from("posts").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
    qc.invalidateQueries({ queryKey: ["posts"] });
  };

  const del = async (id: string) => {
    if (!confirm("Удалить статью?")) return;
    await supabase.from("posts").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  };

  return (
    <div className="space-y-6">
      <TitleBar
        title="Блог"
        description="Статьи для SEO и контент-маркетинга. Опубликованные статьи доступны на /blog."
        action={
          <button
            onClick={() => setEdit({ is_published: false, read_minutes: 5, sort_order: posts.length })}
            className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            <Plus className="h-4 w-4" /> Написать статью
          </button>
        }
      />

      <AdminTable columns={["Заголовок", "Slug", "Мин. чтения", "Статус", ""]}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
        ) : posts.length === 0 ? (
          <tr>
            <td colSpan={5}>
              <EmptyState icon={Newspaper} title="Статей пока нет" description="Напишите первую статью для SEO" />
            </td>
          </tr>
        ) : (
          posts.map((p) => (
            <tr key={p.id} className="hover:bg-surface/50 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {p.cover_image && (
                    <img src={p.cover_image} alt="" className="h-10 w-10 rounded-lg object-cover border border-border shrink-0" />
                  )}
                  <div className="font-semibold text-sm text-foreground">{p.title}</div>
                </div>
              </td>
              <td className="px-5 py-4">
                <code className="text-xs bg-surface px-2 py-1 rounded-lg text-muted-foreground">{p.slug}</code>
              </td>
              <td className="px-5 py-4 text-sm text-muted-foreground">{p.read_minutes} мин</td>
              <td className="px-5 py-4">
                {p.is_published
                  ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Опубликовано</span>
                  : <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />Черновик</span>
                }
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1 justify-end">
                  <ActionBtn onClick={() => setEdit(p)} icon={Pencil} label="Редактировать" />
                  <ActionBtn onClick={() => del(p.id)} icon={Trash2} label="Удалить" variant="danger" />
                </div>
              </td>
            </tr>
          ))
        )}
      </AdminTable>

      {edit && (
        <AdminModal title={edit.id ? "Редактировать статью" : "Новая статья"} onClose={() => setEdit(null)} size="xl">
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Заголовок" required>
                <Input value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} placeholder="Как выбрать подрядчика для асфальтирования" />
              </Field>
              <Field label="Slug" required hint="Только латиница и дефисы">
                <Input value={edit.slug ?? ""} onChange={(v) => setEdit({ ...edit, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="kak-vybrat-podryadchika" />
              </Field>
            </div>

            <Field label="Краткое описание (excerpt)" hint="До 160 символов — используется для SEO meta description">
              <Textarea value={edit.excerpt ?? ""} onChange={(v) => setEdit({ ...edit, excerpt: v })} rows={2} placeholder="Рассказываем на что обратить внимание при выборе…" />
            </Field>

            <Field label="Контент статьи" hint="Поддерживается Markdown и HTML">
              <Textarea value={edit.content ?? ""} onChange={(v) => setEdit({ ...edit, content: v })} rows={14} mono placeholder="## Введение&#10;&#10;Текст статьи…" />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Ключевые слова (keywords)" hint="Через запятую">
                <Input value={edit.keywords ?? ""} onChange={(v) => setEdit({ ...edit, keywords: v })} placeholder="асфальтирование Пермь, укладка асфальта" />
              </Field>
              <Field label="Время чтения (мин)">
                <Input type="number" value={String(edit.read_minutes ?? 5)} onChange={(v) => setEdit({ ...edit, read_minutes: Number(v) })} min={1} max={60} />
              </Field>
            </div>

            <Field label="Обложка статьи">
              <ImageUpload value={edit.cover_image} onChange={(url) => setEdit({ ...edit, cover_image: url })} />
            </Field>

            <CheckboxRow checked={edit.is_published ?? false} onChange={(v) => setEdit({ ...edit, is_published: v })} label="Опубликовать статью" />
          </div>
          <ModalActions onCancel={() => setEdit(null)} onSave={save} saving={saving} />
        </AdminModal>
      )}
    </div>
  );
}
