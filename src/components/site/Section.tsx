import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  dark = false,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <motion.section
      id={id}
      className={`py-20 md:py-28 ${dark ? "bg-[oklch(0.20_0.008_60)]" : "bg-background"} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container-x">
        {(eyebrow || title || subtitle) && (
          <div className="max-w-3xl mb-12">
            {eyebrow && (
              <div className="chip chip-primary mb-4">{eyebrow}</div>
            )}
            {title && (
              <h2
                className={`font-display text-4xl md:text-5xl font-bold leading-tight ${
                  dark ? "text-white" : "text-foreground"
                }`}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={`mt-4 text-lg leading-relaxed ${
                  dark ? "text-white/60" : "text-muted-foreground"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </motion.section>
  );
}
