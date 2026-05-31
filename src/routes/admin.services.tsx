import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllServices, type Service } from "@/lib/site-data";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Pencil, Trash2, Plus, X, Wrench } from "lucide-react";
import { toast } from "sonner";
import {
  TitleBar, AdminModal, ModalActions, Field, Input, Textarea,
  CheckboxRow, AdminTable, SkeletonRow, EmptyState, ActionBtn,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/services")({ component: AdminServices });

const ICON_OPTIONS = [
  "construction", "wrench", "layout-grid", "shovel", "trash",
  "truck", "hammer", "snowflake", "package-open", "trees",
];

function AdminServices() {
  const qc = useQueryClient();
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: fetchAllServices,
  });
  const [edit, setEdit] = useState<Partial<Service> | null>(null);
  const [saving, setSaving] = useState(false);
  const [pricingEdit, setPricingEdit] = useState<string | null>(null);

  const save = async () => {
    if (!edit?.title || !edit?.slug) {
      toast.error("Название и slug обязательны");
      return;
    }
    setSaving(true);
    const payload: any = {
      title: edit.title,
      slug: edit.slug,
      short_description: edit.short_description ?? null,
      description: edit.description ?? null,
      image_url: edit.image_url ?? null,
      icon: edit.icon ?? "wrench",
      price_from: edit.price_from ?? null,
      price_unit: edit.price_unit ?? "м²",
      sort_order: edit.sort_order ?? 0,
      is_active: edit.is_active ?? true,
    };
    const { error } = edit.id
      ? await supabase.from("services").update(payload).eq("id", edit.id)
      : await supabase.from("services").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["admin-services"] });
    qc.invalidateQueries({ queryKey: ["services"] });
  };

  const del = async (id: string) => {
    if (!confirm("Удалить услугу? Это действие нельзя отменить.")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено");
    qc.invalidateQueries({ queryKey: ["admin-services"] });
  };

  return (
    <div className="space-y-6">
      <TitleBar
        title="Услуги"
        description="Управление каталогом услуг. Изменения сразу отображаются на сайте."
        action={
          <button
            onClick={() => setEdit({ is_active: true, price_unit: "м²", sort_order: services.length, icon: "wrench" })}
            className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            <Plus className="h-4 w-4" /> Добавить услугу
          </button>
        }
      />

      <AdminTable columns={["Услуга", "Цена", "Иконка", "Активна", ""]}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
        ) : services.length === 0 ? (
          <tr>
            <td colSpan={5}>
              <EmptyState icon={Wrench} title="Услуг пока нет" description="Добавьте первую услугу" />
            </td>
          </tr>
        ) : (
          services.map((s) => (
            <tr key={s.id} className="hover:bg-surface/50 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {s.image_url && (
                    <img src={s.image_url} alt="" className="h-10 w-10 rounded-lg object-cover border border-border shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-foreground">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.slug}</div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-sm">
                {s.price_from != null ? (
                  <span>от {Number(s.price_from).toLocaleString("ru-RU")} ₽ / {s.price_unit}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                <code className="text-xs bg-surface px-2 py-1 rounded-lg text-muted-foreground">{s.icon ?? "—"}</code>
              </td>
              <td className="px-5 py-4">
                <span className={`inline-block h-2 w-2 rounded-full ${s.is_active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1 justify-end">
                  <ActionBtn onClick={() => setEdit(s)} icon={Pencil} label="Редактировать" />
                  <ActionBtn onClick={() => del(s.id)} icon={Trash2} label="Удалить" variant="danger" />
                </div>
              </td>
            </tr>
          ))
        )}
      </AdminTable>

      {edit && (
        <AdminModal
          title={edit.id ? "Редактировать услугу" : "Новая услуга"}
          onClose={() => setEdit(null)}
          size="lg"
        >
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Название" required>
                <Input value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} placeholder="Асфальтирование" />
              </Field>
              <Field label="Slug (URL)" required hint="Только латиница и дефисы">
                <Input value={edit.slug ?? ""} onChange={(v) => setEdit({ ...edit, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="asfaltirovanye" />
              </Field>
            </div>

            <Field label="Краткое описание" hint="Показывается в карточке на главной (до 120 символов)">
              <Input value={edit.short_description ?? ""} onChange={(v) => setEdit({ ...edit, short_description: v })} placeholder="Профессиональная укладка асфальта…" />
            </Field>

            <Field label="Hero — подпись под заголовком страницы" hint="Короткий SEO-слоган (до 100 символов)">
              <Input value={(edit as any).hero ?? ""} onChange={(v) => setEdit({ ...edit, hero: v } as any)} placeholder="Профессиональное асфальтирование в Перми с гарантией 3 года" />
            </Field>

            <Field label="Краткое описание (карточка)" hint="До 120 символов, показывается в листинге">
              <Input value={edit.short_description ?? ""} onChange={(v) => setEdit({ ...edit, short_description: v })} placeholder="Укладка асфальта любой сложности" />
            </Field>

            <Field label="Полное описание (SEO-текст на странице)">
              <Textarea value={edit.description ?? ""} onChange={(v) => setEdit({ ...edit, description: v })} rows={5} placeholder="Подробное описание услуги для SEO и клиентов…" />
            </Field>

            <Field label="Что входит в услугу" hint="Каждый пункт — с новой строки">
              <Textarea
                value={((edit as any).includes ?? []).join("\n")}
                onChange={(v) => setEdit({ ...edit, includes: v.split("\n").filter(Boolean) } as any)}
                rows={5}
                mono
                placeholder={"Бесплатный выезд замерщика\nУкладка асфальта финишером\nГарантия 3 года в договоре"}
              />
            </Field>

            <Field label="FAQ — Вопрос | Ответ" hint="Каждая пара с новой строки, разделитель: | (вертикальная черта)">
              <Textarea
                value={((edit as any).faq ?? []).map((f: any) => `${f.q} | ${f.a}`).join("\n")}
                onChange={(v) => {
                  const faq = v.split("\n").filter(Boolean).map((line: string) => {
                    const sep = line.indexOf(" | ");
                    return sep === -1 ? { q: line, a: "" } : { q: line.slice(0, sep).trim(), a: line.slice(sep + 3).trim() };
                  });
                  setEdit({ ...edit, faq } as any);
                }}
                rows={5}
                mono
                placeholder={"Сколько стоит 1 м²? | от 300 ₽/м²\nКакая гарантия? | 3 года в договоре"}
              />
            </Field>

            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Цена от (₽)">
                <Input type="number" value={String(edit.price_from ?? "")} onChange={(v) => setEdit({ ...edit, price_from: v ? Number(v) : null })} placeholder="1500" />
              </Field>
              <Field label="Единица измерения">
                <Input value={edit.price_unit ?? "м²"} onChange={(v) => setEdit({ ...edit, price_unit: v })} placeholder="м², пог. м, шт." />
              </Field>
              <Field label="Иконка">
                <select
                  value={edit.icon ?? "wrench"}
                  onChange={(e) => setEdit({ ...edit, icon: e.target.value })}
                  className="bg-input border border-border rounded-xl px-4 py-2.5 w-full text-sm focus:border-primary focus:outline-none"
                >
                  {ICON_OPTIONS.map((ico) => (
                    <option key={ico} value={ico}>{ico}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Порядок сортировки">
                <Input type="number" value={String(edit.sort_order ?? 0)} onChange={(v) => setEdit({ ...edit, sort_order: Number(v) })} />
              </Field>
              <div className="flex items-end pb-1">
                <CheckboxRow
                  checked={edit.is_active ?? true}
                  onChange={(v) => setEdit({ ...edit, is_active: v })}
                  label="Услуга активна (видна на сайте)"
                />
              </div>
            </div>

            <Field label="Изображение услуги">
              <ImageUpload value={edit.image_url} onChange={(url) => setEdit({ ...edit, image_url: url })} />
            </Field>

            {edit.id && <PricingEditor serviceId={edit.id} />}
          </div>
          <ModalActions onCancel={() => setEdit(null)} onSave={save} saving={saving} />
        </AdminModal>
      )}
    </div>
  );
}

function PricingEditor({ serviceId }: { serviceId: string }) {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["pricing", serviceId],
    queryFn: async () => {
      const { data } = await supabase.from("pricing_items")
        .select("*").eq("service_id", serviceId).order("sort_order");
      return (data ?? []) as { id: string; name: string; unit: string; price: number; sort_order: number }[];
    },
  });
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("м²");
  const [price, setPrice] = useState("");

  const add = async () => {
    if (!name || !price) { toast.error("Введите название и цену"); return; }
    const { error } = await supabase.from("pricing_items").insert({
      service_id: serviceId, name, unit, price: Number(price), sort_order: items.length,
    });
    if (error) { toast.error(error.message); return; }
    setName(""); setPrice("");
    qc.invalidateQueries({ queryKey: ["pricing", serviceId] });
  };

  const del = async (id: string) => {
    await supabase.from("pricing_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["pricing", serviceId] });
  };

  return (
    <div className="border border-border rounded-xl p-4">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
        Детальный прайс-лист по услуге
      </div>
      <div className="space-y-2 mb-4">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 text-sm">
            <span className="flex-1 font-medium">{it.name}</span>
            <span className="text-primary font-bold">{Number(it.price).toLocaleString("ru-RU")} ₽ / {it.unit}</span>
            <button onClick={() => del(it.id)} aria-label="Удалить" className="h-6 w-6 grid place-items-center rounded-lg hover:bg-surface-2 text-muted-foreground hover:text-destructive transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-muted-foreground py-2">Добавьте позиции прайс-листа</p>}
      </div>
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название позиции" className="flex-1 bg-input border border-border rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="ед." className="w-16 bg-input border border-border rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Цена" type="number" className="w-24 bg-input border border-border rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        <button onClick={add} className="btn-gold rounded-xl px-4 text-sm font-bold">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
