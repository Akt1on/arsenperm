import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Wrench, FolderKanban, Inbox, Settings, LogOut,
  Menu, X, Newspaper, Star, Images, DollarSign, Globe, ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const NAV_ITEMS = [
  { to: "/admin", label: "Обзор", icon: LayoutDashboard, exact: true },
  { to: "/admin/leads", label: "Заявки", icon: Inbox },
  { to: "/admin/services", label: "Услуги", icon: Wrench },
  { to: "/admin/projects", label: "Портфолио", icon: FolderKanban },
  { to: "/admin/gallery", label: "Галерея", icon: Images },
  { to: "/admin/prices", label: "Прайс-лист", icon: DollarSign },
  { to: "/admin/reviews", label: "Отзывы", icon: Star },
  { to: "/admin/posts", label: "Блог", icon: Newspaper },
  { to: "/admin/settings", label: "Настройки", icon: Settings },
] as const;

function useNewLeadsCount() {
  return useQuery({
    queryKey: ["admin-new-leads-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      return count ?? 0;
    },
    refetchInterval: 30_000,
  });
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const { data: newLeads = 0 } = useNewLeadsCount();

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Загрузка…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-4 text-center bg-background">
        <div className="bg-white border border-border rounded-2xl p-8 max-w-md shadow-[var(--shadow-elevated)]">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 grid place-items-center mx-auto mb-4">
            <Settings className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Доступ запрещён</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Этот аккаунт не имеет прав администратора.
          </p>
          <button
            onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }}
            className="btn-gold rounded-xl px-6 py-3 font-bold text-sm w-full"
          >
            Выйти и вернуться
          </button>
        </div>
      </div>
    );
  }

  const SidebarContent = (
    <>
      <div className="px-4 py-5 border-b border-border">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl btn-gold grid place-items-center shrink-0">
            <Globe className="h-4 w-4 text-black" />
          </div>
          <div className="leading-none">
            <div className="font-display text-base font-bold text-foreground">
              ПЕРМЬ АСФАЛЬТ <span className="text-gradient-gold">59</span>
            </div>
            <div className="text-[10px] text-muted-foreground tracking-wider">Админ-панель</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? path === item.to : path.startsWith(item.to);
          const badge = item.to === "/admin/leads" && newLeads > 0 ? newLeads : null;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-gold)]"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge && (
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                  active ? "bg-black/20 text-black" : "bg-destructive text-white"
                }`}>
                  {badge}
                </span>
              )}
              {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-0.5">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-all"
        >
          <Globe className="h-4 w-4 shrink-0" />
          Открыть сайт
        </Link>
        <button
          onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Выйти
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="hidden lg:flex w-64 border-r border-border bg-white flex-col fixed inset-y-0 left-0 z-30">
        {SidebarContent}
      </aside>

      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 border-b border-border bg-white/95 backdrop-blur flex items-center justify-between px-4">
        <Link to="/" className="font-display font-bold text-base">
          ПЕРМЬ АСФАЛЬТ <span className="text-gradient-gold">59</span>
        </Link>
        <div className="flex items-center gap-2">
          {newLeads > 0 && (
            <span className="h-5 w-5 rounded-full bg-destructive text-white text-[10px] font-bold grid place-items-center">
              {newLeads > 9 ? "9+" : newLeads}
            </span>
          )}
          <button
            onClick={() => setOpen(true)}
            aria-label="Открыть меню"
            className="p-2 rounded-xl hover:bg-surface-2"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white border-r border-border flex flex-col shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              aria-label="Закрыть меню"
              className="absolute top-3.5 right-3 h-8 w-8 grid place-items-center rounded-lg hover:bg-surface-2"
            >
              <X className="h-4 w-4" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-14 lg:pt-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
