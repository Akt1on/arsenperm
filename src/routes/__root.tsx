import { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouterState, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingContacts } from "@/components/site/FloatingContacts";
import { CookieBanner } from "@/components/site/CookieBanner";
import { PageTransition } from "@/components/site/PageTransition";
import { ExitIntentPopup } from "@/components/site/ExitIntentPopup";
import { fetchSettings, fetchServices } from "@/lib/site-data";

const TOP_SERVICES = [
  { slug: "asfaltirovanie", label: "Асфальтирование" },
  { slug: "trotuarnaya-plitka", label: "Тротуарная плитка" },
  { slug: "yamochnyy-remont", label: "Ямочный ремонт" },
  { slug: "zemlyanye-raboty", label: "Земляные работы" },
  { slug: "demontazh", label: "Демонтаж" },
  { slug: "arenda-spetstekhniki", label: "Аренда спецтехники" },
];

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex items-center bg-background px-4 py-20">
      <div className="container-x max-w-2xl mx-auto text-center">
        <div className="text-[8rem] font-display font-bold leading-none text-gradient-gold">404</div>
        <h1 className="text-2xl font-bold mt-2 mb-2">Страница не найдена</h1>
        <p className="text-muted-foreground mb-8">Возможно, адрес изменился или страница была удалена.</p>
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {TOP_SERVICES.map((s) => (
            <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} className="rounded-full border border-border/60 px-4 py-2 text-sm hover:border-primary/50 hover:text-primary transition">{s.label}</Link>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-gold rounded-lg px-6 py-3 font-semibold inline-block">На главную</Link>
          <Link to="/contacts" className="rounded-lg border border-border px-6 py-3 font-semibold hover:border-primary/50 transition">Контакты</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold">Что-то пошло не так</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-6 btn-gold rounded-lg px-6 py-3 font-semibold">Попробовать снова</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.prefetchQuery({ queryKey: ["settings"], queryFn: fetchSettings }),
      queryClient.prefetchQuery({ queryKey: ["services"], queryFn: fetchServices }),
    ]);
  },
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
  component: RootComponent,
});

function RootComponent() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = path.startsWith("/admin") || path === "/auth";

  return (
    <>
      {isAdmin ? (
        <Outlet />
      ) : (
        <div className="flex min-h-screen flex-col">
          <div className="promo-bar text-center py-2 px-4 text-xs font-bold uppercase tracking-[0.2em] hidden md:block">
            ⚡ Бесплатный выезд замерщика · Гарантия 3 года в договоре · Работаем с 2010 года ⚡
          </div>
          <Header />
          <main className="flex-1">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
          <Footer />
          <FloatingContacts />
          <CookieBanner />
          <ExitIntentPopup />
        </div>
      )}
      <Toaster richColors closeButton />
    </>
  );
}
