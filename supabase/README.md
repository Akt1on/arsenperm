# Supabase Migrations — Пермь Асфальт 59

## Порядок применения (обязательно по порядку)

```bash
# Через Supabase CLI:
supabase db push

# Или вручную в Supabase Dashboard → SQL Editor:
```

### 1. `00000000000001_ultimate_schema.sql`
Базовая схема: все таблицы, RLS политики, storage bucket.
**Применять первой на чистой базе.**

### 2. `20260526000001_fix_schema_final.sql`
Финальная миграция конфликтов:
- Нормализует `site_settings` из старого формата `{id/data}` в `{key/value}`
- Добавляет недостающие колонки в `services` (`short_description`, `sort_order`, `price_unit`)
- Конвертирует `price_from` из TEXT в NUMERIC
- Добавляет `author_company` в `reviews`
- Переопределяет RLS с использованием `is_admin()` (не `has_role()`)
- Исправляет все конфликтующие политики
- Seed начальных данных `site_settings`

### 3. `20260527000001_create_missing_tables.sql`
Создаёт таблицы `price_items` и `gallery_items` (отдельные от `pricing_items`):
- `price_items` — глобальный прайс-лист (страница /цены)
- `gallery_items` — галерея объектов (страница /obekty)
- Seed начальных данных для обеих таблиц

## Схема таблиц

| Таблица | Назначение |
|---|---|
| `services` | Услуги компании |
| `pricing_items` | Детальный прайс по каждой услуге |
| `price_items` | Глобальный прайс-лист (страница /цены) |
| `projects` | Проекты портфолио |
| `project_photos` | Фотографии к проектам |
| `gallery_items` | Галерея объектов |
| `reviews` | Отзывы клиентов |
| `posts` | Блог-статьи |
| `leads` | CRM — входящие заявки |
| `site_settings` | Настройки сайта (key/value) |
| `user_roles` | Роли пользователей (admin/user) |

## Переменные окружения

```env
# .env (не коммитить!)
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhb...
TELEGRAM_BOT_TOKEN=123456:ABC...   # опционально
TELEGRAM_CHAT_ID=-1001234567890    # опционально
```

## Создание администратора

1. Открыть `/auth` на сайте
2. Зарегистрироваться с email `permsite1@gmail.com`
3. Подтвердить email → войти → откроется `/admin`

**Изменить email администратора** — в Supabase SQL Editor:
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'ВАШ@EMAIL.RU')
  )
$$;
```
