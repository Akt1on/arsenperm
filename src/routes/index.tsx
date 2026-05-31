import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

function useCountUp(target: number, duration = 1400, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}
import {
  ArrowRight, Check, Phone, Shield, Clock, Award, Star, Quote,
  MapPin, Plus, Minus, HardHat, Truck, Wrench, FileCheck
} from "lucide-react";
import { fetchServices, fetchProjects, fetchSettings, fetchReviews } from "@/lib/site-data";
import { Section } from "@/components/site/Section";
import { CallbackForm } from "@/components/site/CallbackForm";
import { Quiz } from "@/components/site/Quiz";
import { NeuralCanvas } from "@/components/site/NeuralCanvas";
import { PromoTimer } from "@/components/site/PromoTimer";
import { CalculatorSection } from "@/components/site/CalculatorSection";
import { DynIcon } from "@/components/site/icon";
import heroImg from "@/assets/hero-asphalt.jpg";
import heroWebp1280 from "@/assets/hero-1280.webp";
import heroWebp768  from "@/assets/hero-768.webp";

const BASE = "https://permasfalt59.ru";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const FAQS = [
  { q: "Сколько стоит асфальтирование 1 м² в Перми?", a: "Стоимость зависит от толщины слоя, площади и состояния основания. Базовая цена — от 1 500 ₽ за м² при площади от 100 м². Точную смету подготовим бесплатно после выезда замерщика." },
  { q: "Какую гарантию вы даёте на работы?", a: "Гарантия на все работы под ключ — 3 года. Гарантия закреплена в договоре. Если в течение этого срока появятся дефекты по нашей вине — устраним за свой счёт." },
  { q: "Работаете ли вы зимой?", a: "Да, выполняем расчистку, вывоз снега, демонтажные и подготовительные работы круглый год. Укладку асфальта планируем с апреля по октябрь — это требование технологии." },
  { q: "Заключаете ли вы договор с юр. лицами?", a: "Да, работаем с физлицами, ИП и юр. лицами. Все документы — договор, смета, акты, счета-фактуры. Безналичный расчёт с НДС." },
  { q: "Сколько занимает асфальтирование участка 200 м²?", a: "В среднем 1–2 рабочих дня при готовом основании. Если требуется демонтаж и подготовка — добавьте 2–3 дня. Точные сроки фиксируем в договоре." },
  { q: "Куда выезжаете кроме Перми?", a: "Работаем по всему Пермскому краю: Краснокамск, Березники, Соликамск, Чайковский, Кунгур, Лысьва, Чусовой и другие города. Выезд замерщика — бесплатно." },
];

const ADVANTAGES = [
  { icon: Award, title: "15+ лет опыта", desc: "Работаем с 2010 года. За это время — более 500 объектов в Перми и крае." },
  { icon: Shield, title: "Гарантия 3 года", desc: "Всё фиксируем в договоре. Если дефект по нашей вине — устраним бесплатно." },
  { icon: Truck, title: "Своя спецтехника", desc: "Экскаваторы, катки, самосвалы. Не зависим от подрядчиков — нет задержек." },
  { icon: FileCheck, title: "Прозрачный договор", desc: "Смета фиксируется до начала работ. Никаких доп. расходов «в конце»." },
];

const STEPS = [
  "Бесплатный выезд на объект и замер",
  "Согласование плана и стоимости",
  "Заключение договора с гарантией",
  "Подготовка материалов и техники",
  "Подготовка территории (демонтаж, дренаж)",
  "Укладка асфальта или плитки",
  "Сдача объекта, акт выполненных работ",
];

const GEO_LINKS = [
  { label: "Пермь", slug: "perm" }, { label: "Краснокамск", slug: "krasnokamsk" },
  { label: "Березники", slug: "berezniki" }, { label: "Соликамск", slug: "solikamsk" },
  { label: "Чайковский", slug: "chaykovskiy" }, { label: "Кунгур", slug: "kungur" },
  { label: "Лысьва", slug: "lysva" }, { label: "Чусовой", slug: "chusovoy" },
  { label: "Добрянка", slug: "dobryanka" }, { label: "Оса", slug: "osa" },
  { label: "Нытва", slug: "nytva" }, { label: "Верещагино", slug: "vereshchagino" },
];

