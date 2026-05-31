import { Gift } from "lucide-react";

// Промо-баннер без фиктивного таймера — честный маркетинг лучше для SEO и доверия
export function PromoTimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-sm text-[var(--gold)]">
        <Gift className="h-3.5 w-3.5" />
        Бесплатный выезд и замер
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2 backdrop-blur">
      <Gift className="h-4 w-4 text-[var(--gold)]" />
      <span className="text-sm font-semibold text-[var(--gold)]">
        Бесплатный выезд замерщика на объект
      </span>
    </div>
  );
}
