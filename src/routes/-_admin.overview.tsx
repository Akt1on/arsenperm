import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  Inbox, Wrench, FolderKanban, Star, Images, DollarSign,
  Newspaper, Settings, ArrowRight, Phone, Clock, CheckCircle2,
} from "lucide-react";
import { StatCard, StatusPill } from "@/components/admin/ui";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

function useOverviewData() {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [newLeads, totalLeads, services, projects, reviews, recentLeads] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("leads").select("id,name,phone,service,status,created_at,source")
          .order("created_at", { ascending: false }).limit(6),
      ]);
      return {
        newLeads: newLeads.count ?? 0,
        totalLeads: totalLeads.count ?? 0,
        services: services.count ?? 0,
        projects: projects.count ?? 0,
        reviews: reviews.count ?? 0,
        recentLeads: (recentLeads.data ?? []) as {
          id: string; name: string; phone: string;
          service: string | null; status: string;
          created_at: string; source: string | null;
        }[],
      };
    },
    refetchInterval: 30_000,
  });
}

const QUICK_LINKS = [
  { to: "/admin/leads", icon: Inbox, label: "Заявки", desc: "CRM и управление лидами" },
  { to: "/admin/services", icon: Wrench, label: "Услуги", desc: "Добавить, изменить, удалить" },
  { to: "/admin/projects", icon: FolderKanban, label: "Портфолио", desc: "Проекты и фото" },
  { to: "/admin/gallery", icon: Images, label: "Галерея", desc: "Изображения по категориям" },
  { to: "/admin/prices", icon: DollarSign, label: "Прайс-лист", desc: "Таблица цен" },
  { to: "/admin/reviews", icon: Star, label: "Отзывы", desc: "Управление отзывами" },
  { to: "/admin/posts", icon: Newspaper, label: "Блог", desc: "Статьи и SEO" },
  { to: "/admin/settings", icon: Settings, label: "Настройки", desc: "Контакты и реквизиты" },
];

export function AdminOverview() {
  const { data, isLoading } = useOverviewData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Обзор</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString("ru-RU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Новые заявки"
          value={isLoading ? "…" : data?.newLeads ?? 0}
          icon={Inbox}
          color={data?.newLeads ? "red" : "green"}
        />
        <StatCard
          label="Всего заявок"
          value={isLoading ? "…" : data?.totalLeads ?? 0}
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          label="Услуг активных"
          value={isLoading ? "…" : data?.services ?? 0}
          icon={Wrench}
          color="gold"
        />
        <StatCard
          label="Проектов"
          value={isLoading ? "…" : data?.projects ?? 0}
          icon={FolderKanban}
          color="gold"
        />
      </div>

      {/* Recent Leads */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-display text-lg font-bold">Последние заявки</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Обновляется каждые 30 секунд</p>
          </div>
          <Link
            to="/admin/leads"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Все заявки <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-surface-2 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-2 rounded w-1/3" />
                  <div className="h-3 bg-surface-2 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.recentLeads.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            <Inbox className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Заявок пока нет
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data?.recentLeads.map((lead) => (
              <div key={lead.id} className="px-6 py-4 flex items-start gap-4 hover:bg-surface/50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{lead.name}</span>
                    <StatusPill status={lead.status} />
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <a href={`tel:${lead.phone}`} className="text-primary hover:underline font-medium">
                      {lead.phone}
                    </a>
                    {lead.service && <span>· {lead.service}</span>}
                    {lead.source && <span>· {lead.source}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  {format(new Date(lead.created_at), "d MMM, HH:mm", { locale: ru })}
                  <span className="block text-[9px] text-muted-foreground/50">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ru })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="font-display text-lg font-bold mb-4">Быстрый доступ</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center gap-3 bg-white border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-[0_4px_20px_-4px_oklch(0.82_0.19_85/0.2)] transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground truncate">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
