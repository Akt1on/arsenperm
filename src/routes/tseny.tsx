import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchServices, fetchSettings } from "@/lib/site-data";
import { Section } from "@/components/site/Section";
import { CallbackForm } from "@/components/site/CallbackForm";
import { Phone, Check } from "lucide-react";

const BASE = "https://permasfalt59.ru";

export const Route = createFileRoute("/tseny")({
  component: PricesPage,
});

// Статичный прайс — дублирует БД, но всегда виден поисковику без JS
const PRICE_TABLE = [
  {
    category: "Асфальтирование",
    slug: "asfaltirovanie",
    items: [
      { name: "Дорожки и малые площади (до 50 м²)", unit: "м²", price: "от 1 800" },
      { name: "Площади 50–300 м²", unit: "м²", price: "от 1 500" },
      { name: "Парковки и проезды 300–1000 м²", unit: "м²", price: "от 1 300" },
      { name: "Крупные объекты от 1000 м²", unit: "м²", price: "от 1 100" },
      { name: "Только укладка (без подготовки основания)", unit: "м²", price: "от 700" },
      { name: "Подготовка щебёночного основания 200 мм", unit: "м²", price: "от 400" },
    ],
  },
  {
    category: "Ямочный ремонт",
    slug: "yamochnyy-remont",
    items: [
      { name: "Ямочный ремонт горячим асфальтом", unit: "м²", price: "от 500" },
      { name: "Карточный метод (фрезерование + укладка)", unit: "м²", price: "от 800" },
      { name: "Литой асфальт (ямы до 0,5 м²)", unit: "шт", price: "от 1 200" },
    ],
  },
  {
    category: "Тротуарная плитка",
    slug: "trotuarnaya-plitka",
    items: [
      { name: "Укладка плитки 6 см (дорожки, тротуары)", unit: "м²", price: "от 1 200" },
      { name: "Укладка плитки 8 см (парковки)", unit: "м²", price: "от 1 400" },
      { name: "Подготовка основания (щебень + ЦПС)", unit: "м²", price: "от 450" },
      { name: "Установка бордюрного камня", unit: "п.м", price: "от 350" },
    ],
  },
  {
    category: "Земляные работы",
    slug: "zemlyanye-raboty",
    items: [
      { name: "Разработка грунта экскаватором", unit: "м³", price: "от 250" },
      { name: "Планировка площадки бульдозером", unit: "м²", price: "от 50" },
      { name: "Рытьё траншей до 2 м", unit: "п.м", price: "от 700" },
      { name: "Вывоз грунта самосвалом", unit: "рейс", price: "от 4 000" },
    ],
  },
  {
    category: "Демонтаж",
    slug: "demontazh",
    items: [
      { name: "Демонтаж асфальта (экскаватор + гидромолот)", unit: "м²", price: "от 400" },
      { name: "Демонтаж бетонных плит", unit: "м²", price: "от 500" },
      { name: "Снос кирпичного строения до 100 м²", unit: "м²", price: "от 2 500" },
    ],
  },
  {
    category: "Вывоз мусора",
    slug: "vyvoz-musora",
    items: [
      { name: "Контейнер 8 м³ (доставка + вывоз)", unit: "конт.", price: "от 8 000" },
      { name: "Контейнер 20 м³ (доставка + вывоз)", unit: "конт.", price: "от 16 000" },
      { name: "Самосвал 10 т (вывоз + утилизация)", unit: "рейс", price: "от 3 500" },
    ],
  },
  {
    category: "Аренда спецтехники",
    slug: "arenda-spetstekhniki",
    items: [
      { name: "Экскаватор-погрузчик JCB", unit: "час", price: "от 2 500" },
      { name: "Гусеничный экскаватор", unit: "час", price: "от 3 500" },
      { name: "Бульдозер Б10/Т170", unit: "час", price: "от 3 000" },
      { name: "Асфальтовый каток 8–12 т", unit: "час", price: "от 2 000" },
      { name: "Самосвал 20 т", unit: "час", price: "от 1 800" },
    ],
  },
  {
    category: "Доставка материалов",
    slug: "dostavka-nerudnykh",
    items: [
      { name: "Щебень 5–20 мм (~10 м³)", unit: "рейс", price: "от 12 000" },
      { name: "Песок строительный (~10 м³)", unit: "рейс", price: "от 8 000" },
      { name: "ПГС (~10 м³)", unit: "рейс", price: "от 9 000" },
      { name: "Чернозём (~10 м³)", unit: "рейс", price: "от 9 500" },
    ],
  },
];

