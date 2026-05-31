import { createFileRoute } from "@tanstack/react-router";

const TITLE = "Политика конфиденциальности — Пермь Асфальт 59";
const DESCRIPTION = "Политика конфиденциальности компании Пермь Асфальт 59. Защита персональных данных, контакты, права пользователя и условия работы сайта.";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://permasfalt59.ru/privacy-policy" },
      { property: "og:site_name", content: "Пермь Асфальт 59" },
      { property: "og:image", content: "https://permasfalt59.ru/og-image.png" },
      { name: "robots", content: "noindex, follow" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://permasfalt59.ru/privacy-policy" }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <main className="container-x py-20">
      <div className="bg-white rounded-3xl border border-border shadow-[var(--shadow-card)] border border-border p-10 shadow-2xl">
        <h1 className="font-display text-4xl font-bold mb-6">Политика конфиденциальности</h1>
        <p className="text-muted-foreground mb-6">
          Мы собираем и обрабатываем персональные данные только в пределах, необходимых для обработки заявок и связи с клиентами. Все данные используются в соответствии с российским законодательством.
        </p>
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold mb-3">1. Оператор сайта</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Сайт permasfalt59.ru принадлежит Пермь Асфальт 59. Контакты доступны на странице <a href="/contacts" className="text-primary hover:underline">Контакты</a>.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">2. Какие данные мы собираем</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>имя и телефон из формы заявки;</li>
              <li>сообщение, если вы его оставили;</li>
              <li>технические данные об устройстве и браузере для корректной работы сайта.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">3. Цели обработки</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Персональные данные используются для обработки запросов, обратной связи, расчёта стоимости услуг и улучшения качества обслуживания.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">4. Передача данных</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Данные не передаются третьим лицам за исключением случаев, когда это необходимо для выполнения заявки или требуется по закону.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">5. Срок хранения</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Данные хранятся до тех пор, пока это необходимо для обработки запроса или пока вы не отзовёте своё согласие, если такое согласие было предоставлено.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">6. Права пользователя</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Вы имеете право запрашивать изменение, удаление или блокировку своих персональных данных. Для этого используйте раздел <a href="/contacts" className="text-primary hover:underline">Контакты</a>.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">7. Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Сайт использует cookies для работы форм и запоминания пользовательских настроек. Подробнее в <a href="/cookie-policy" className="text-primary hover:underline">Политике cookie</a>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
