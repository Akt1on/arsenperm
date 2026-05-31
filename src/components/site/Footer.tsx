import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, ArrowRight, Shield, Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSettings, fetchServices } from "@/lib/site-data";

const CITIES = ["Пермь", "Краснокамск", "Березники", "Соликамск", "Чайковский", "Кунгур"];

export function Footer() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const c = settings?.contacts ?? {};

  return (
    <footer className="relative mt-24 bg-[oklch(0.16_0.008_60)] text-white">
      {/* Жёлтая полоса */}
      <div className="h-1.5" style={{ background: "var(--gradient-primary)" }} />

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <div className="container-x py-14 grid lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-10">

        {/* Колонка 1 — О компании */}
        <div className="space-y-6">
          <div>
            <div className="font-display text-2xl font-bold tracking-wide text-white">
              ПЕРМЬ АСФАЛЬТ <span className="text-gradient-gold">59</span>
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-[0.25em] mt-1">
              Асфальтирование и благоустройство
            </div>
          </div>

          <p className="text-sm text-white/65 leading-relaxed">
            Профессиональное асфальтирование территорий в Перми и Пермском крае с 2010 года.
            Более 500 завершённых объектов. Собственный парк спецтехники.
          </p>

          {/* Мини-преимущества */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: Shield, label: "Гарантия 3 года" },
              { icon: Truck, label: "Своя техника" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
              >
                <Icon className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <span className="text-xs font-semibold text-white/80">{label}</span>
              </div>
            ))}
          </div>

          {/* Города */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
              Работаем в городах
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map((city) => (
                <span
                  key={city}
                  className="text-xs bg-white/8 border border-white/12 rounded-full px-2.5 py-1 text-white/70"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Колонка 2 — Услуги */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">
            Услуги
          </h4>
          <ul className="space-y-2.5">
            {services.slice(0, 7).map((s) => (
              <li key={s.id}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors group"
                >
                  <ArrowRight className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" aria-hidden="true" />
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Колонка 3 — Компания */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">
            Компания
          </h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: "/about", label: "О нас" },
              { to: "/portfolio", label: "Портфолио" },
              { to: "/tseny", label: "Цены" },
              { to: "/blog", label: "Блог" },
              { to: "/goroda", label: "Города" },
              { to: "/contacts", label: "Контакты" },
              { to: "/privacy-policy", label: "Конфиденциальность" },
              { to: "/cookie-policy", label: "Cookies" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Колонка 4 — Контакты */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">
            Контакты
          </h4>
          <div className="space-y-4 text-sm">
            {c.phone && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/20 grid place-items-center shrink-0 mt-0.5">
                  <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Телефон</div>
                  <a
                    href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                    className="font-bold text-white hover:text-primary transition-colors text-base"
                  >
                    {c.phone}
                  </a>
                </div>
              </div>
            )}
            {c.email && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/20 grid place-items-center shrink-0 mt-0.5">
                  <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Email</div>
                  <a href={`mailto:${c.email}`} className="text-white/75 hover:text-white transition-colors">
                    {c.email}
                  </a>
                </div>
              </div>
            )}
            {c.address && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/20 grid place-items-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Адрес</div>
                  <span className="text-white/70">{c.address}</span>
                </div>
              </div>
            )}
            {c.work_hours && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/20 grid place-items-center shrink-0 mt-0.5">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Режим работы</div>
                  <span className="text-white/70">{c.work_hours}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* НИЖНЯЯ СТРОКА */}
      <div className="border-t border-white/8">
        <div className="container-x py-5 flex flex-col gap-2 items-center justify-between text-xs text-white/35 md:flex-row">
          <div>© {new Date().getFullYear()} Пермь Асфальт 59 · permasfalt59.ru</div>
          <div>Асфальтирование и благоустройство в Перми и Пермском крае</div>
          <div>Все права защищены</div>
        </div>
      </div>
    </footer>
  );
}
