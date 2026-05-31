import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { fetchServices } from "@/lib/site-data";
import { getServiceImageUrl } from "@/lib/service-images";
import { DynIcon } from "@/components/site/icon";

const BASE = "https://permasfalt59.ru";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Услуги по асфальтированию в Перми — полный прайс | Пермь Асфальт 59" },
      { name: "description", content: "Полный список услуг: асфальтирование от 1500 ₽/м², тротуарная плитка, демонтаж, земляные работы, аренда спецтехники, вывоз мусора в Перми. Договор, гарантия 3 года." },
      { name: "keywords", content: "услуги асфальтирование Пермь, укладка асфальта Пермь цена, тротуарная плитка Пермь, демонтаж асфальта Пермь, земляные работы Пермь, аренда спецтехники Пермь" },
      { property: "og:title", content: "Услуги по асфальтированию в Перми | Пермь Асфальт 59" },
      { property: "og:description", content: "Асфальтирование, тротуарная плитка, демонтаж, земляные работы и спецтехника в Перми. Бесплатный выезд, гарантия 3 года." },
      { property: "og:url", content: BASE + "/services" },
      { property: "og:site_name", content: "Пермь Асфальт 59" },
      { property: "og:image", content: "https://permasfalt59.ru/og-image.png" },
    ],
    links: [
      { rel: "canonical", href: BASE + "/services" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Услуги по асфальтированию в Перми",
        url: BASE + "/services",
        numberOfItems: 8,
      }),
    }],
  }),
  component: ServicesLayout,
});

function ServicesLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path !== "/services") return <Outlet />;
  return <ServicesIndex />;
}

function ServicesIndex() {
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const [search, setSearch] = useState("");

  const filtered = services.filter((s) =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || (s.short_description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[oklch(0.20_0.008_60)]">
        <div className="h-1" style={{ background: "var(--gradient-primary)" }} />
        <div className="container-x pt-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="chip chip-primary mb-4">Услуги</div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none">
              КОМПЛЕКСНОЕ<br />
              <span className="text-gradient-gold">БЛАГОУСТРОЙСТВО</span>
            </h1>
            <p className="mt-6 text-lg text-white/60 max-w-2xl leading-relaxed">
              Выберите направление работ: асфальтирование, тротуарная плитка, демонтаж, аренда спецтехники и другие услуги под ключ в Перми.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Поиск + карточки */}
      <section className="py-16 bg-background">
        <div className="container-x">

          {/* Поиск по услугам */}
          <div className="relative max-w-md mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Найти услугу…"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
            />
          </div>

          {/* Быстрые ссылки */}
          <div className="flex flex-wrap gap-2 mb-10">
            {services.map((s) => (
              <Link
                key={s.id}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
              >
                {s.title}
              </Link>
            ))}
          </div>

          {/* Сетка карточек */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s, i) => (
              <motion.div key={s.id}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.45, delay: i * 0.05 }}
              >
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="group flex flex-col h-full bg-white rounded-2xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-[0_8px_32px_-8px_oklch(0.82_0.19_85/0.22)] transition-all duration-300 card-accent-top"
                >
                  {/* Фото */}
                  <div className="aspect-video overflow-hidden bg-surface">
                    <img
                      src={getServiceImageUrl(s)}
                      alt={`${s.title} в Перми — Пермь Асфальт 59`}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      width={560}
                      height={315}
                    />
                  </div>

                  {/* Контент */}
                  <div className="flex flex-col flex-1 p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-11 w-11 rounded-xl btn-gold grid place-items-center shrink-0">
                        <DynIcon name={s.icon} className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground leading-tight pt-1">
                        {s.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                      {s.short_description}
                    </p>

                    {/* Цена + стрелка */}
                    <div className="flex items-center justify-between pt-5 mt-5 border-t border-border">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">от</div>
                        <div className="font-display font-bold text-lg text-foreground">
                          {s.price_from != null ? Number(s.price_from).toLocaleString("ru-RU") : "—"} ₽
                          <span className="text-xs text-muted-foreground font-normal"> / {s.price_unit}</span>
                        </div>
                      </div>
                      <div className="h-9 w-9 rounded-full bg-primary/10 grid place-items-center group-hover:bg-primary transition-colors">
                        <ArrowRight className="h-4 w-4 text-primary group-hover:text-black transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold">Ничего не найдено по запросу «{search}»</p>
              <button onClick={() => setSearch("")} className="mt-3 text-primary text-sm hover:underline">
                Сбросить поиск
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
