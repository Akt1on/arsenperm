import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { FadeInUp } from "@/components/ui-blocks";

export type Crumb = { label: string; to?: string };

export function PageHeader({
  breadcrumbs,
  eyebrow,
  title,
  description,
}: {
  breadcrumbs: Crumb[];
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-1/80 to-transparent pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[120%] bg-radial-gold opacity-40 blur-3xl pointer-events-none" />
      <div className="container-x relative">
        <FadeInUp>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-[var(--gold)] inline-flex items-center gap-1">
              <Home className="h-3 w-3" /> Главная
            </Link>
            {breadcrumbs.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" />
                {b.to ? (
                  <Link to={b.to} className="hover:text-[var(--gold)]">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-foreground/80">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-4 text-xs uppercase tracking-[0.3em] text-[var(--gold)]">
              <span className="h-px w-8 bg-[var(--gold)]" />
              {eyebrow}
            </div>
          )}
          <h1
            className="font-display tracking-wide leading-[0.95] max-w-4xl break-words"
            style={{ fontSize: "clamp(2.25rem, 7vw, 5.5rem)" }}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
              {description}
            </p>
          )}
        </FadeInUp>
      </div>
    </section>
  );
}
