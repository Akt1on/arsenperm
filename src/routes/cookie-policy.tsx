import { createFileRoute } from "@tanstack/react-router";

const TITLE = "Политика использования Cookies — Пермь Асфальт 59";
const DESCRIPTION = "Политика cookie сайта permasfalt59.ru. Какие cookies мы используем и почему, как управлять согласием на использование cookies.";

export const Route = createFileRoute("/cookie-policy")({
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
  return (
    <main className="container-x py-20">
      <div className="bg-white rounded-3xl border border-border shadow-[var(--shadow-card)] border border-border p-10 shadow-2xl">
        <h1 className="font-display text-4xl font-bold mb-6">Политика использования Cookies</h1>
        <p className="text-muted-foreground mb-6">
          Этот сайт использует cookies для обеспечения функциональности, аналитики и улучшения пользовательского опыта. Мы не устанавливаем cookies для отслеживания или рекламы.
        </p>
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold mb-3">1. Что такое cookies?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cookies — это небольшие файлы, которые сохраняются на вашем устройстве и помогают сайту работать корректно. Они не содержат вирусы и не представляют угрозу безопасности.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">2. Какие cookies мы используем</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li><strong>Необходимые cookies:</strong> для работы форм, авторизации и сохранения состояния компонентов;</li>
              <li><strong>Функциональные cookies:</strong> для запоминания ваших настроек (например, открытость меню боковой панели);</li>
              <li><strong>Согласие:</strong> cookies, подтверждающие, что вы ознакомились с политикой cookies.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">3. Срок хранения</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Необходимые cookies хранятся на время сеанса. Функциональные cookies могут сохраняться до одного года для вашего удобства.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">4. Как отключить cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Вы можете отключить cookies в настройках браузера. Учтите, что отключение необходимых cookies может повлиять на функциональность сайта.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">5. Согласие</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Используя сайт, вы соглашаетесь на использование cookies, описанных в этой политике. Вы можете отозвать согласие через баннер в нижней части страницы.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
