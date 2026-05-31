import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Calculator as CalcIcon, Sparkles } from "lucide-react";
import { IMaskInput } from "react-imask";
import { supabase } from "@/integrations/supabase/client";
import { notifyLead } from "@/lib/notify-lead";
import { toast } from "sonner";

type Answer = { type: string; coverage: string; area: number; timing: string };

const TYPES = [
  { id: "yard",       label: "Двор / парковка",        icon: "🏠", k: 1.0 },
  { id: "road",       label: "Дорога / проезд",         icon: "🛣️", k: 1.15 },
  { id: "industrial", label: "Промплощадка / склад",    icon: "🏭", k: 1.25 },
  { id: "private",    label: "Частная территория",      icon: "🌿", k: 0.95 },
];
const COVERAGE = [
  { id: "asphalt",  label: "Асфальт",            icon: "⬛", base: 1500 },
  { id: "tiles",    label: "Тротуарная плитка",  icon: "🔲", base: 2200 },
  { id: "crushed",  label: "Щебёночное покрытие",icon: "🪨", base: 700 },
  { id: "concrete", label: "Бетонная стяжка",    icon: "⬜", base: 2400 },
];
const TIMING = [
  { id: "asap",    label: "В течение недели" },
  { id: "month",   label: "В течение месяца" },
  { id: "season",  label: "В этом сезоне" },
  { id: "consult", label: "Просто консультация" },
];

