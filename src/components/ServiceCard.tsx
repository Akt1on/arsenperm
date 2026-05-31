import { Link } from "@tanstack/react-router";
import type { Service } from "@/data/services";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { getServiceIcon } from "@/lib/content";

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const Icon = getServiceIcon(service.icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07 }}
    >
      <Link
        to="/uslugi/$slug"
        params={{ slug: service.slug }}
        className="group relative block h-full rounded-2xl asphalt-bg gold-border p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:gold-glow"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-radial-gold pointer-events-none" />
        <div className="relative flex flex-col h-full">
          <div className="flex items-start justify-between mb-6">
            <div className="h-12 w-12 grid place-items-center rounded-xl bg-surface-2 group-hover:bg-gradient-gold transition-colors">
              <Icon className="h-6 w-6 text-[var(--gold)] group-hover:text-background transition-colors" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-[var(--gold)] group-hover:rotate-12 transition-all" />
          </div>
          <h3 className="font-display text-2xl tracking-wide text-foreground mb-2">
            {service.title}
          </h3>
          <p className="text-sm text-muted-foreground flex-1">{service.short}</p>
          <div className="mt-6 pt-4 border-t border-border/60 text-[var(--gold)] font-heading font-bold text-lg">
            {service.priceFrom}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
