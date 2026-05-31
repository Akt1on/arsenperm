import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import {
  Phone, MessageSquare, Clock, Send, Search, Copy, Check,
  Inbox, RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { TitleBar, StatusPill, StatusButtons, EmptyState, SkeletonRow, AdminTable } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/leads")({ component: AdminLeads });

type Lead = {
  id: string; name: string; phone: string;
  service: string | null; message: string | null;
  source: string | null; status: string;
  telegram_sent: boolean | null; created_at: string;
};

const STATUS_TABS = [
  { key: "all", label: "Все" },
  { key: "new", label: "Новые" },
  { key: "in_progress", label: "В работе" },
  { key: "done", label: "Готово" },
  { key: "archived", label: "Архив" },
] as const;

function CopyPhone({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(phone.replace(/[^\d+]/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} aria-label="Копировать телефон" title="Копировать" className="h-7 w-7 rounded-lg grid place-items-center hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function AdminLeads() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: leads = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads").select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
    refetchInterval: 30_000,
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      qc.invalidateQueries({ queryKey: ["admin-new-leads-count"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const counts = useMemo(() =>
    leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.status] = (acc[l.status] ?? 0) + 1;
      acc.all = (acc.all ?? 0) + 1;
      return acc;
    }, {}),
    [leads]
  );

  const filtered = useMemo(() => {
    let items = statusFilter === "all" ? leads : leads.filter((l) => l.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((l) =>
        l.name?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.service?.toLowerCase().includes(q) ||
        l.message?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [leads, statusFilter, search]);

  return (
    <div className="space-y-6">
      <TitleBar
        title="Заявки"
        description="CRM для управления входящими лидами. Обновляется автоматически каждые 30 секунд."
        action={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Обновить
          </button>
        }
      />

      {/* Status tab filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              statusFilter === tab.key
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-gold)]"
                : "bg-white border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {tab.label}
            {counts[tab.key] != null && (
              <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                statusFilter === tab.key ? "bg-black/20" : "bg-surface-2"
              }`}>
                {counts[tab.key] ?? 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени, телефону, услуге…"
          className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Leads list */}
      {isLoading ? (
        <AdminTable columns={["Клиент", "Контакт", "Источник", "Статус", "Дата"]}>
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}
        </AdminTable>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl">
          <EmptyState
            icon={Inbox}
            title="Заявок нет"
            description={search ? "Попробуйте изменить поиск или фильтры" : "Новые заявки появятся здесь автоматически"}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <div
              key={lead.id}
              className={`bg-white border rounded-2xl p-5 transition-all hover:shadow-[0_4px_20px_-4px_oklch(0_0_0/0.08)] ${
                lead.status === "new" ? "border-emerald-500/30 bg-emerald-50/30" : "border-border"
              }`}
            >
              <div className="flex flex-wrap items-start gap-4 justify-between">
                {/* Left: info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-base text-foreground">{lead.name}</span>
                    <StatusPill status={lead.status} />
                    {lead.telegram_sent && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-sky-500 font-semibold">
                        <Send className="h-3 w-3" /> TG
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                        className="font-bold text-primary hover:underline"
                      >
                        {lead.phone}
                      </a>
                      <CopyPhone phone={lead.phone} />
                    </div>
                    {lead.service && (
                      <span className="text-muted-foreground">🔧 {lead.service}</span>
                    )}
                  </div>

                  {lead.message && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-foreground/80 bg-surface rounded-xl px-3 py-2">
                      <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                      <span>{lead.message}</span>
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1" title={format(new Date(lead.created_at), "dd.MM.yyyy HH:mm", { locale: ru })}>
                      <Clock className="h-3 w-3" />
                      {format(new Date(lead.created_at), "d MMM, HH:mm", { locale: ru })}
                    </span>
                    <span className="text-muted-foreground/50">
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ru })}
                    </span>
                    {lead.source && <span>📍 {lead.source}</span>}
                  </div>
                </div>

                {/* Right: status switcher */}
                <div className="shrink-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-semibold">Статус</p>
                  <StatusButtons
                    current={lead.status}
                    onSelect={(s) => updateMut.mutate({ id: lead.id, status: s })}
                    loading={updateMut.isPending}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Показано {filtered.length} из {leads.length} заявок
        </p>
      )}
    </div>
  );
}
