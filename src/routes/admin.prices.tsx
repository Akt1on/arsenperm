import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, X, DollarSign, Save } from "lucide-react";
import { toast } from "sonner";
import {
  TitleBar, Field, Input, EmptyState, SectionDivider,
} from "@/components/admin/ui";
import {
  fetchPriceItems, savePricesDiff, type PriceItem, groupPriceItems, type PriceCategory,
} from "@/lib/content";

export const Route = createFileRoute("/admin/prices")({ component: AdminPrices });

let idCounter = 0;
const tmpId = () => `new-${++idCounter}-${Date.now()}`;

function AdminPrices() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["content", "prices"],
    queryFn: fetchPriceItems,
  });
  const [groups, setGroups] = useState<PriceCategory[]>([]);
  const [dirty, setDirty] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState("");

  useEffect(() => {
    if (items.length > 0 && !dirty) {
      setGroups(groupPriceItems(items));
    }
  }, [items, dirty]);

  const saveMut = useMutation({
    mutationFn: (draft: PriceItem[]) => savePricesDiff(draft, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content", "prices"] });
      setDirty(false);
      toast.success("Прайс-лист сохранён");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSave = () => {
    const draft: PriceItem[] = groups.flatMap((g) =>
      g.rows.map((r) => ({
        id: r.id,
        category_id: g.category_id,
        category_title: g.category_title,
        name: r.name,
        price: r.price,
        order: r.order,
      }))
    );
    saveMut.mutate(draft);
  };

  const updateRow = (catId: string, rowId: string, field: "name" | "price", value: string) => {
    setDirty(true);
    setGroups((gs) =>
      gs.map((g) =>
        g.category_id !== catId
          ? g
          : { ...g, rows: g.rows.map((r) => r.id === rowId ? { ...r, [field]: value } : r) }
      )
    );
  };

  const addRow = (catId: string) => {
    setDirty(true);
    setGroups((gs) =>
      gs.map((g) =>
        g.category_id !== catId
          ? g
          : { ...g, rows: [...g.rows, { id: tmpId(), name: "", price: "", order: g.rows.length }] }
      )
    );
  };

  const deleteRow = (catId: string, rowId: string) => {
    setDirty(true);
    setGroups((gs) =>
      gs.map((g) =>
        g.category_id !== catId
          ? g
          : { ...g, rows: g.rows.filter((r) => r.id !== rowId) }
      )
    );
  };

  const addCategory = () => {
    if (!newCatTitle.trim()) { toast.error("Введите название категории"); return; }
    const catId = newCatTitle.toLowerCase().replace(/[^a-zа-я0-9]/gi, "-");
    if (groups.some((g) => g.category_id === catId)) { toast.error("Категория уже существует"); return; }
    setGroups((gs) => [...gs, { category_id: catId, category_title: newCatTitle.trim(), rows: [] }]);
    setNewCatTitle("");
    setDirty(true);
  };

  const deleteCategory = (catId: string) => {
    if (!confirm("Удалить всю категорию со всеми строками?")) return;
    setGroups((gs) => gs.filter((g) => g.category_id !== catId));
    setDirty(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TitleBar title="Прайс-лист" description="Загрузка…" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-5 animate-pulse">
              <div className="h-5 bg-surface-2 rounded w-1/4 mb-4" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex gap-3 mb-2">
                  <div className="h-10 bg-surface-2 rounded-xl flex-1" />
                  <div className="h-10 bg-surface-2 rounded-xl w-32" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <TitleBar
        title="Прайс-лист"
        description="Изменяйте цены и категории. Изменения сразу отображаются на странице /цены."
        action={
          <button
            onClick={handleSave}
            disabled={!dirty || saveMut.isPending}
            className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-50 transition-opacity"
          >
            <Save className="h-4 w-4" />
            {saveMut.isPending ? "Сохранение…" : "Сохранить всё"}
          </button>
        }
      />

      {dirty && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700 font-medium">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          Есть несохранённые изменения
        </div>
      )}

      {groups.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl">
          <EmptyState icon={DollarSign} title="Прайс-лист пуст" description="Добавьте первую категорию и строки" />
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.category_id} className="bg-white border border-border rounded-2xl overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-5 py-4 bg-surface border-b border-border">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {group.category_title}
                  <span className="text-xs font-normal text-muted-foreground">({group.rows.length} позиций)</span>
                </h3>
                <button
                  onClick={() => deleteCategory(group.category_id)}
                  aria-label="Удалить категорию"
                  className="h-8 w-8 grid place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {group.rows.map((row) => (
                  <div key={row.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface/50 transition-colors group">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <input
                      value={row.name}
                      onChange={(e) => updateRow(group.category_id, row.id, "name", e.target.value)}
                      placeholder="Название работы / материала"
                      className="flex-1 bg-transparent border-0 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg px-2 py-1.5"
                    />
                    <input
                      value={row.price}
                      onChange={(e) => updateRow(group.category_id, row.id, "price", e.target.value)}
                      placeholder="от 1 500 ₽/м²"
                      className="w-36 bg-transparent border-0 text-sm text-right text-primary font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg px-2 py-1.5"
                    />
                    <button
                      onClick={() => deleteRow(group.category_id, row.id)}
                      aria-label="Удалить строку"
                      className="h-7 w-7 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {group.rows.length === 0 && (
                  <p className="px-5 py-3 text-sm text-muted-foreground italic">Нет строк — добавьте позиции ниже</p>
                )}
              </div>

              {/* Add row */}
              <div className="px-5 py-3 border-t border-border bg-surface/50">
                <button
                  onClick={() => addRow(group.category_id)}
                  className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Добавить строку
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionDivider label="Добавить категорию" />

      <div className="flex gap-3 max-w-lg">
        <input
          value={newCatTitle}
          onChange={(e) => setNewCatTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
          placeholder="Название новой категории"
          className="flex-1 bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
        <button
          onClick={addCategory}
          className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
        >
          <Plus className="h-4 w-4" />
          Добавить
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Нажмите «Сохранить всё» после завершения всех изменений — обновляется пакетно для скорости.
      </p>
    </div>
  );
}
