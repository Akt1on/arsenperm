import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Allow short alias "admin" → admin@permasfalt59.ru
    const resolvedEmail = email.trim().toLowerCase() === "admin"
      ? "permsite1@gmail.com"
      : email.trim();
    const fn = mode === "login"
      ? supabase.auth.signInWithPassword({ email: resolvedEmail, password })
      : supabase.auth.signUp({ email: resolvedEmail, password });
    const { error } = await fn;
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(mode === "login" ? "Вход выполнен" : "Аккаунт создан. Назначьте роль admin в БД для доступа к админке.");
    nav({ to: "/admin" });
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4">
      <div className="bg-white rounded-2xl border border-border shadow-[var(--shadow-elevated)] p-8 w-full max-w-md card-accent-top">
        <h1 className="font-display text-3xl font-bold mb-1">{mode === "login" ? "Вход" : "Регистрация"}</h1>
        <p className="text-sm text-muted-foreground mb-6">Доступ к админ-панели</p>
        <form onSubmit={submit} className="grid gap-3">
          <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Логин или e-mail"
            className="bg-input border border-border rounded-lg px-4 py-3 focus:border-primary focus:outline-none" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль"
            className="bg-input border border-border rounded-lg px-4 py-3 focus:border-primary focus:outline-none" />
          <button disabled={loading} className="btn-gold rounded-lg px-6 py-3 font-semibold disabled:opacity-60">
            {loading ? "..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-4 text-sm text-muted-foreground hover:text-primary w-full text-center">
          {mode === "login" ? "Создать аккаунт" : "У меня уже есть аккаунт"}
        </button>
      </div>
    </div>
  );
}
