import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/site-data";
import { toast } from "sonner";
import {
  Phone, Mail, MapPin, Clock, MessageCircle, Send, Globe,
  Building2, Hash, Info, ExternalLink, Save,
} from "lucide-react";
import { TitleBar, Field, Input, Textarea, SectionDivider } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

function SettingsSection({
  title, icon: Icon, description, onSave, saving, children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  onSave: () => void;
  saving?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-gold inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold shrink-0 disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
      <div className="p-6 grid gap-4">{children}</div>
    </div>
  );
}

function LinkPreview({ url }: { url: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"
    >
      <ExternalLink className="h-3 w-3" />
      Проверить ссылку
    </a>
  );
}

function AdminSettings() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  const [contacts, setContacts] = useState<any>({});
  const [hero, setHero] = useState<any>({});
  const [about, setAbout] = useState<any>({});
  const [legal, setLegal] = useState<any>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (settings) {
      setContacts(settings.contacts ?? {});
      setHero(settings.hero ?? {});
      setAbout(settings.about ?? {});
      setLegal(settings.legal ?? {});
    }
  }, [settings]);

  const save = async (key: string, value: any) => {
    setSaving((s) => ({ ...s, [key]: true }));
    const { error } = await supabase.from("site_settings").upsert({ key, value });
    setSaving((s) => ({ ...s, [key]: false }));
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено — изменения на сайте появятся через 1-2 минуты");
    qc.invalidateQueries({ queryKey: ["settings"] });
    qc.invalidateQueries({ queryKey: ["content", "site"] });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <TitleBar
        title="Настройки сайта"
        description="Управляйте контактами, мессенджерами и текстами. Каждый раздел сохраняется отдельно."
      />

      {/* Contacts */}
      <SettingsSection
        title="Контактные данные"
        icon={Phone}
        description="Телефоны, адрес, часы работы — отображаются в шапке и подвале"
        onSave={() => save("contacts", contacts)}
        saving={saving["contacts"]}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Основной телефон" hint="Формат: +7 (999) 999-99-99">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={contacts.phone ?? ""}
                onChange={(e) => setContacts({ ...contacts, phone: e.target.value })}
                className="bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 w-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="+7 (342) 000-00-00"
              />
            </div>
          </Field>
          <Field label="Дополнительный телефон" hint="Необязательно">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={contacts.phone2 ?? ""}
                onChange={(e) => setContacts({ ...contacts, phone2: e.target.value })}
                className="bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 w-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="+7 (342) 000-00-00"
              />
            </div>
          </Field>
        </div>

        <Field label="Email">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={contacts.email ?? ""}
              onChange={(e) => setContacts({ ...contacts, email: e.target.value })}
              className="bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 w-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="info@permasfalt59.ru"
            />
          </div>
        </Field>

        <Field label="Адрес">
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <textarea
              value={contacts.address ?? ""}
              onChange={(e) => setContacts({ ...contacts, address: e.target.value })}
              rows={2}
              className="bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 w-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
              placeholder="г. Пермь, ул. …"
            />
          </div>
        </Field>

        <Field label="Часы работы">
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={contacts.work_hours ?? ""}
              onChange={(e) => setContacts({ ...contacts, work_hours: e.target.value })}
              className="bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 w-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="Пн–Пт: 09:00–18:00, Сб: 10:00–16:00"
            />
          </div>
        </Field>
      </SettingsSection>

      {/* Messengers */}
      <SettingsSection
        title="Мессенджеры и соцсети"
        icon={MessageCircle}
        description="Кнопки и ссылки используются в плавающих кнопках и форме обратной связи"
        onSave={() => save("contacts", contacts)}
        saving={saving["contacts"]}
      >
        <Field label="WhatsApp" hint="Полная ссылка: https://wa.me/79001234567">
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={contacts.whatsapp ?? ""}
              onChange={(e) => setContacts({ ...contacts, whatsapp: e.target.value })}
              className="bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 w-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="https://wa.me/79001234567"
            />
          </div>
          <LinkPreview url={contacts.whatsapp ?? ""} />
        </Field>

        <Field label="Telegram" hint="Полная ссылка: https://t.me/username или https://t.me/+79001234567">
          <div className="relative">
            <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={contacts.telegram ?? ""}
              onChange={(e) => setContacts({ ...contacts, telegram: e.target.value })}
              className="bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 w-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="https://t.me/username"
            />
          </div>
          <LinkPreview url={contacts.telegram ?? ""} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="ВКонтакте">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={contacts.vk ?? ""}
                onChange={(e) => setContacts({ ...contacts, vk: e.target.value })}
                className="bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 w-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="https://vk.com/..."
              />
            </div>
            <LinkPreview url={contacts.vk ?? ""} />
          </Field>
          <Field label="MAX (другой мессенджер)">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={contacts.max ?? ""}
                onChange={(e) => setContacts({ ...contacts, max: e.target.value })}
                className="bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 w-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="https://..."
              />
            </div>
            <LinkPreview url={contacts.max ?? ""} />
          </Field>
        </div>
      </SettingsSection>

      {/* Hero */}
      <SettingsSection
        title="Главный экран"
        icon={Info}
        description="Заголовок и подзаголовок на главной странице"
        onSave={() => save("hero", hero)}
        saving={saving["hero"]}
      >
        <Field label="Бейдж (маленький текст над заголовком)">
          <Input value={hero.badge ?? ""} onChange={(v) => setHero({ ...hero, badge: v })} placeholder="Профессионально • Надёжно • В срок" />
        </Field>
        <Field label="Главный заголовок">
          <Input value={hero.title ?? ""} onChange={(v) => setHero({ ...hero, title: v })} placeholder="Асфальтирование в Перми" />
        </Field>
        <Field label="Подзаголовок">
          <Textarea value={hero.subtitle ?? ""} onChange={(v) => setHero({ ...hero, subtitle: v })} rows={3} placeholder="Профессиональная укладка асфальта…" />
        </Field>
      </SettingsSection>

      {/* About */}
      <SettingsSection
        title="О компании"
        icon={Building2}
        description="Текст в разделе «О нас» на главной странице"
        onSave={() => save("about", about)}
        saving={saving["about"]}
      >
        <Field label="Заголовок раздела">
          <Input value={about.title ?? ""} onChange={(v) => setAbout({ ...about, title: v })} placeholder="Почему выбирают нас" />
        </Field>
        <Field label="Основной текст">
          <Textarea value={about.text ?? ""} onChange={(v) => setAbout({ ...about, text: v })} rows={5} placeholder="Компания Пермь Асфальт 59…" />
        </Field>
      </SettingsSection>

      {/* Legal */}
      <SettingsSection
        title="Юридические реквизиты"
        icon={Hash}
        description="Используются в подвале сайта и договорах"
        onSave={() => save("legal", legal)}
        saving={saving["legal"]}
      >
        <Field label="Полное юридическое название">
          <Input value={legal.name ?? ""} onChange={(v) => setLegal({ ...legal, name: v })} placeholder='ООО "Пермь Асфальт 59"' />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="ОГРН">
            <Input value={legal.ogrn ?? ""} onChange={(v) => setLegal({ ...legal, ogrn: v })} placeholder="1234567890123" />
          </Field>
          <Field label="ИНН">
            <Input value={legal.inn ?? ""} onChange={(v) => setLegal({ ...legal, inn: v })} placeholder="1234567890" />
          </Field>
        </div>
      </SettingsSection>
    </div>
  );
}
