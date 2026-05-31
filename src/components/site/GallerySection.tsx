import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { X, Images } from "lucide-react";
import { fetchGalleryItems, type GalleryItem } from "@/lib/content";

const ALL_FILTERS = [
  { id: "all",        label: "Все работы" },
  { id: "roads",      label: "Дороги" },
  { id: "parking",    label: "Парковки" },
  { id: "snt",        label: "СНТ / дачи" },
  { id: "warehouses", label: "Склады" },
  { id: "tiles",      label: "Тротуарная плитка" },
  { id: "industrial", label: "Промышленные" },
  { id: "yards",      label: "Дворы" },
  { id: "other",      label: "Прочее" },
];

export function GallerySection({ withFilters = false }: { withFilters?: boolean }) {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["content", "gallery"],
    queryFn: fetchGalleryItems,
  });

  // Only show filters that have content
  const presentCategories = new Set(items.map((i) => i.category));
  const activeFilters = ALL_FILTERS.filter(
    (f) => f.id === "all" || presentCategories.has(f.id)
  );

  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <section className="section-y">
      <div className="container-x">
        {withFilters && activeFilters.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {activeFilters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all border ${
                  filter === f.id
                    ? "btn-gold border-transparent shadow-[var(--shadow-gold)]"
                    : "bg-surface border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-surface-2 animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center text-muted-foreground">
            <Images className="h-12 w-12 mb-3 opacity-20" />
            <p className="font-semibold">Фотографий пока нет</p>
            <p className="text-sm mt-1">Добавьте изображения в admin-панели → Галерея</p>
          </div>
        ) : (
          <LazyMotion features={domAnimation}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {visible.map((item, i) => (
                <m.button
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: (i % 8) * 0.04 }}
                  onClick={() => setLightbox(item)}
                  aria-label={`Открыть фото: ${item.title || item.category_label}`}
                  className={`group relative overflow-hidden rounded-xl border border-white/10 ${
                    i % 7 === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" : "aspect-[4/3]"
                  }`}
                >
                  <img
                    src={item.src}
                    alt={item.title || item.category_label}
                    loading="lazy"
                    width={600}
                    height={450}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-left">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                      {item.category_label} · {item.year}
                    </div>
                    {item.title && (
                      <div className="mt-0.5 font-semibold text-xs text-white line-clamp-2 leading-tight">
                        {item.title}
                      </div>
                    )}
                  </div>
                </m.button>
              ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
              {lightbox && (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setLightbox(null)}
                  className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm grid place-items-center p-4"
                >
                  <button
                    aria-label="Закрыть"
                    onClick={() => setLightbox(null)}
                    className="absolute top-5 right-5 h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <m.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col items-center gap-3 max-w-5xl w-full"
                  >
                    <img
                      src={lightbox.src}
                      alt={lightbox.title || ""}
                      className="max-h-[80vh] max-w-full rounded-xl shadow-2xl"
                    />
                    {(lightbox.title || lightbox.category_label) && (
                      <div className="text-center">
                        {lightbox.title && (
                          <p className="text-white font-semibold text-sm">{lightbox.title}</p>
                        )}
                        <p className="text-primary text-xs font-bold uppercase tracking-wider mt-0.5">
                          {lightbox.category_label} · {lightbox.year}
                        </p>
                      </div>
                    )}
                  </m.div>
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>
        )}
      </div>
    </section>
  );
}
