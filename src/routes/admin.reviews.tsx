import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllReviews, type Review } from "@/lib/site-data";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, Star as StarIcon } from "lucide-react";
import { toast } from "sonner";
import {
  TitleBar, AdminModal, ModalActions, Field, Input, Textarea,
  CheckboxRow, AdminTable, SkeletonRow, EmptyState, ActionBtn,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`h-3.5 w-3.5 ${n <= rating ? "fill-primary text-primary" : "text-border"}`} />
      ))}
    </div>
  );
}

function AdminReviews() {
  const qc = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: fetchAllReviews,
  });
  const [edit, setEdit] = useState<Partial<Review> | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!edit?.author || !edit?.text) { toast.error("Автор и текст обязательны"); return; }
    setSaving(true);
    const payload: any = {
      author: edit.author,
      text: edit.text,
      rating: edit.rating ?? 5,
      avatar_url: edit.avatar_url ?? null,
      source: edit.source ?? null,
      author_company: (edit as any).author_company ?? null,
      author_role: (edit as any).author_role ?? null,
      sort_order: edit.sort_order ?? reviews.length,
      is_active: edit.is_active ?? true,
    };
    const { error } = edit.id
      ? await supabase.from("reviews").update(payload).eq("id", edit.id)
      : await supabase.from("reviews").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
  };

  const del = async (id: string) => {
    if (!confirm("Удалить отзыв?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  };

  return (
    <div className="space-y-6">
      <TitleBar
        title="Отзывы"
        description="Управление клиентскими отзывами на главной странице."
        action={
          <button
            onClick={() => setEdit({ rating: 5, is_active: true, sort_order: reviews.length })}
            className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            <Plus className="h-4 w-4" /> Добавить отзыв
          </button>
        }
      />

      <AdminTable columns={["Автор", "Рейтинг", "Отзыв", "Активен", ""]}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
        ) : reviews.length === 0 ? (
          <tr>
            <td colSpan={5}>
              <EmptyState icon={StarIcon} title="Отзывов пока нет" description="Добавьте первый отзыв" />
            </td>
          </tr>
        ) : (
          reviews.map((r) => (
            <tr key={r.id} className="hover:bg-surface/50 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {r.avatar_url ? (
                    <img src={r.avatar_url} alt={r.author} className="h-9 w-9 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/10 grid place-items-center text-primary font-bold text-sm shrink-0">
                      {r.author?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-sm text-foreground">{r.author}</div>
                    {((r as any).author_role || (r as any).author_company) && (
                      <div className="text-xs text-primary/80 font-medium">
                        {[(r as any).author_role, (r as any).author_company].filter(Boolean).join(" · ")}
                      </div>
                    )}
                    {r.source && <div className="text-xs text-muted-foreground">{r.source}</div>}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4"><Stars rating={r.rating ?? 5} /></td>
              <td className="px-5 py-4 max-w-sm">
                <p className="text-sm text-muted-foreground line-clamp-2">{r.text}</p>
              </td>
              <td className="px-5 py-4">
                <span className={`inline-block h-2 w-2 rounded-full ${r.is_active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1 justify-end">
                  <ActionBtn onClick={() => setEdit(r)} icon={Pencil} label="Редактировать" />
                  <ActionBtn onClick={() => del(r.id)} icon={Trash2} label="Удалить" variant="danger" />
                </div>
              </td>
            </tr>
          ))
        )}
      </AdminTable>

      {edit && (
        <AdminModal
          title={edit.id ? "Редактировать отзыв" : "Новый отзыв"}
          onClose={() => setEdit(null)}
        >
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Имя и фамилия" required>
                <Input value={edit.author ?? ""} onChange={(v) => setEdit({ ...edit, author: v })} placeholder="Иван Иванов" />
              </Field>
              <Field label="Источник" hint="Яндекс, Google, 2GIS, лично…">
                <Input value={edit.source ?? ""} onChange={(v) => setEdit({ ...edit, source: v })} placeholder="Яндекс.Карты" />
              </Field>
              <Field label="Компания" hint="Необязательно — для B2B отзывов">
                <Input value={(edit as any).author_company ?? ""} onChange={(v) => setEdit({ ...edit, author_company: v } as any)} placeholder='ООО "СтройИнвест"' />
              </Field>
              <Field label="Должность" hint="Необязательно">
                <Input value={(edit as any).author_role ?? ""} onChange={(v) => setEdit({ ...edit, author_role: v } as any)} placeholder="Директор по строительству" />
              </Field>
            </div>

            <Field label="Рейтинг">
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setEdit({ ...edit, rating: n })}
                    className="transition-transform hover:scale-110"
                  >
                    <StarIcon className={`h-7 w-7 transition-colors ${n <= (edit.rating ?? 5) ? "fill-primary text-primary" : "text-border hover:text-primary/50"}`} />
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Текст отзыва" required>
              <Textarea value={edit.text ?? ""} onChange={(v) => setEdit({ ...edit, text: v })} rows={4} placeholder="Отличная работа, приехали вовремя…" />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Порядок сортировки">
                <Input type="number" value={String(edit.sort_order ?? 0)} onChange={(v) => setEdit({ ...edit, sort_order: Number(v) })} />
              </Field>
              <div className="flex items-end pb-1">
                <CheckboxRow checked={edit.is_active ?? true} onChange={(v) => setEdit({ ...edit, is_active: v })} label="Показывать на сайте" />
              </div>
            </div>

            <Field label="Аватар (необязательно)">
              <ImageUpload value={edit.avatar_url} onChange={(url) => setEdit({ ...edit, avatar_url: url })} />
            </Field>
          </div>
          <ModalActions onCancel={() => setEdit(null)} onSave={save} saving={saving} />
        </AdminModal>
      )}
    </div>
  );
}
