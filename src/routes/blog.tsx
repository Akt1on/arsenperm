import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Section } from "@/components/site/Section";
import { fetchPosts } from "@/lib/site-data";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Блог об асфальтировании и благоустройстве в Перми — статьи и советы | Пермь Асфальт 59" },
      { name: "description", content: "Экспертные статьи об асфальтировании, укладке тротуарной плитки, земляных работах и выборе подрядчика в Перми. Советы от практиков с 15-летним опытом." },
      { name: "keywords", content: "блог асфальтирование Пермь, статьи укладка асфальта, советы благоустройство, как выбрать подрядчика асфальт Пермь, технология асфальтирования, стоимость асфальта Пермь" },
      { property: "og:title", content: "Блог об асфальтировании в Перми | Пермь Асфальт 59" },
      { property: "og:description", content: "Экспертные статьи об асфальтировании и благоустройстве от практиков с 15-летним опытом работы в Перми." },
      { property: "og:url", content: "https://permasfalt59.ru/blog" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://permasfalt59.ru/og-image.png" },
    ],
    links: [
      { rel: "canonical", href: "https://permasfalt59.ru/blog" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": "https://permasfalt59.ru/blog/#blog",
        name: "Блог Пермь Асфальт 59",
        description: "Статьи об асфальтировании и благоустройстве в Перми",
        url: "https://permasfalt59.ru/blog",
        publisher: {
          "@type": "Organization",
          name: "Пермь Асфальт 59",
          url: "https://permasfalt59.ru",
        },
      }),
    }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts });

  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[oklch(0.20_0.008_60)]">
        <div className="h-1" style={{ background: "var(--gradient-primary)" }} />
        <div className="container-x pt-12">
          <div className="chip chip-primary mb-4">Журнал</div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none">
            ПОЛЕЗНОЕ О<br />
            <span className="text-gradient-gold">БЛАГОУСТРОЙСТВЕ</span>
          </h1>
          <p className="mt-5 text-white/60 max-w-xl leading-relaxed">
            Разбираем технологии, цены, типичные ошибки заказчиков и делимся опытом с реальных объектов.
          </p>
        </div>
      </section>

        <Section
          eyebrow="Статьи"
          title="Все публикации"
        >
          {isLoading ? (
            <div className="text-center text-muted-foreground py-20">Загрузка…</div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border shadow-[var(--shadow-card)] p-12 text-center text-muted-foreground">Скоро здесь появятся первые статьи.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Link to="/blog/$slug" params={{ slug: p.slug }}
                    className="group block bg-white rounded-2xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-300 h-full card-accent-top">
                    {p.cover_image && (
                      <div className="aspect-video overflow-hidden">
                        <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest mb-3">
                        {p.published_at && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(p.published_at).toLocaleDateString("ru-RU")}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.read_minutes} мин</span>
                      </div>
                      <h2 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition">{p.title}</h2>
                      {p.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                      <div className="mt-5 inline-flex items-center gap-1 text-sm text-primary font-semibold">
                        Читать <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </Section>
      </main>
  );
}
