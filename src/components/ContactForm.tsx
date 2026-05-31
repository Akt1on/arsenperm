import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Loader2, CheckCircle2, Send, AlertCircle, Phone } from "lucide-react";
import { SERVICES } from "@/data/services";
import { SITE } from "@/data/site";

const schema = z.object({
  name: z.string().min(2, "Введите имя").max(100),
  phone: z
    .string()
    .min(10, "Введите телефон")
    .max(20)
    .regex(/^[\d+\s()-]+$/, "Только цифры и +"),
  service: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Необходимо согласие" }) }),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm({
  defaultService,
  variant = "card",
}: {
  defaultService?: string;
  variant?: "card" | "inline";
}) {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { service: defaultService, consent: true as unknown as true },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          service: data.service || null,
          message: data.message || null,
          source: window.location.pathname,
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Не удалось отправить заявку. Позвоните нам напрямую.");
      }
      setSent(true);
      reset({ consent: true as unknown as true });
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Не удалось отправить заявку. Позвоните нам напрямую.",
      );
    }
  };

  const wrapperClass =
    variant === "card"
      ? "glass rounded-2xl p-6 md:p-8 shadow-card relative overflow-hidden"
      : "rounded-2xl bg-surface-1/60 border border-border p-6 relative overflow-hidden";

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className={wrapperClass}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Ваше имя" error={errors.name?.message}>
            <input {...register("name")} placeholder="Иван" className="input-base" autoComplete="name" />
          </Field>
          <Field label="Телефон" error={errors.phone?.message}>
            <input
              {...register("phone")}
              placeholder="+7 (___) ___-__-__"
              className="input-base"
              inputMode="tel"
              autoComplete="tel"
            />
          </Field>
          <Field label="Услуга">
            <select {...register("service")} className="input-base">
              <option value="">— Выберите услугу —</option>
              {SERVICES.map((s) => (
                <option key={s.slug} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Объём / адрес">
            <input {...register("message")} placeholder="500 м², г. Пермь" className="input-base" />
          </Field>
        </div>

        <label className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" {...register("consent")} className="mt-0.5 accent-[var(--gold)]" />
          <span>
            Нажимая «Отправить», я соглашаюсь с{" "}
            <Link to="/politika-konfidencialnosti" className="text-[var(--gold)] underline">
              политикой обработки персональных данных
            </Link>
            .
          </span>
        </label>
        {errors.consent && <p className="mt-1 text-xs text-destructive">{errors.consent.message}</p>}
        {submitError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.97 }}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-background shadow-gold disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Отправляем…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Отправить заявку
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-2xl p-6"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="text-center max-w-sm"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-gold grid place-items-center shadow-gold mb-4">
                  <CheckCircle2 className="h-9 w-9 text-background" />
                </div>
                <h3 className="font-display text-2xl tracking-wide text-foreground">
                  Заявка принята!
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Перезвоним в течение 15 минут и согласуем выезд замерщика.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <a
                    href={`tel:${SITE.phoneRaw}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--gold)]/40 px-4 py-2.5 text-sm font-semibold text-[var(--gold)] hover:bg-[var(--gold)]/10 transition"
                  >
                    <Phone className="h-4 w-4" /> Или позвоните: {SITE.phone}
                  </a>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition"
                  >
                    Отправить ещё одну заявку
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          .input-base {
            width: 100%;
            background: var(--surface-2);
            border: 1px solid var(--border);
            color: var(--foreground);
            border-radius: 0.5rem;
            padding: 0.7rem 0.9rem;
            font-size: 0.9rem;
            transition: border-color 150ms, box-shadow 150ms;
          }
          .input-base:focus {
            outline: none;
            border-color: var(--gold);
            box-shadow: 0 0 0 3px color-mix(in oklch, var(--gold) 25%, transparent);
          }
        `}</style>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
