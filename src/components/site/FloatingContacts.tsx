import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, MessageCircle, Send, X, MessagesSquare } from "lucide-react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { fetchSettings } from "@/lib/site-data";

export function FloatingContacts() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 5 * 60 * 1000 });
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true }); // BUG FIX: passive
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const contacts = settings?.contacts ?? {};
  const phone    = contacts.phone ?? "+7 (342) 277-77-10";
  const whatsapp = (contacts.whatsapp ?? "").replace(/[^\d]/g, "");
  const telegram = (contacts.telegram ?? "").replace(/^@/, "");
  const max      = contacts.max ?? "";

  const items = [
    whatsapp && { href: `https://wa.me/${whatsapp}`, label: "WhatsApp", icon: MessageCircle, bg: "bg-[#25D366]" },
    telegram && { href: `https://t.me/${telegram}`,  label: "Telegram",  icon: Send,          bg: "bg-[#229ED9]" },
    max      && { href: max,                          label: "Max",       icon: MessagesSquare,bg: "bg-[#0077FF]" },
    {
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
      label: "Позвонить",
      icon: Phone,
      bg: "bg-foreground",
    },
  ].filter(Boolean) as { href: string; label: string; icon: any; bg: string }[];

  if (!visible) return null;

  return (
    <LazyMotion features={domAnimation}>
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2.5"
          >
            {items.map((it, i) => (
              <m.a
                key={it.label}
                href={it.href}
                target={it.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={it.label}
                title={it.label}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`group flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-full text-white font-semibold shadow-[0_8px_24px_-4px_oklch(0_0_0/0.35)] ${it.bg} hover:scale-105 transition-transform text-sm`}
              >
                <it.icon className="h-4.5 w-4.5" aria-hidden="true" />
                {it.label}
              </m.a>
            ))}
          </m.div>
        )}
      </AnimatePresence>

      {/* Кнопка-триггер */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Закрыть" : "Связаться с нами"}
        aria-expanded={open}
        className="relative h-14 w-14 rounded-full btn-gold grid place-items-center shadow-[0_8px_32px_-4px_oklch(0.82_0.19_85/0.6)]"
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping pointer-events-none" />
        )}
        <m.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          {open ? <X className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
        </m.div>
      </button>
    </div>
    </LazyMotion>
  );
}
