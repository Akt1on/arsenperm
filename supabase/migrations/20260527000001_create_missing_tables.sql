-- ============================================================
-- МИГРАЦИЯ: создание недостающих таблиц
-- Исправляет несоответствие между кодом и базой данных
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Таблица price_items (код использует это название)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    TEXT NOT NULL DEFAULT 'general',
  category_title TEXT NOT NULL DEFAULT 'Общее',
  name           TEXT NOT NULL,
  price          TEXT NOT NULL DEFAULT '',
  position       INT  NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read price_items"   ON public.price_items;
DROP POLICY IF EXISTS "admins manage price_items" ON public.price_items;

CREATE POLICY "public read price_items"
  ON public.price_items FOR SELECT USING (true);

CREATE POLICY "admins manage price_items"
  ON public.price_items FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Заполняем из pricing_items если есть данные
INSERT INTO public.price_items (category_id, category_title, name, price, position)
SELECT
  COALESCE(p.service_id::text, 'general'),
  COALESCE(s.title, 'Общее'),
  p.name,
  p.price::text || ' ₽/' || COALESCE(p.unit, 'м²'),
  p.sort_order
FROM public.pricing_items p
LEFT JOIN public.services s ON s.id = p.service_id
ON CONFLICT DO NOTHING;

-- Seed если таблица пустая
INSERT INTO public.price_items (category_id, category_title, name, price, position)
SELECT category_id, category_title, name, price, position FROM (VALUES
  ('asfalt',    'Асфальтирование',    'Укладка асфальта (площадка)',        'от 500 ₽/м²',  1),
  ('asfalt',    'Асфальтирование',    'Укладка асфальта (дорога)',          'от 450 ₽/м²',  2),
  ('asfalt',    'Асфальтирование',    'Холодный асфальт (ямочный ремонт)',  'от 300 ₽/м²',  3),
  ('plitka',    'Тротуарная плитка',  'Укладка тротуарной плитки',         'от 700 ₽/м²',  1),
  ('plitka',    'Тротуарная плитка',  'Укладка брусчатки',                 'от 800 ₽/м²',  2),
  ('demontaj',  'Демонтаж',           'Демонтаж асфальта',                 'от 150 ₽/м²',  1),
  ('demontaj',  'Демонтаж',           'Демонтаж бетона',                   'от 200 ₽/м²',  2),
  ('spectech',  'Спецтехника',        'Аренда катка',                      'от 3 500 ₽/ч', 1),
  ('spectech',  'Спецтехника',        'Аренда экскаватора',                'от 4 000 ₽/ч', 2),
  ('spectech',  'Спецтехника',        'Аренда самосвала',                  'от 2 500 ₽/ч', 3),
  ('blagoustr', 'Благоустройство',    'Планировка территории',             'от 100 ₽/м²',  1),
  ('blagoustr', 'Благоустройство',    'Устройство дренажа',                'от 300 ₽/м²',  2)
) AS v(category_id, category_title, name, price, position)
WHERE NOT EXISTS (SELECT 1 FROM public.price_items LIMIT 1);

-- ----------------------------------------------------------------
-- 2. Таблица gallery_items (код использует это название)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src            TEXT NOT NULL DEFAULT '/placeholder.svg',
  title          TEXT NOT NULL DEFAULT '',
  category       TEXT NOT NULL DEFAULT 'asfalt',
  category_label TEXT NOT NULL DEFAULT 'Асфальтирование',
  year           INT  NOT NULL DEFAULT 2024,
  position       INT  NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read gallery_items"   ON public.gallery_items;
DROP POLICY IF EXISTS "admins manage gallery_items" ON public.gallery_items;

CREATE POLICY "public read gallery_items"
  ON public.gallery_items FOR SELECT USING (true);

CREATE POLICY "admins manage gallery_items"
  ON public.gallery_items FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed если таблица пустая
INSERT INTO public.gallery_items (src, title, category, category_label, year, position)
SELECT src, title, category, category_label, year, position FROM (VALUES
  ('/placeholder.svg', 'Асфальтирование парковки ТЦ Семья',     'asfalt',    'Асфальтирование',   2024, 1),
  ('/placeholder.svg', 'Укладка асфальта во дворе жилого дома', 'asfalt',    'Асфальтирование',   2024, 2),
  ('/placeholder.svg', 'Ремонт дороги в Краснокамске',          'asfalt',    'Асфальтирование',   2023, 3),
  ('/placeholder.svg', 'Тротуарная плитка у офисного центра',   'plitka',    'Тротуарная плитка', 2024, 4),
  ('/placeholder.svg', 'Благоустройство территории завода',     'blagoustr', 'Благоустройство',   2023, 5),
  ('/placeholder.svg', 'Демонтаж старого покрытия',             'demontaj',  'Демонтаж',          2024, 6)
) AS v(src, title, category, category_label, year, position)
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items LIMIT 1);

-- ----------------------------------------------------------------
-- 3. Исправляем RLS для services (убираем конфликтующие политики)
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "public reads active services" ON public.services;
DROP POLICY IF EXISTS "public read services"         ON public.services;
DROP POLICY IF EXISTS "anon_read_services"           ON public.services;
DROP POLICY IF EXISTS "admins manage services"       ON public.services;

CREATE POLICY "public read services"
  ON public.services FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admins manage services"
  ON public.services FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------
-- 4. Добавляем колонку id в site_settings если её нет
-- ----------------------------------------------------------------
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS id   TEXT,
  ADD COLUMN IF NOT EXISTS data JSONB;

-- Синхронизируем: id=key, data=value
UPDATE public.site_settings
SET id = key, data = value
WHERE id IS NULL AND key IS NOT NULL;

-- Вставляем строку main если её нет
INSERT INTO public.site_settings (key, value, id, data)
VALUES (
  'main',
  '{"name":"Пермь Асфальт 59","phone":"+7 (342) 277-77-10","phoneRaw":"73422777710","address":"г. Пермь","hours":"Пн–Пт 8:00–20:00","email":"info@permasfalt59.ru","whatsapp":"73422777710","telegram":"permasfalt59","vk":"permasfalt59","yearFounded":2010}'::jsonb,
  'main',
  '{"name":"Пермь Асфальт 59","phone":"+7 (342) 277-77-10","phoneRaw":"73422777710","address":"г. Пермь","hours":"Пн–Пт 8:00–20:00","email":"info@permasfalt59.ru","whatsapp":"73422777710","telegram":"permasfalt59","vk":"permasfalt59","yearFounded":2010}'::jsonb
)
ON CONFLICT DO NOTHING;

