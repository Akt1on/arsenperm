import { useEffect, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { X, Gift, ArrowRight } from "lucide-react";
import { CallbackForm } from "@/components/site/CallbackForm";

const STORAGE_KEY = "exit-popup-shown-v2";

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let timer: number | undefined;
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") trigger();
    };

    function trigger() {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
      cleanup();
    }

    function cleanup() {
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      if (timer) window.clearTimeout(timer);
    }

    // Mobile fallback: trigger after 60s
    timer = window.setTimeout(trigger, 60_000);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return cleanup;
  }, []);

  return (
    <LazyMotion features={domAnimation}>
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <m.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-[var(--gold)]/30 bg-surface p-7 md:p-9 shadow-2xl"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full hover:bg-surface-2 transition"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="mx-auto h-14 w-14 rounded-2xl btn-gold grid place-items-center shadow-gold mb-4">
              <Gift className="h-7 w-7 text-background" />
            </div>

            <div className="text-xs uppercase tracking-[0.3em] text-[var(--gold)] text-center mb-2">
              Подождите!
            </div>
            <h3 className="font-display text-2xl md:text-3xl tracking-wide text-center text-foreground leading-tight mb-1">
              Оставьте заявку — <span className="text-gradient-gold">бесплатный</span> выезд замерщика
            </h3>
            <p className="mt-2 text-sm text-center text-muted-foreground mb-5">
              Рассчитаем смету на месте. Перезвоним в течение 15 минут в рабочее время.
            </p>

            <CallbackForm source="exit-popup" compact />

            <button
              onClick={() => setOpen(false)}
              className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground transition"
            >
              Нет, спасибо
            </button>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
    </LazyMotion>
  );
}
