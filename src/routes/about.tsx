import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Shield, Truck, Users, CheckCircle2, Phone } from "lucide-react";
import { fetchSettings } from "@/lib/site-data";
import { CallbackForm } from "@/components/site/CallbackForm";

const BASE = "https://permasfalt59.ru";
const ABOUT_URL = BASE + "/about";
const ABOUT_TITLE = "О компании Пермь Асфальт 59 — подрядчик по асфальтированию в Перми с 2010 года";
const ABOUT_DESCRIPTION = "Пермь Асфальт 59 — 15 лет опыта, собственный парк спецтехники, 500+ выполненных объектов. Асфальтирование, тротуарная плитка, земляные работы в Перми и Пермском крае. Договор, гарантия 3 года.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: ABOUT_TITLE },
      { name: "description", content: ABOUT_DESCRIPTION },
      { name: "keywords", content: "Пермь Асфальт 59 о компании, асфальтирование Пермь компания, подрядчик асфальтирование Пермь, благоустройство Пермь подрядчик, асфальтирование Пермь отзывы, асфальтирование Пермь гарантия, дорожное строительство Пермь компания" },
      { property: "og:title", content: ABOUT_TITLE },
      { property: "og:description", content: ABOUT_DESCRIPTION },
      { property: "og:url", content: ABOUT_URL },
      { property: "og:image", content: "https://permasfalt59.ru/og-image.png" },
      { property: "og:site_name", content: "Пермь Асфальт 59" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: ABOUT_URL }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": ABOUT_URL + "/#page",
        name: ABOUT_TITLE,
        url: ABOUT_URL,
        mainEntity: { "@type": "Organization", "@id": BASE + "/#organization" },
      }),
    }],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: Award,  title: "15+ лет опыта",    desc: "Работаем с 2010 года. Более 500 завершённых объектов разного масштаба — от частных дворов до промышленных площадок." },
  { icon: Shield, title: "Гарантия 3 года",  desc: "Весь объём работ фиксируется в договоре. Дефекты по нашей вине устраняем бесплатно в течение гарантийного срока." },
  { icon: Truck,  title: "Своя спецтехника", desc: "Собственный парк: экскаваторы, катки, самосвалы, виброплиты. Не зависим от субподрядчиков — нет задержек." },
  { icon: Users,  title: "Команда",          desc: "Штатные инженеры, бригадиры и операторы. Каждый объект ведёт персональный прораб." },
];

const FACTS = [
  "Работаем с физлицами, ИП и юридическими лицами",
  "Безналичный расчёт с НДС, полный пакет документов",
  "Выезд инженера на замер — бесплатно по всему краю",
  "Укладка асфальта — сезонная работа (апрель–октябрь)",
  "Демонтаж, земляные работы, вывоз мусора — круглый год",
  "Точные сроки фиксируются в договоре",
];

function AboutPage() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 5 * 60 * 1000 });
  const about = settings?.about ?? {};
  const phone = settings?.contacts?.phone ?? "+7 (342) 277-77-10";

  return (
    <>
      {/* Hero секция */}
      <section className="pt-32 pb-16 bg-[oklch(0.20_0.008_60)]">
        <div className="h-1" style={{ background: "var(--gradient-primary)" }} />
        <div className="container-x pt-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="chip chip-primary mb-4">О нас</div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight">
              {about.title ?? (
                <>КЛАДЁМ АСФАЛЬТ<br />
                  <span className="text-gradient-gold">С 2010 ГОДА</span>
                </>
              )}
            </h1>
            <p className="mt-6 text-lg text-white/60 max-w-2xl leading-relaxed">
              {about.text ?? "Компания Пермь Асфальт 59 специализируется на асфальтировании и комплексном благоустройстве территорий в Перми и Пермском крае. Собственная спецтехника, опытные бригады, официальный договор."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Статистика */}
      <section className="py-16 bg-white border-b border-border">
        <div className="container-x">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(about.stats ?? [
              { value: "500+", label: "объектов сдано" },
              { value: "15+",  label: "лет на рынке" },
              { value: "3",    label: "года гарантии" },
              { value: "12",   label: "городов края" },
            ]).map((s: any, i: number) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl border border-border bg-surface hover:border-primary/30 transition card-accent-top"
              >
                <div className="stat-number">{s.value}</div>
                <div className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ценности */}
      <section className="py-20 bg-background">
        <div className="container-x">
          <div className="max-w-xl mb-12">
            <div className="chip chip-primary mb-4">Наши принципы</div>
            <h2 className="font-display text-4xl font-bold text-foreground">ЧЕМ МЫ ОТЛИЧАЕМСЯ</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="bg-white rounded-2xl border border-border p-7 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)] transition-all card-accent-top"
                >
                  <div className="h-12 w-12 rounded-xl btn-gold grid place-items-center mb-5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="font-display text-xl font-bold text-foreground mb-3">{v.title}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Факты о компании */}
      <section className="py-20 bg-[oklch(0.20_0.008_60)]">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="chip chip-primary mb-4">Как мы работаем</div>
              <h2 className="font-display text-4xl font-bold text-white mb-8">ВАЖНО ЗНАТЬ</h2>
              <ul className="space-y-4">
                {FACTS.map((f, i) => (
                  <motion.li key={i}
                    initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.07 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-white/75 text-[15px] leading-relaxed">{f}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-[0_24px_80px_-20px_oklch(0_0_0/0.5)]">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse-ring" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Бесплатная консультация</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">Задайте вопрос инженеру</h3>
              <p className="text-sm text-muted-foreground mb-6">Перезвоним в течение 15 минут</p>
              <CallbackForm source="about" />
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline">
                <Phone className="h-4 w-4" /> {phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
