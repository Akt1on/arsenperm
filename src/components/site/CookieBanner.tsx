import { useEffect, useState } from "react";

const CONSENT_COOKIE_NAME = "permasfalt_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getConsent() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((item) => item.startsWith(`${CONSENT_COOKIE_NAME}=1`));
}

function setConsent() {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE_NAME}=1; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function CookieBanner() {
  const [consent, setConsentState] = useState<boolean | null>(null);

  useEffect(() => {
    setConsentState(getConsent());
  }, []);

  if (consent) return null;
  if (consent === null) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-3xl border border-border bg-surface/95 p-5 shadow-2xl backdrop-blur-xl md:inset-x-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-sm text-foreground">
          <p className="font-semibold">Мы используем cookies</p>
          <p className="text-muted-foreground">
            Этот сайт сохраняет только необходимые cookies для работы и удобства. Подробнее в <a href="/cookie-policy" className="text-primary hover:underline">Политике cookie</a> и <a href="/privacy-policy" className="text-primary hover:underline">Политике конфиденциальности</a>.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => { setConsent(); setConsentState(true); }}
            className="btn-gold rounded-full px-5 py-3 font-semibold"
          >
            Принять cookies
          </button>
          <a href="/cookie-policy" className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground hover:border-primary/70 hover:text-primary transition">
            Подробнее
          </a>
        </div>
      </div>
    </div>
  );
}
