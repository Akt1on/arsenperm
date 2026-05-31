import { useEffect, useRef, useState } from "react";
import { useInView, motion, useMotionValue, animate } from "framer-motion";

export function Counter({
  to,
  suffix = "",
  duration = 1.6,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, { duration, ease: "easeOut" });
    const u = mv.on("change", (v) => setVal(Math.round(v)));
    return () => {
      c.stop();
      u();
    };
  }, [inView, to, duration, mv]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

export function FadeInUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <FadeInUp className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 mb-4 text-xs uppercase tracking-[0.3em] text-[var(--gold)]">
          <span className="h-px w-8 bg-[var(--gold)]" />
          {eyebrow}
        </div>
      )}
      <h2
        className="font-display tracking-wide text-foreground leading-[1] break-words"
        style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base md:text-lg text-muted-foreground ${
            align === "center" ? "max-w-2xl mx-auto" : "max-w-2xl"
          }`}
        >
          {description}
        </p>
      )}
    </FadeInUp>
  );
}
