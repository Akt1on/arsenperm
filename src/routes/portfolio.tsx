import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { fetchProjects } from "@/lib/site-data";
import { Section } from "@/components/site/Section";

const PORTFOLIO_URL = "https://permasfalt59.ru/portfolio";
const PORTFOLIO_TITLE = "Портфолио — выполненные проекты по асфальтированию в Перми | Пермь Асфальт 59";
const PORTFOLIO_DESCRIPTION = "Фотогалерея реализованных объектов: асфальтирование дворов и парковок, укладка тротуарной плитки, земляные работы и комплексное благоустройство в Перми и Пермском крае.";

export const Route = createFileRoute("/portfolio")({
  component: PortfolioLayout,
});

function PortfolioLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path !== "/portfolio") return <Outlet />;
  return <PortfolioIndex />;
}

function PortfolioIndex() {
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[oklch(0.20_0.008_60)]">
        <div className="h-1" style={{ background: "var(--gradient-primary)" }} />
        <div className="container-x pt-12">
          <div className="chip chip-primary mb-4">Портфолио</div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none">
            НАШИ <span className="text-gradient-gold">ОБЪЕКТЫ</span>
          </h1>
          <p className="mt-5 text-white/60 max-w-xl leading-relaxed">
            Фотогалерея выполненных работ в Перми и Пермском крае. Каждый проект — договор, фиксированная смета и гарантия.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container-x">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((p, i) => (
          <m.div key={p.id}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <Link to="/portfolio/$slug" params={{ slug: p.slug }} className="group block bg-white rounded-2xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-[var(--shadow-elevated)] transition-all">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={p.cover_image ?? ""} alt={p.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
              </div>
              <div className="p-6">
                <div className="text-[10px] uppercase tracking-widest text-primary mb-2">{p.category}</div>
                <h3 className="font-display text-lg font-bold leading-tight">{p.title}</h3>
                {p.location && <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {p.location}</div>}
                <div className="mt-4 flex items-center gap-2 text-sm text-primary opacity-70 group-hover:opacity-100 transition">
                  Смотреть проект <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          </m.div>
        ))}
      </div>
        </div>
      </section>
    </>
  );
}