export function Quiz() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answer>({ type: "", coverage: "", area: 200, timing: "" });
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const cov = COVERAGE.find((c) => c.id === a.coverage);
  const typ = TYPES.find((t) => t.id === a.type);
  const price = cov && typ ? Math.round(a.area * cov.base * typ.k) : 0;
  const totalSteps = 4;

  const submit = async () => {
    if (phone.replace(/\D/g, "").length < 11) { toast.error("Введите корректный телефон"); return; }
    setSubmitting(true);
    const summary = [
      `Тип: ${TYPES.find((t) => t.id === a.type)?.label}`,
      `Покрытие: ${cov?.label}`,
      `Площадь: ${a.area} м²`,
      `Сроки: ${TIMING.find((t) => t.id === a.timing)?.label}`,
      `Расчётная стоимость: ~${price.toLocaleString("ru-RU")} ₽`,
    ].join(" • ");
    const { error } = await supabase.from("leads").insert({ name: name || null, phone, message: summary, source: "quiz" });
    setSubmitting(false);
    if (error) { toast.error("Не удалось отправить. Попробуйте позже."); return; }
    notifyLead({
      name: name || null,
      phone,
      message: summary,
      source: "quiz",
      service: TYPES.find((t) => t.id === a.type)?.label ?? null,
    }).catch(() => {});
    setDone(true);
    toast.success("Заявка принята!");
  };

  const next = () => setStep((s) => Math.min(s + 1, totalSteps));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const canNext = (() => {
    if (step === 0) return !!a.type;
    if (step === 1) return !!a.coverage;
    if (step === 2) return a.area >= 10;
    if (step === 3) return !!a.timing;
    return true;
  })();

  return (
    <section className="py-20 bg-[oklch(0.20_0.008_60)]">
      <div className="container-x">
        {/* Заголовок секции */}
        <div className="max-w-2xl mb-12">
          <div className="chip chip-primary mb-4">
            <CalcIcon className="h-3 w-3" /> Квиз-калькулятор
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
            УЗНАЙТЕ СТОИМОСТЬ{" "}
            <span className="text-gradient-gold">ЗА 60 СЕКУНД</span>
          </h2>
          <p className="mt-4 text-white/60 leading-relaxed">
            Ответьте на 4 вопроса — рассчитаем предварительную смету и перезвоним в течение 15 минут.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_24px_80px_-20px_oklch(0_0_0/0.4)] overflow-hidden">
          {/* Прогресс-бар */}
          <div className="h-1.5 bg-surface">
            <motion.div
              className="h-full"
              style={{ background: "var(--gradient-primary)" }}
              animate={{ width: `${((step) / totalSteps) * 100}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>

          <div className="p-8 md:p-12">
            {done ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="h-20 w-20 rounded-full btn-gold grid place-items-center mx-auto mb-6 text-3xl">✓</div>
                <h3 className="font-display text-3xl font-bold text-foreground mb-3">Заявка принята!</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Наш инженер перезвонит вам в течение 15 минут и уточнит детали.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-2xl px-6 py-3">
                  <span className="font-display text-2xl font-bold text-gradient-gold">
                    ~{price.toLocaleString("ru-RU")} ₽
                  </span>
                  <span className="text-sm text-muted-foreground">предварительно</span>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  {/* Шаг счётчик */}
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-6">
                    Шаг {step + 1} из {totalSteps}
                  </div>

                  {step === 0 && (
                    <Step title="Какой объект нужно асфальтировать?">
                      <Grid>
                        {TYPES.map((t) => (
                          <Choice
                            key={t.id}
                            active={a.type === t.id}
                            onClick={() => { setA({ ...a, type: t.id }); setTimeout(next, 150); }}
                            icon={t.icon}
                          >
                            {t.label}
                          </Choice>
                        ))}
                      </Grid>
                    </Step>
                  )}

                  {step === 1 && (
                    <Step title="Какое покрытие вас интересует?">
                      <Grid>
                        {COVERAGE.map((c) => (
                          <Choice
                            key={c.id}
                            active={a.coverage === c.id}
                            onClick={() => { setA({ ...a, coverage: c.id }); setTimeout(next, 150); }}
                            icon={c.icon}
                            sub={`от ${c.base.toLocaleString("ru-RU")} ₽/м²`}
                          >
                            {c.label}
                          </Choice>
                        ))}
                      </Grid>
                    </Step>
                  )}

                  {step === 2 && (
                    <Step title="Какая площадь объекта?">
                      <div className="max-w-lg mx-auto">
                        <div className="flex items-baseline gap-3 mb-6 justify-center">
                          <input
                            type="number"
                            min={10}
                            max={50000}
                            value={a.area}
                            onChange={(e) => setA({ ...a, area: Math.min(50000, Math.max(10, Number(e.target.value) || 10)) })}
                            className="border-b-2 border-primary text-6xl font-display font-bold w-36 text-center focus:outline-none bg-transparent text-foreground"
                          />
                          <span className="text-muted-foreground text-2xl font-display">м²</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={3000}
                          step={10}
                          value={a.area}
                          onChange={(e) => setA({ ...a, area: Number(e.target.value) })}
                          className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>10 м²</span><span>3 000 м²</span>
                        </div>
                        {price > 0 && (
                          <div className="mt-8 bg-surface rounded-2xl p-6 text-center border border-border">
                            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                              Предварительная стоимость
                            </div>
                            <div className="font-display text-4xl font-bold text-gradient-gold">
                              {price.toLocaleString("ru-RU")} ₽
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Точная цена — после выезда замерщика (бесплатно)
                            </div>
                          </div>
                        )}
                      </div>
                    </Step>
                  )}

                  {step === 3 && (
                    <Step title="Когда планируете начать?">
                      <Grid>
                        {TIMING.map((t) => (
                          <Choice
                            key={t.id}
                            active={a.timing === t.id}
                            onClick={() => { setA({ ...a, timing: t.id }); setTimeout(next, 150); }}
                          >
                            {t.label}
                          </Choice>
                        ))}
                      </Grid>
                    </Step>
                  )}

                  {step === 4 && (
                    <Step title="Куда отправить расчёт?">
                      <div className="grid gap-5 max-w-md mx-auto">
                        {price > 0 && (
                          <div className="bg-surface rounded-2xl p-5 text-center border border-border mb-2">
                            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                              Ваша предварительная стоимость
                            </div>
                            <div className="font-display text-4xl font-bold text-gradient-gold">
                              {price.toLocaleString("ru-RU")} ₽
                            </div>
                          </div>
                        )}
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ваше имя (необязательно)"
                          className="border border-border rounded-xl px-4 py-3.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 bg-white transition"
                        />
                        <IMaskInput
                          mask="+7 (000) 000-00-00"
                          value={phone}
                          onAccept={(v: string) => setPhone(v)}
                          placeholder="+7 (___) ___-__-__"
                          className="border border-border rounded-xl px-4 py-3.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 bg-white transition"
                        />
                        <button
                          onClick={submit}
                          disabled={submitting}
                          className="btn-gold rounded-xl px-6 py-4 font-bold uppercase tracking-wide text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            "Отправка…"
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Получить точную смету
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-muted-foreground text-center">
                          Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                        </p>
                      </div>
                    </Step>
                  )}

                  {/* Навигация */}
                  <div className="mt-8 flex items-center justify-between">
                    <button
                      onClick={back}
                      disabled={step === 0}
                      className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <ArrowLeft className="h-4 w-4" /> Назад
                    </button>
                    {step < 4 && step !== 0 && step !== 1 && step !== 3 && (
                      <button
                        onClick={next}
                        disabled={!canNext}
                        className="btn-gold rounded-xl px-6 py-2.5 font-bold text-sm flex items-center gap-2 disabled:opacity-40"
                      >
                        Далее <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-3">{children}</div>;
}

function Choice({
  active, onClick, children, icon, sub,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: string;
  sub?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border-2 transition-all font-semibold ${
        active
          ? "border-primary bg-primary/8 text-foreground shadow-[0_0_0_4px_oklch(0.82_0.19_85/0.12)]"
          : "border-border hover:border-primary/50 bg-white text-foreground hover:bg-surface"
      }`}
    >
      <div className="flex items-start gap-3">
        {icon && <span className="text-2xl leading-none">{icon}</span>}
        <div>
          <div className="text-[15px]">{children}</div>
          {sub && <div className="text-xs text-muted-foreground mt-1 font-normal">{sub}</div>}
        </div>
        {active && (
          <div className="ml-auto h-5 w-5 rounded-full btn-gold grid place-items-center shrink-0">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
    </button>
  );
}
