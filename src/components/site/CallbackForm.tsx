import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { notifyLead } from "@/lib/notify-lead";
import { toast } from "sonner";
import { IMaskInput } from "react-imask";
import { Send, CheckCircle2 } from "lucide-react";

export function CallbackForm({
  source = "website",
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 11) {
      toast.error("Введите корректный номер телефона");
      return;
    }
    if (name.trim().length > 100) {
      toast.error("Имя слишком длинное");
      return;
    }
    if (message.trim().length > 2000) {
      toast.error("Сообщение слишком длинное");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({ name, phone, message, source });
    setLoading(false);
    if (error) { toast.error("Не удалось отправить. Попробуйте позже."); return; }
    notifyLead({ name: name || null, phone, message: message || null, source }).catch(() => {});
    toast.success("Заявка принята! Перезвоним в течение 15 минут.");
    setDone(true);
  };

  const inputCls =
    "w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all";

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="h-14 w-14 rounded-full btn-gold grid place-items-center">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-foreground">Заявка принята!</p>
          <p className="text-sm text-muted-foreground mt-1">Перезвоним в течение 15 минут</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3" aria-busy={loading} noValidate>
      {!compact && (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
          disabled={loading}
          className={inputCls}
          autoComplete="name"
        />
      )}

      <IMaskInput
        mask="+7 (000) 000-00-00"
        value={phone}
        onAccept={(v: string) => setPhone(v)}
        placeholder="+7 (___) ___-__-__"
        required
        disabled={loading}
        inputMode="tel"
        autoComplete="tel"
        className={inputCls}
      />

      {!compact && (
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Кратко опишите задачу (необязательно)"
          disabled={loading}
          className={`${inputCls} resize-none`}
        />
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-gold rounded-xl px-6 py-3.5 font-bold uppercase tracking-wide text-sm disabled:opacity-60 flex items-center justify-center gap-2 w-full"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Отправка…
          </span>
        ) : (
          <>
            <Send className="h-4 w-4" /> Заказать звонок
          </>
        )}
      </button>

      <p className="text-[11px] text-muted-foreground text-center">
        Нажимая кнопку, вы соглашаетесь на{" "}
        <a href="/privacy-policy" className="underline hover:text-primary">
          обработку персональных данных
        </a>
      </p>
    </form>
  );
}