function PricesPage() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 5 * 60 * 1000 });
  const phone = settings?.contacts?.phone ?? "+7 (342) 277-77-10";

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[oklch(0.20_0.008_60)]">
        <div className="h-1" style={{ background: "var(--gradient-primary)" }} />
        <div className="container-x pt-12">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2 text-xs text-white/40">
              <li><Link to="/" className="hover:text-primary transition">Главная</Link></li>
              <span>/</span>
              <li className="text-white/70">Цены</li>
            </ol>
          </nav>
          <div className="chip chip-primary mb-4">Прайс-лист</div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none">
            ЦЕНЫ {new Date().getFullYear()}
          </h1>
          <p className="mt-5 text-white/60 max-w-xl leading-relaxed">
            Актуальные цены на асфальтирование и благоустройство в Перми.
            Без скрытых наценок — точная смета после бесплатного выезда.
          </p>
        </div>
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/50" />
        <div className="container-x relative z-10">
          <div className="bg-white rounded-3xl border border-border shadow-[var(--shadow-card)] border border-border p-10 shadow-2xl max-w-3xl">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">{`Прайс-лист ${new Date().getFullYear()}`}</div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Цены на асфальтирование в Перми
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Актуальный прайс-лист на все виды работ. Цены фиксируются в договоре — никаких скрытых доплат. Бесплатный выезд замерщика и смета.
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
              {["Фиксированная цена в договоре", "Гарантия 3 года", "НДС включён"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" /> {t}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="btn-gold rounded-xl px-6 py-3 font-semibold inline-flex items-center gap-2">
                <Phone className="h-4 w-4" /> {phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Price tables */}
      <div className="container-x pb-20 space-y-10">
        {PRICE_TABLE.map((cat) => (
          <div key={cat.slug} id={cat.slug} className="bg-white rounded-2xl border border-border shadow-[var(--shadow-card)] card-accent-top border border-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-xl font-bold">{cat.category}</h2>
              <Link to="/services/$slug" params={{ slug: cat.slug }} className="text-sm text-primary hover:underline">
                Подробнее об услуге →
              </Link>
            </div>
            <div className="divide-y divide-border/30">
              {cat.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between px-6 py-4 hover:bg-surface/50 transition">
                  <span className="text-sm">{item.name}</span>
                  <div className="text-right shrink-0 ml-4">
                    <span className="font-display font-bold text-primary">{item.price} ₽</span>
                    <span className="text-xs text-muted-foreground"> / {item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Note */}
        <div className="bg-white rounded-2xl border border-border shadow-[var(--shadow-card)] card-accent-top border border-border p-6 text-sm text-muted-foreground space-y-2">
          <p>* Цены указаны ориентировочно и зависят от объёма, удалённости объекта и сложности работ.</p>
          <p>* Окончательная стоимость фиксируется в договоре после бесплатного выезда замерщика.</p>
          <p>* Работаем с физическими и юридическими лицами. НДС, безналичный расчёт, полный пакет документов.</p>
        </div>

        {/* CTA */}
        <Section eyebrow="Получить точную смету" title="Бесплатный замер и расчёт стоимости" subtitle="Выедем, осмотрим объект и подготовим смету в день визита — без обязательств.">
          <div className="max-w-lg bg-white rounded-2xl border border-border shadow-[var(--shadow-card)] p-8 border border-border">
            <CallbackForm source="prices-page" />
          </div>
        </Section>
      </div>
    </>
  );
}