function HomePage() {
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 5 * 60 * 1000 });
  const { data: reviews = [] } = useQuery({ queryKey: ["reviews"], queryFn: fetchReviews });
  const hero = settings?.hero ?? {};
  const about = settings?.about ?? {};
  const phone = settings?.contacts?.phone ?? "+7 (342) 277-77-10";
  const phoneRaw = phone.replace(/[^\d+]/g, "");

  return (
    <LazyMotion features={domAnimation} strict>
    <>
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative -mt-[65px] min-h-[100svh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <picture>
            {/* WebP — responsive: 768px мобильный, 1280px всё остальное */}
            <source
              type="image/webp"
              srcSet={`${heroWebp768} 768w, ${heroWebp1280} 1280w`}
              sizes="(max-width: 768px) 768px, 1280px"
            />
            {/* JPEG fallback */}
            <img
              src={heroImg}
              alt="Асфальтирование в Перми — профессиональная укладка асфальта"
              className="h-full w-full object-cover object-center"
              width={1280} height={720}
              loading="eager" fetchPriority="high" decoding="async"
            />
          </picture>
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent" />
          {/* Neural canvas animation */}
          <NeuralCanvas className="opacity-30" />
        </div>

        <div className="container-x relative z-10 pt-36 pb-24 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            {/* Промо-таймер */}
            <m.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="mb-4"
            >
              <PromoTimer />
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 bg-primary rounded-full px-4 py-1.5 mb-6"
            >
              <HardHat className="h-3.5 w-3.5 text-black" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                {hero.badge ?? "Работаем с 2010 года · Пермь и край"}
              </span>
            </m.div>

            <m.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-white leading-none"
              style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
            >
              {hero.title ?? (
                <>
                  АСФАЛЬТИРОВАНИЕ<br />
                  <span className="text-gradient-gold text-glow-gold">В ПЕРМИ</span>
                </>
              )}
            </m.h1>

            <m.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-5 text-lg md:text-xl text-white/80 max-w-xl leading-relaxed font-light"
            >
              {hero.subtitle ?? "Укладка асфальта, тротуарная плитка, земляные работы и спецтехника. Собственный парк техники, гарантия 3 года, договор."}
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <m.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link to="/services" className="btn-gold inline-flex items-center gap-2 rounded-xl px-7 py-4 text-sm uppercase tracking-wide">
                  Наши услуги <ArrowRight className="h-4 w-4" />
                </Link>
              </m.div>
              <m.a
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                href={`tel:${phoneRaw}`}
                className="inline-flex items-center gap-2.5 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-md px-7 py-4 font-bold text-white hover:border-white/60 hover:bg-white/20 transition text-sm"
              >
                <Phone className="h-4 w-4" /> {phone}
              </m.a>
            </m.div>

            <m.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
              className="mt-12 grid grid-cols-3 gap-0 max-w-md"
            >
              <HeroStat num={15} suffix="+" label="лет работы" delay={600} divider={false} />
              <HeroStat num={3} suffix="" label="года гарантии" delay={800} divider />
              <HeroStat num={500} suffix="+" label="объектов" delay={1000} divider />
            </m.div>
          </div>

          <m.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.35 }}
            className="lg:col-span-5"
            id="callback"
          >
            <div className="bg-white rounded-2xl p-7 shadow-[0_24px_80px_-20px_oklch(0_0_0/0.55)]">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse-ring" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  Бесплатный выезд
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                Получите расчёт за 15 минут
              </h3>
              <div className="flex flex-col gap-1.5 mb-5 mt-3">
                {["Замер — бесплатно", "Смета на месте", "Договор с гарантией 3 года"].map((g) => (
                  <div key={g} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {g}
                  </div>
                ))}
              </div>
              <CallbackForm source="hero" />
            </div>
          </m.div>
        </div>
        <div className="absolute bottom-0 inset-x-0 divider-road opacity-40" />
      </section>

      {/* ═══════════════════════ ТРАСТОВАЯ СТРОКА ═══════════════════════ */}
      <section className="bg-[oklch(0.20_0.008_60)] py-5">
        <div className="container-x">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-white/70 text-sm">
            {[
              { icon: Shield, text: "Гарантия 3 года в договоре" },
              { icon: Truck, text: "Собственный парк спецтехники" },
              { icon: Clock, text: "Перезвоним за 15 минут" },
              { icon: Wrench, text: "Работаем с 2010 года" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ УСЛУГИ ═══════════════════════ */}
      <Section
        eyebrow="Что мы делаем"
        title={<>Полный цикл <span className="text-gradient-gold">благоустройства</span></>}
        subtitle="Берём объект под ключ — от замеров до подписания акта. Своя техника, опытные бригады, договор и гарантия."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <m.div key={s.id}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <Link
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="group relative flex flex-col h-full bg-white rounded-2xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-[0_8px_32px_-8px_oklch(0.82_0.19_85/0.25)] transition-all duration-400 card-accent-top"
              >
                <div className="px-7 pt-7 pb-5">
                  <div className="h-12 w-12 rounded-xl btn-gold grid place-items-center mb-5 shrink-0">
                    <DynIcon name={s.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight">{s.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{s.short_description}</p>
                </div>
                <div className="mt-auto flex items-center justify-between px-7 py-5 border-t border-border">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">от</div>
                    <div className="font-display text-lg font-bold text-foreground">
                      {s.price_from != null ? Number(s.price_from).toLocaleString("ru-RU") : "—"} ₽
                      <span className="text-xs text-muted-foreground font-normal"> / {s.price_unit}</span>
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-primary/10 grid place-items-center group-hover:bg-primary transition-colors">
                    <ArrowRight className="h-4 w-4 text-primary group-hover:text-black transition-colors" />
                  </div>
                </div>
              </Link>
            </m.div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════ QUIZ ═══════════════════════ */}
      <Quiz />

      {/* ═══════════════════════ КАЛЬКУЛЯТОР ═══════════════════════ */}
      <CalculatorSection />

      {/* ═══════════════════════ ПРЕИМУЩЕСТВА ═══════════════════════ */}
      <section className="py-20 bg-[oklch(0.20_0.008_60)]">
        <div className="container-x">
          <div className="max-w-xl mb-12">
            <div className="chip chip-white mb-4">Почему мы</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight heading-underline">
              РАБОТАЕМ ПО ДОГОВОРУ
            </h2>
            <p className="mt-6 text-white/60 leading-relaxed">
              Мы — не посредники. Собственная техника, обученные бригады, прямая ответственность.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ADVANTAGES.map((a, i) => (
              <m.div key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1 }}
                className="relative rounded-2xl border border-white/10 bg-white/5 p-7 hover:border-primary/40 hover:bg-white/8 transition-all overflow-hidden"
              >
                <span className="absolute top-4 right-5 font-display text-5xl font-bold text-white/5 leading-none select-none">{String(i + 1).padStart(2, "0")}</span>
                <div className="h-11 w-11 rounded-xl bg-primary/15 grid place-items-center mb-5">
                  <a.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="font-display text-lg font-bold text-white mb-2">{a.title}</div>
                <p className="text-sm text-white/55 leading-relaxed">{a.desc}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ЭТАПЫ ═══════════════════════ */}
      <Section eyebrow="Как мы работаем" title={<>7 этапов до <span className="text-gradient-gold">сдачи объекта</span></>}>
        <div className="grid lg:grid-cols-2 gap-3">
          {STEPS.map((step, i) => (
            <m.div key={i}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-center gap-5 bg-white rounded-2xl border border-border px-6 py-5 hover:border-primary/40 hover:shadow-[0_4px_20px_-4px_oklch(0.82_0.19_85/0.15)] transition-all card-accent-top"
            >
              <div className="font-display text-3xl font-bold text-primary/30 w-12 shrink-0 leading-none">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 font-semibold text-foreground text-[15px]">{step}</div>
              <div className="h-7 w-7 rounded-full bg-primary/10 grid place-items-center shrink-0">
                <Check className="h-4 w-4 text-primary" />
              </div>
            </m.div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════ ПОРТФОЛИО ═══════════════════════ */}
      {projects.length > 0 && (
        <Section eyebrow="Портфолио" title="Наши объекты" subtitle="Фрагмент выполненных работ. Полная галерея с фото в разделе портфолио.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.slice(0, 6).map((p, i) => (
              <m.div key={p.id}
                initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <Link
                  to="/portfolio/$slug"
                  params={{ slug: p.slug }}
                  className="group block relative overflow-hidden rounded-2xl aspect-[4/5] bg-surface border border-border"
                >
                  {p.cover_image && (
                    <img
                      src={p.cover_image}
                      alt={`${p.title} — Пермь Асфальт 59`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                      loading="lazy" width={400} height={500}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    {p.category && <div className="chip chip-primary mb-2">{p.category}</div>}
                    <h3 className="font-display text-xl font-bold text-white leading-tight">{p.title}</h3>
                    <div className="mt-3 flex items-center gap-2 text-sm text-primary opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all font-semibold">
                      Смотреть проект <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </m.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/portfolio" className="inline-flex items-center gap-2 bg-white border border-border rounded-xl px-6 py-3 font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-all shadow-[var(--shadow-card)]">
              Все объекты <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          </div>
        </Section>
      )}

      {/* ═══════════════════════ О КОМПАНИИ ═══════════════════════ */}
      <section className="py-20 bg-[oklch(0.20_0.008_60)]">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="chip chip-white mb-4">О компании</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                {about.title ?? "КЛАДЁМ АСФАЛЬТ И ПЛИТКУ С 2010 ГОДА"}
              </h2>
              <p className="mt-5 text-white/60 leading-relaxed">
                {about.text ?? "Компания Пермь Асфальт 59 специализируется на асфальтировании дворов, парковок, дорог и промышленных территорий в Перми и Пермском крае. Полный цикл работ от замера до сдачи объекта."}
              </p>
              <Link to="/about" className="inline-flex items-center gap-2 mt-6 text-primary font-semibold hover:underline text-sm">
                Подробнее о компании <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(about.stats ?? [
                { value: "500+", label: "объектов сдано" },
                { value: "15+", label: "лет на рынке" },
                { value: "3 года", label: "гарантия" },
                { value: "24/7", label: "выезд по заявке" },
              ]).map((s: any, i: number) => (
                <m.div key={i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7 text-center hover:border-primary/40 transition"
                >
                  <div className="stat-number">{s.value}</div>
                  <div className="mt-2 text-xs text-white/50 uppercase tracking-widest">{s.label}</div>
                </m.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ОТЗЫВЫ ═══════════════════════ */}
      {reviews.length > 0 && (
        <Section eyebrow="Отзывы клиентов" title="Что говорят о нас" subtitle="Более 127 отзывов от клиентов в Перми и Пермском крае.">
          <div className="grid md:grid-cols-3 gap-5">
            {reviews.map((r, i) => (
              <m.div key={r.id}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative bg-white rounded-2xl border border-border p-7 hover:border-primary/30 hover:shadow-[var(--shadow-elevated)] transition-all card-accent-top"
              >
                <Quote className="h-7 w-7 text-primary/25 absolute top-5 right-5" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/85">«{r.content}»</p>
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="font-bold text-foreground">{r.author_name}</div>
                  {r.author_role && <div className="text-xs text-muted-foreground mt-0.5">{r.author_role}</div>}
                </div>
              </m.div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══════════════════════ ГЕОГРАФИЯ ═══════════════════════ */}
      <section className="py-20 bg-surface">
        <div className="container-x">
          <div className="bg-[oklch(0.20_0.008_60)] rounded-3xl p-10 md:p-14">
            <div className="grid lg:grid-cols-[1fr_2fr] gap-10 items-center">
              <div>
                <div className="chip chip-white mb-4">География работ</div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                  РАБОТАЕМ ПО ВСЕМУ<br />
                  <span className="text-gradient-gold">ПЕРМСКОМУ КРАЮ</span>
                </h2>
                <p className="mt-4 text-white/60 text-sm leading-relaxed">
                  Выезд инженера на замер — бесплатно в любую точку региона.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {GEO_LINKS.map(({ label, slug }) => (
                  <Link
                    key={slug}
                    to="/goroda/$city"
                    params={{ city: slug }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/75 hover:border-primary/50 hover:text-primary hover:bg-primary/10 transition-all"
                  >
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FAQ ═══════════════════════ */}
      <Section eyebrow="Частые вопросы" title={<>Отвечаем <span className="text-gradient-gold">на главное</span></>}>
        <div className="grid gap-3 max-w-4xl">
          {FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </div>
      </Section>

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section className="py-20">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-3xl bg-[oklch(0.20_0.008_60)] p-10 md:p-16">
            <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
            <NeuralCanvas className="opacity-15" />
            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="chip chip-white mb-5">Готовы начать?</div>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                  ОСТАВЬТЕ ЗАЯВКУ —<br />
                  ВЫЕДЕМ НА ЗАМЕР{" "}
                  <span className="text-gradient-gold">БЕСПЛАТНО</span>
                </h2>
                <p className="mt-5 text-white/60 leading-relaxed">
                  Перезвоним в течение 15 минут в рабочее время. Замерщик приедет и посчитает смету на месте.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <a href={`tel:${phoneRaw}`} className="btn-gold inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bold text-sm uppercase tracking-wide">
                    <Phone className="h-4 w-4" /> {phone}
                  </a>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-7 shadow-[0_24px_80px_-20px_oklch(0_0_0/0.5)]">
                <h3 className="font-display text-xl font-bold text-foreground mb-1">Заявка на замер</h3>
                <p className="text-sm text-muted-foreground mb-4">Бесплатно, без обязательств</p>
                <div className="flex flex-col gap-1.5 mb-5">
                  {["Перезвоним за 15 минут", "Замер — бесплатно", "Договор до начала работ"].map((g) => (
                    <div key={g} className="flex items-center gap-2 text-sm text-foreground/80">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {g}
                    </div>
                  ))}
                </div>
                <CallbackForm source="cta" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
    </LazyMotion>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"bg-white rounded-2xl border overflow-hidden transition-all duration-200 " + (open ? "border-primary/50 shadow-[0_4px_20px_-4px_oklch(0.82_0.19_85/0.2)]" : "border-border hover:border-primary/40")}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className={"font-display text-lg font-bold transition-colors " + (open ? "text-primary" : "text-foreground")}>{q}</span>
        <div className={"h-8 w-8 rounded-full grid place-items-center shrink-0 transition-colors " + (open ? "bg-primary" : "bg-primary/10")}>
          {open ? <Minus className="h-4 w-4 text-black" /> : <Plus className="h-4 w-4 text-primary" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-1 text-muted-foreground leading-relaxed text-[15px]">
              {a}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Animated hero stat ───────────────────────────────────────────────────────
function HeroStat({ num, suffix, label, delay, divider = true }: {
  num: number; suffix: string; label: string; delay: number; divider?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(num, 1400, started);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div ref={ref} className={`px-5 py-3 ${divider ? "border-l border-white/20" : ""}`}>
      <div className="font-display text-3xl font-bold text-primary">
        {count}{suffix}
      </div>
      <div className="text-xs text-white/55 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
