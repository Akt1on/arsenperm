import { SITE } from "@/data/site";

/**
 * Render JSON-LD schema(s) inline. Use one per page.
 */
export function SchemaJsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE.name,
  url: SITE.url,
  telephone: SITE.phoneRaw,
  image: `${SITE.url}/og-image.jpg`,
  priceRange: "от 300 ₽/м²",
  description: "Профессиональное асфальтирование в Перми с 2010 года",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Шоссе Космонавтов, 328Л",
    addressLocality: "Пермь",
    addressRegion: "Пермский край",
    postalCode: "614990",
    addressCountry: "RU",
  },
  geo: { "@type": "GeoCoordinates", latitude: 58.0296, longitude: 56.2589 },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  areaServed: ["Пермь", "Пермский край"],
  serviceType: ["Асфальтирование", "Тротуарная плитка", "Земляные работы", "Демонтаж"],
};
