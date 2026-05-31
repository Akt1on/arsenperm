import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle, MessagesSquare, Send } from "lucide-react";
import { fetchSettings } from "@/lib/site-data";
import { CallbackForm } from "@/components/site/CallbackForm";

const BASE = "https://permasfalt59.ru";
const CONTACTS_URL = BASE + "/contacts";
const CONTACTS_TITLE = "Контакты — Пермь Асфальт 59 | Звоните: +7 (342) 277-77-10";
const CONTACTS_DESCRIPTION = "Контакты компании Пермь Асфальт 59: телефон +7 (342) 277-77-10, адрес — Пермь. Бесплатный выезд замерщика по Перми и Пермскому краю. Работаем пн–пт 8:00–20:00, сб 9:00–18:00.";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: CONTACTS_TITLE },
      { name: "description", content: CONTACTS_DESCRIPTION },
      { name: "keywords", content: "контакты асфальтирование Пермь, телефон Пермь Асфальт 59, адрес асфальтирование Пермь, заказать асфальтирование Пермь телефон, вызвать замерщика асфальт Пермь, обратная связь Пермь Асфальт 59" },
      { property: "og:title", content: CONTACTS_TITLE },
      { property: "og:description", content: CONTACTS_DESCRIPTION },
      { property: "og:url", content: CONTACTS_URL },
      { property: "og:site_name", content: "Пермь Асфальт 59" },
      { property: "og:image", content: "https://permasfalt59.ru/og-image.png" },
    ],
    links: [{ rel: "canonical", href: CONTACTS_URL }],
  }),
  component: ContactsPage,
});

function ContactItem({
  href, icon: Icon, iconBg = "btn-gold", label, children, target,
}: {
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  label: string;
  children: React.ReactNode;
  target?: string;
}) {
  const inner = (
    <div className="flex items-center gap-5 bg-white rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)] transition-all group card-accent-top">
      <div className={`h-13 w-13 rounded-xl ${iconBg} grid place-items-center shrink-0 h-12 w-12`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-1">{label}</div>
        <div className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
          {children}
        </div>
      </div>
    </div>
  );
  if (href) return <a href={href} target={target} rel={target ? "noreferrer noopener" : undefined}>{inner}</a>;
  return <div>{inner}</div>;
}

function ContactsPage() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 5 * 60 * 1000 });
  const c = settings?.contacts ?? {};

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[oklch(0.20_0.008_60)]">
        <div className="h-1" style={{ background: "var(--gradient-primary)" }} />
        <div className="container-x pt-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="chip chip-primary mb-4">Контакты</div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight">
              СВЯЖИТЕСЬ <span className="text-gradient-gold">С НАМИ</span>
            </h1>
            <p className="mt-5 text-white/60 max-w-xl leading-relaxed">
              Работаем без выходных. Выезд инженера на замер — бесплатно по Перми и всему краю.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Контент */}
      <section className="py-16 bg-background">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Контактные данные */}
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Наши контакты</h2>

              {c.phone && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <ContactItem href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} icon={Phone} label="Телефон">
                    {c.phone}
                    {c.phone2 && <div className="text-sm text-muted-foreground font-normal mt-0.5">{c.phone2}</div>}
                  </ContactItem>
                </motion.div>
              )}

              {c.email && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <ContactItem href={`mailto:${c.email}`} icon={Mail} label="E-mail">
                    {c.email}
                  </ContactItem>
                </motion.div>
              )}

              {c.address && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <ContactItem
                    icon={MapPin}
                    label="Адрес"
                    href={`https://yandex.ru/maps/?text=${encodeURIComponent(c.address)}`}
                    target="_blank"
                  >
                    <span itemProp="streetAddress">{c.address}</span>
                    <meta itemProp="addressLocality" content="Пермь" />
                    <meta itemProp="addressRegion" content="Пермский край" />
                    <meta itemProp="addressCountry" content="RU" />
                  </ContactItem>
                </motion.div>
              )}

              {c.work_hours && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <ContactItem icon={Clock} label="Режим работы">
                    {c.work_hours}
                  </ContactItem>
                </motion.div>
              )}

              {/* Мессенджеры */}
              {(c.whatsapp || c.telegram || c.max) && (
                <div className="pt-2">
                  <h3 className="font-display text-base font-bold text-foreground mb-3">Мессенджеры</h3>
                  <div className="flex flex-wrap gap-3">
                    {c.whatsapp && (
                      <a
                        href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 rounded-xl px-4 py-3 font-semibold text-sm text-white bg-[#25D366] hover:brightness-110 transition-all"
                      >
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </a>
                    )}
                    {c.telegram && (
                      <a
                        href={`https://t.me/${c.telegram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 rounded-xl px-4 py-3 font-semibold text-sm text-white bg-[#229ED9] hover:brightness-110 transition-all"
                      >
                        <Send className="h-4 w-4" /> Telegram
                      </a>
                    )}
                    {c.max && (
                      <a
                        href={c.max}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 rounded-xl px-4 py-3 font-semibold text-sm text-white bg-[#0077FF] hover:brightness-110 transition-all"
                      >
                        <MessagesSquare className="h-4 w-4" /> Max
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Форма */}
            <motion.div
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl border border-border p-8 shadow-[var(--shadow-elevated)] card-accent-top">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse-ring" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Бесплатный выезд</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Оставьте заявку</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Перезвоним в течение 15 минут в рабочее время.
                </p>
                <CallbackForm source="contacts" />
              </div>

              {/* Карта (заглушка для iframe) */}
              {c.map_embed && (
                <div className="mt-5 rounded-2xl overflow-hidden border border-border h-64">
                  <iframe
                    src={c.map_embed}
                    width="100%"
                    height="100%"
                    loading="lazy"
                    title="Расположение на карте"
                    className="border-0"
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
