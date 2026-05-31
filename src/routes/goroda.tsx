import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Section } from "@/components/site/Section";
import { CITIES } from "./goroda.$city";

const BASE = "https://permasfalt59.ru";

export const Route = createFileRoute("/goroda")({
  head: () => ({
    meta: [
      { title: "Асфальтирование в городах Пермского края — Пермь Асфальт 59" },
      { name: "description", content: "Выполняем асфальтирование, укладку тротуарной плитки и благоустройство в Перми, Краснокамске, Березниках, Соликамске, Чайковском, Кунгуре и других городах Пермского края." },
      { name: "keywords", content: "асфальтирование Пермский край, укладка асфальта города Пермский край, благоустройство Пермский край, асфальтирование Пермь Краснокамск Березники, дорожные работы Пермский край" },
      { property: "og:title", content: "Асфальтирование в городах Пермского края | Пермь Асфальт 59" },
      { property: "og:description", content: "Работаем в Перми, Краснокамске, Березниках, Соликамске, Чайковском и других городах. Бесплатный выезд, гарантия 3 года." },
      { property: "og:url", content: BASE + "/goroda" },
      { property: "og:image", content: BASE + "/og-image.png" },
      { property: "og:site_name", content: "Пермь Асфальт 59" },
    ],
    links: [{ rel: "canonical", href: BASE + "/goroda" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: BASE + "/" },
            { "@type": "ListItem", position: 2, name: "Города", item: BASE + "/goroda" },
          ],
        }),
      },
    ],
  }),
  component: CitiesPage,
});

function CitiesPage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-[oklch(0.20_0.008_60)]">
        <div className="h-1" style={{ background: "var(--gradient-primary)" }} />
        <div className="container-x pt-12">
          <div className="chip chip-primary mb-4">География работ</div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none">
            РАБОТАЕМ ПО ВСЕМУ<br />
            <span className="text-gradient-gold">ПЕРМСКОМУ КРАЮ</span>
          </h1>
          <p className="mt-5 text-white/60 max-w-xl leading-relaxed">
            Выполняем асфальтирование, укладку плитки, земляные работы и комплексное благоустройство в Перми и более чем в 10 городах края.
          </p>
        </div>
      </section>

      <Section eyebrow="Города" title="Выберите ваш город">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(CITIES).map(([slug, c]) => (
            <Link
              key={slug}
              to="/goroda/$city"
              params={{ city: slug }}
              className="group bg-white rounded-2xl border border-border p-6 hover:border-primary/50 hover:shadow-[var(--shadow-elevated)] transition-all card-accent-top"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{c.name}</div>
                  {c.population && <div className="text-xs text-muted-foreground mb-2">~{c.population} чел.</div>}
                  <div className="text-sm text-muted-foreground line-clamp-2">{c.description}</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-primary font-medium group-hover:underline">
                Асфальтирование в {c.nameRod} →
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
