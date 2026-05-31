import { useMemo, useState } from "react";
import { m } from "framer-motion";
import { ArrowRight, Calculator, CheckCircle2, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";

// ─── Data ─────────────────────────────────────────────────────────────────────

const COVERAGE_TYPES = [
  { id: "asfalt",      label: "Асфальт",             emoji: "🛣️",  price: 1500 },
  { id: "plitka",      label: "Тротуарная плитка",    emoji: "🧱",  price: 2200 },
  { id: "shcheben",    label: "Щебень / гравий",      emoji: "🪨",  price: 800  },
  { id: "grunt",       label: "Грунтовые работы",     emoji: "⛏️",  price: 600  },
];

const BASE_TYPES = [
  { id: "ready",    label: "Основание готово",        k: 1.00 },
  { id: "prep",     label: "Нужна подготовка",        k: 1.30 },
  { id: "demolish", label: "С демонтажом старого",    k: 1.55 },
];

const AREA_PRESETS = [
  { label: "Двор",         value: 100  },
  { label: "Парковка",     value: 300  },
  { label: "Территория",   value: 1000 },
  { label: "Дорога",       value: 3000 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function CalculatorSection() {
  const [coverage, setCoverage] = useState(COVERAGE_TYPES[0].id);
  const [base, setBase]         = useState(BASE_TYPES[0].id);
  const [area, setArea]         = useState(200);

  const { priceMin, priceMax } = useMemo(() => {
    const ct = COVERAGE_TYPES.find((x) => x.id === coverage)!;
    const bt = BASE_TYPES.find((x) => x.id === base)!;
    const base_cost = ct.price * area * bt.k;
    return {
      priceMin: Math.round(base_cost * 0.9 / 100) * 100,
      priceMax: Math.round(base_cost * 1.15 / 100) * 100,
    };
  }, [coverage, base, area]);

  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="container-x">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="chip chip-primary mb-4">Калькулятор</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight text-foreground">
            РАССЧИТАЙТЕ СТОИМОСТЬ{" "}
            <span className="text-gradient-gold">ЗА 30 СЕКУНД</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Ориентировочная цена. Точную смету подготовим бесплатно после выезда замерщика на объект.
          </p>
        </div>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid lg:grid-cols-[1fr_380px] gap-6 items-stretch"
        >
          {/* ── Left: controls ── */}
          <div className="bg-white rounded-2xl border border-border p-6 md:p-8 shadow-[var(--shadow-card)]">
            {/* Coverage type */}
            <Group label="Тип покрытия">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COVERAGE_TYPES.map((ct) => (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => setCoverage(ct.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-semibold transition-all ${
                      coverage === ct.id
                        ? "border-primary bg-primary/5 text-foreground shadow-[var(--shadow-gold)]"
                        : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-xl">{ct.emoji}</span>
                    {ct.label}
                  </button>
                ))}
              </div>
            </Group>

            {/* Base type */}
            <Group label="Состояние основания">
              <div className="flex flex-col sm:flex-row gap-2">
                {BASE_TYPES.map((bt) => (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setBase(bt.id)}
                    className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                      base === bt.id
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {bt.label}
                  </button>
                ))}
              </div>
            </Group>

            {/* Area slider */}
            <Group label={`Площадь: ${area.toLocaleString("ru-RU")} м²`}>
              {/* Quick presets */}
              <div className="flex flex-wrap gap-2 mb-3">
                {AREA_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setArea(p.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      area === p.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {p.label} · {p.value} м²
                  </button>
                ))}
              </div>

              <input
                type="range"
                min={20}
                max={5000}
                step={10}
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, oklch(0.82 0.19 85) 0%, oklch(0.82 0.19 85) ${(area - 20) / (5000 - 20) * 100}%, var(--surface-2) ${(area - 20) / (5000 - 20) * 100}%, var(--surface-2) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>20 м²</span>
                <span>5 000 м²</span>
              </div>

              {/* Manual input */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Ввести точно:</span>
                <input
                  type="number"
                  value={area}
                  min={20}
                  max={5000}
                  onChange={(e) => {
                    const v = Math.min(5000, Math.max(20, Number(e.target.value) || 20));
                    setArea(v);
                  }}
                  className="w-24 bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-center focus:border-primary focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">м²</span>
              </div>
            </Group>
          </div>

          {/* ── Right: result ── */}
          <div className="btn-gold rounded-2xl p-7 md:p-8 flex flex-col justify-between shadow-[var(--shadow-gold)]">
            {/* Price */}
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-black/60 font-bold mb-3">
                <Calculator className="h-3.5 w-3.5" />
                Ориентировочная стоимость
              </div>

              <m.div
                key={priceMin}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="font-display text-4xl md:text-5xl font-bold text-black leading-none">
                  от {priceMin.toLocaleString("ru-RU")} ₽
                </div>
                <div className="font-display text-lg text-black/60 mt-1">
                  до {priceMax.toLocaleString("ru-RU")} ₽
                </div>
              </m.div>

              <div className="mt-4 text-sm text-black/70 leading-relaxed">
                За {area.toLocaleString("ru-RU")} м² — примерно{" "}
                <strong className="text-black">
                  {Math.round(priceMin / area).toLocaleString("ru-RU")}–
                  {Math.round(priceMax / area).toLocaleString("ru-RU")} ₽/м²
                </strong>
              </div>

              {/* Disclaimers */}
              <ul className="mt-5 space-y-1.5">
                {[
                  "Точная цена — после бесплатного замера",
                  "Выезд по Перми и всему краю",
                  "Смета фиксируется в договоре",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-black/70">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-black/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="mt-7 space-y-2">
              <Link
                to="/#callback"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-black text-white px-6 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-black/80 transition-colors"
              >
                Получить точный расчёт
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:+73422777710"
                className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-black/20 px-6 py-3 text-sm font-bold text-black hover:border-black/50 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Позвонить сейчас
              </a>
            </div>
          </div>
        </m.div>

        {/* Fine print */}
        <p className="mt-5 text-xs text-muted-foreground text-center max-w-2xl mx-auto">
          * Расчёт носит ориентировочный характер. Финальная стоимость зависит от состояния объекта, толщины слоёв,
          удалённости и объёма работ. Бесплатный выезд замерщика — без обязательств.
        </p>
      </div>
    </section>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
        {label}
      </div>
      {children}
    </div>
  );
}
