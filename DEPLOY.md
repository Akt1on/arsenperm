# Деплой — Пермь Асфальт 59

## Быстрый старт на Vercel

### 1. Переменные окружения (добавить до деплоя)

Vercel Dashboard → Settings → Environment Variables:

| Переменная | Где взять | Обязательно |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API → anon public | ✅ |
| `SUPABASE_URL` | то же, для серверных API | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role | ✅ |
| `ALLOWED_ORIGIN` | https://permasfalt59.ru | ✅ |
| `TELEGRAM_BOT_TOKEN` | @BotFather в Telegram | ☐ |
| `TELEGRAM_CHAT_ID` | ID чата/группы для заявок | ☐ |

### 2. База данных

```bash
# Применить миграции через Supabase CLI
supabase db push

# Или вручную в Supabase SQL Editor — в порядке:
# 1. supabase/migrations/00000000000001_ultimate_schema.sql
# 2. supabase/migrations/20260526000001_fix_schema_final.sql
# 3. supabase/migrations/20260527000001_create_missing_tables.sql
```

### 3. Деплой

```bash
# Vercel CLI
vercel --prod

# Настройки сборки:
# Build Command:    bun run build
# Output Directory: dist/client
# Install Command:  bun install --ignore-scripts
```

### 4. После деплоя — чеклист

- [ ] `https://permasfalt59.ru/sitemap.xml` открывается, нет `noindex`
- [ ] `https://permasfalt59.ru/robots.txt` отдаётся корректно
- [ ] Форма обратной связи отправляет заявку (проверить в `/admin/leads`)
- [ ] Telegram-уведомление приходит при тестовой заявке
- [ ] `/admin` открывается, вход работает
- [ ] Загрузка изображений в admin работает (bucket `site-images`)

---

## Настройка Supabase RLS (если что-то не работает)

```sql
-- Проверить что RLS включён на всех таблицах
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Если leads не принимают заявки с публичной формы:
CREATE POLICY "anyone can insert leads"
  ON public.leads FOR INSERT WITH CHECK (true);
```

## Telegram-бот (опционально)

1. Написать @BotFather → `/newbot` → получить токен
2. Добавить бота в группу/канал → получить chat_id
3. Добавить переменные в Vercel
4. Тест: отправить форму → должно прийти сообщение с именем, телефоном, услугой и временем МСК

---

## Итоговая карта маршрутов (чистая версия)

| URL | Файл | SEO |
|---|---|---|
| `/` | `routes/index.tsx` | ✅ Главная |
| `/services` | `routes/services.tsx` | ✅ Все услуги |
| `/services/:slug` | `routes/services.$slug.tsx` | ✅ Страница услуги |
| `/tseny` | `routes/tseny.tsx` | ✅ Прайс-лист |
| `/goroda` | `routes/goroda.tsx` | ✅ Города |
| `/goroda/:city` | `routes/goroda.$city.tsx` | ✅ Гео-страница |
| `/portfolio` | `routes/portfolio.tsx` | ✅ Портфолио |
| `/portfolio/:slug` | `routes/portfolio.$slug.tsx` | ✅ Проект |
| `/blog` | `routes/blog.tsx` | ✅ Блог |
| `/blog/:slug` | `routes/blog.$slug.tsx` | ✅ Статья |
| `/about` | `routes/about.tsx` | ✅ О компании |
| `/contacts` | `routes/contacts.tsx` | ✅ Контакты |
| `/privacy-policy` | `routes/privacy-policy.tsx` | noindex |
| `/cookie-policy` | `routes/cookie-policy.tsx` | noindex |
| `/sitemap.xml` | `routes/sitemap[.]xml.ts` | Динамический |
| `/admin` | `routes/admin.tsx` | noindex |
| `/auth` | `routes/auth.tsx` | noindex |

### 301 Редиректы (старые URL → новые)
- `/ceny` → `/tseny`
- `/o-nas` → `/about`
- `/kontakty` → `/contacts`
- `/otzyvy` → `/portfolio`
- `/obekty` → `/portfolio`
- `/uslugi` → `/services`
- `/uslugi/:slug` → `/services/:slug`
- `/politika-konfidencialnosti` → `/privacy-policy`
