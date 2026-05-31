import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Phone } from "lucide-react";
import { fetchService, fetchPricing, fetchServices, fetchSettings } from "@/lib/site-data";
import { getServiceImageUrl } from "@/lib/service-images";
import { CallbackForm } from "@/components/site/CallbackForm";
import { DynIcon } from "@/components/site/icon";

const BASE = "https://permasfalt59.ru";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params }) => {
    const service = await fetchService(params.slug);
    return { service };
  },
  head: ({ loaderData, params }) => {
    const s = loaderData?.service;
    const title = s
      ? `${s.title} в Перми${s.price_from != null ? ` — от ${Number(s.price_from).toLocaleString("ru-RU")} ₽/${s.price_unit}` : ""} | Пермь Асфальт 59`
      : "Услуга — Пермь Асфальт 59";
    const description = s
      ? `${s.short_description ?? ""}${s.price_from != null ? ` Цена от ${Number(s.price_from).toLocaleString("ru-RU")} ₽/${s.price_unit}.` : ""} Бесплатный выезд, договор и гарантия 3 года. Пермь и Пермский край.`
      : "Профессиональные услуги по благоустройству в Перми и Пермском крае. Гарантия 3 года, бесплатный выезд.";
    const url = `${BASE}/services/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 160) },
        { name: "keywords", content: s ? `${s.title} Пермь, ${s.title} цена, ${s.title} Пермский край, заказать ${s.title} Пермь` : "" },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 160) },
        { property: "og:site_name", content: "Пермь Асфальт 59" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        ...(s?.image_url ? [
          { property: "og:image", content: s.image_url },
          { property: "og:image:alt", content: `${s.title} в Перми — Пермь Асфальт 59` },
        ] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description.slice(0, 160) },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: s ? [
        // Service schema
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": url + "/#service",
            name: s.title,
            description: s.short_description ?? s.description,
            url,
            image: s.image_url,
            provider: {
              "@type": "LocalBusiness",
              "@id": BASE + "/#business",
              name: "Пермь Асфальт 59",
              telephone: "+73422777710",
              areaServed: "Пермь и Пермский край",
            },
            areaServed: [
              { "@type": "City", name: "Пермь" },
              { "@type": "AdministrativeArea", name: "Пермский край" },
            ],
            offers: {
              "@type": "Offer",
              price: s.price_from,
              priceCurrency: "RUB",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: s.price_from,
                priceCurrency: "RUB",
                unitText: s.price_unit,
              },
              availability: "https://schema.org/InStock",
              validFrom: new Date().toISOString().slice(0, 10),
              seller: { "@type": "Organization", name: "Пермь Асфальт 59" },
            },
          }),
        },
        // BreadcrumbList
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: BASE + "/" },
              { "@type": "ListItem", position: 2, name: "Услуги", item: BASE + "/services" },
              { "@type": "ListItem", position: 3, name: s.title, item: url },
            ],
          }),
        },
      ] : [],
    };
  },
  component: ServicePage,
});

function ServicePage() {
  const { slug } = useParams({ from: "/services/$slug" });
  const { data: service, isLoading } = useQuery({ queryKey: ["service", slug], queryFn: () => fetchService(slug) });
  const { data: pricing = [] } = useQuery({
    queryKey: ["pricing", service?.id], queryFn: () => fetchPricing(service!.id), enabled: !!service?.id,
  });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices, staleTime: 1000 * 60 * 5 });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const phone = settings?.contacts?.phone ?? "+7 (342) 277-77-10";
  const anchors = [
    { id: "overview", label: "Описание" },
    { id: "included", label: "Что включено" },
    { id: "pricing", label: "Прайс" },
    { id: "order", label: "Заказать" },
    { id: "related", label: "Похожие услуги" },
  ];
  const relatedServices = services.filter((item) => item.slug !== slug).slice(0, 3);

  if (isLoading) return <div className="container-x py-32 text-center text-muted-foreground">Загрузка…</div>;
  if (!service) return <div className="container-x py-32 text-center">Услуга не найдена. <Link to="/services" className="text-primary">К списку услуг</Link></div>;

  return (
    <>
      <nav aria-label="Хлебные крошки" className="container-x pt-28 pb-0">
        <ol className="flex items-center gap-2 text-xs text-muted-foreground" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/" itemProp="item" className="hover:text-primary transition"><span itemProp="name">Главная</span></Link>
            <meta itemProp="position" content="1" />
          </li>
          <span>/</span>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/services" itemProp="item" className="hover:text-primary transition"><span itemProp="name">Услуги</span></Link>
            <meta itemProp="position" content="2" />
          </li>
          <span>/</span>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <span itemProp="name" className="text-foreground">{service.title}</span>
            <meta itemProp="position" content="3" />
          </li>
        </ol>
      </nav>

      <section className="relative overflow-hidden pt-8 pb-20">
        <div className="absolute inset-0">
          <img
            src={service.image_url || getServiceImageUrl(service)}
            alt={`${service.title} в Перми — Пермь Асфальт 59`}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container-x relative z-10 pt-16 pb-10">
          <Link to="/services" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-primary mb-8 font-semibold">
            <ArrowLeft className="h-4 w-4" /> Все услуги
          </Link>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-5">
            <div className="h-14 w-14 rounded-xl btn-gold grid place-items-center shrink-0">
              <DynIcon name={service.icon} className="h-7 w-7" />
            </div>
            <div>
              <h1 {service.title} в Перми</h1>>{service.title} в Перми</h1>
              <p className="mt-4 text-lg text-white/75 max-w-2xl">{service.short_description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container-x">
          <div className="bg-white rounded-2xl border border-border p-4 flex flex-wrap gap-2.5 overflow-x-auto scrollbar-none shadow-[var(--shadow-card)]">
            {anchors.map((anchor) => (
              <a key={anchor.id} href={`#${anchor.id}`} className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition">
                {anchor.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div id="overview" className="bg-white rounded-2xl border border-border p-8 shadow-[var(--shadow-card)] card-accent-top">
              <h2 className="font-display text-2xl font-bold mb-4">Описание</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{service.description}</p>
            </div>

            <div id="included" className="bg-white rounded-2xl border border-border p-8 shadow-[var(--shadow-card)] card-accent-top">
              <h2 className="font-display text-2xl font-bold mb-6">Что включено</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {["Бесплатный выезд и замер","Подготовка проекта и сметы","Закупка материалов","Подготовка основания","Производство работ","Уборка и сдача объекта"].map((t) => (
                  <div key={t} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/15 grid place-items-center shrink-0 mt-0.5"><Check className="h-3.5 w-3.5 text-primary" /></div>
                    <span className="text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {pricing.length > 0 && (
              <div id="pricing" className="bg-white rounded-2xl border border-border p-8 shadow-[var(--shadow-card)] card-accent-top">
                <h2 className="font-display text-2xl font-bold mb-6">Прайс-лист</h2>
                <div className="divide-y divide-border">
                  {pricing.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between py-4">
                      <div className="font-medium">{p.name}</div>
                      <div className="font-display text-lg text-primary">{Number(p.price).toLocaleString("ru-RU")} ₽<span className="text-xs text-muted-foreground"> / {p.unit}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div id="related" className="bg-white rounded-2xl border border-border p-8 shadow-[var(--shadow-card)] card-accent-top">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">Похожие услуги</h2>
                  <p className="text-sm text-muted-foreground mt-1">Другие направления работ, которые часто заказывают вместе.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedServices.map((related) => (
                  <Link key={related.id} to="/services/$slug" params={{ slug: related.slug }} className="rounded-2xl border border-border bg-surface p-5 hover:border-primary/50 hover:bg-primary/5 hover:shadow-[var(--shadow-card)] transition-all">
                    <div className="font-semibold">{related.title}</div>
                    <div className="text-xs text-muted-foreground mt-2 line-clamp-3">{related.short_description}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside id="order" className="space-y-5">
            <div className="bg-white rounded-2xl border border-border p-7 shadow-[var(--shadow-card)] card-accent-top sticky top-28">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Цена</div>
              <div className="mt-2 font-display text-4xl font-bold text-gradient-gold">от {service.price_from != null ? Number(service.price_from).toLocaleString("ru-RU") : "—"} ₽</div>
              <div className="text-sm text-muted-foreground">за {service.price_unit}</div>
              <div className="mt-6 mb-6 h-px bg-border" />
              <h3 className="font-display text-lg font-bold mb-4">Заказать услугу</h3>
              <CallbackForm source={`service:${service.slug}`} compact />
              <a href={`tel:${phone.replace(/[^+\d]/g,'')}`} className="mt-3 flex items-center justify-center gap-2 text-sm text-primary hover:underline">
                <Phone className="h-4 w-4" /> {phone}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
