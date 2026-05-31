import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, ChevronDown, HardHat } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchServices, fetchSettings } from "@/lib/site-data";

const nav = [
  { to: "/", label: "Главная" },
  { to: "/services", label: "Услуги" },
  { to: "/goroda", label: "Города" },
  { to: "/tseny", label: "Цены" },
  { to: "/portfolio", label: "Портфолио" },
  { to: "/blog", label: "Блог" },
  { to: "/about", label: "О нас" },
  { to: "/contacts", label: "Контакты" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 5 * 60 * 1000 });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices, staleTime: 1000 * 60 * 5 });
  const phone = settings?.contacts?.phone ?? "+7 (342) 277-77-10";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); setServicesOpen(false); }, [path]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_-4px_oklch(0_0_0/0.12)] py-0"
          : "bg-transparent py-1"
      }`}
    >
      {/* Жёлтая полоса сверху — фирменный элемент */}
      <div className="h-1 w-full" style={{ background: "var(--gradient-primary)" }} />

      <div className="container-x">
        <div className="flex items-center justify-between h-16">

          {/* ЛОГОТИП */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div
              className="h-10 w-10 rounded-lg grid place-items-center text-black font-bold text-sm btn-gold shrink-0"
              aria-hidden="true"
            >
              <HardHat className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="leading-none">
              <div
                className={`font-display text-xl font-bold tracking-wide transition-colors ${
                  scrolled ? "text-foreground" : "text-white"
                }`}
              >
                ПЕРМЬ АСФАЛЬТ{" "}
                <span className="text-gradient-gold">59</span>
              </div>
              <div
                className={`text-[10px] tracking-[0.25em] uppercase font-semibold transition-colors ${
                  scrolled ? "text-muted-foreground" : "text-white/60"
                }`}
              >
                Асфальтирование и благоустройство
              </div>
            </div>
          </Link>

          {/* НАВИГАЦИЯ desktop */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {nav.map((n) => {
              const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));

              if (n.to === "/services") {
                return (
                  <div
                    key={n.to}
                    className="relative"
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}
                  >
                    <Link
                      to={n.to}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        active
                          ? "text-primary"
                          : scrolled
                          ? "text-foreground/80 hover:text-foreground hover:bg-surface"
                          : "text-white/85 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {n.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                    </Link>

                    <AnimatePresence>
                      {servicesOpen && services.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.16 }}
                          className="absolute left-0 top-full mt-2 w-[30rem] rounded-2xl bg-white shadow-[0_16px_48px_-8px_oklch(0_0_0/0.18)] border border-border p-5"
                        >
                          <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3 font-bold">
                            Услуги компании
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {services.slice(0, 8).map((service) => (
                              <Link
                                key={service.id}
                                to="/services/$slug"
                                params={{ slug: service.slug }}
                                className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground transition-all"
                              >
                                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                {service.title}
                              </Link>
                            ))}
                          </div>
                          <div className="mt-4 pt-3 border-t border-border">
                            <Link to="/services" className="text-xs font-semibold text-primary hover:underline">
                              Все услуги →
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`relative px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    active
                      ? "text-primary"
                      : scrolled
                      ? "text-foreground/80 hover:text-foreground hover:bg-surface"
                      : "text-white/85 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {n.label}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ТЕЛЕФОН + CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                scrolled ? "text-foreground hover:text-primary" : "text-white hover:text-primary"
              }`}
            >
              <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
              {phone}
            </a>
            <a
              href="#callback"
              className="btn-gold rounded-lg px-4 py-2.5 text-sm uppercase tracking-wide"
            >
              Заявка
            </a>
          </div>

          {/* БУРГЕР mobile */}
          <button
            onClick={() => setOpen((v) => !v)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled ? "hover:bg-surface text-foreground" : "text-white hover:bg-white/10"
            }`}
            aria-label="Меню"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* МОБИЛЬНОЕ МЕНЮ */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden overflow-hidden bg-white border-t border-border shadow-xl"
          >
            <nav className="flex flex-col py-3">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="px-6 py-3.5 text-base font-semibold text-foreground hover:bg-surface hover:text-primary transition-colors border-b border-border/40 last:border-0"
                >
                  {n.label}
                </Link>
              ))}
              <div className="px-5 py-4 bg-surface">
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="btn-gold flex items-center justify-center gap-2 rounded-lg py-3.5 text-base w-full"
                >
                  <Phone className="h-5 w-5" aria-hidden="true" /> {phone}
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
