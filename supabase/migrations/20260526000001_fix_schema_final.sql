-- ============================================================
-- ФИНАЛЬНАЯ МИГРАЦИЯ: исправление конфликтов схем
-- Цель: единая, непротиворечивая схема для всего приложения
-- ============================================================

-- ----------------------------------------------------------------
-- 1. ФУНКЦИИ: нормализуем set search_path, избегаем конфликтов
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE
SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- is_admin(): удобный shorthand — проверяет и роль и email
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE
SECURITY DEFINER SET search_path = public AS $$
  SELECT (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email = 'permsite1@gmail.com'
    )
  )
$$;

-- ----------------------------------------------------------------
-- 2. ТАБЛИЦА site_settings
-- Унифицируем: используем формат key/value (как в site-data.ts)
-- Если старая таблица с id/data — мигрируем данные и пересоздаём
-- ----------------------------------------------------------------

DO $$ BEGIN
  -- Если таблица существует в старом формате (колонка id TEXT, data JSONB)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'data'
  ) THEN
    -- Переименовываем старую таблицу
    ALTER TABLE public.site_settings RENAME TO site_settings_old;

    -- Создаём новую в правильном формате
    CREATE TABLE public.site_settings (
      key  TEXT PRIMARY KEY,
      value JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

    -- Мигрируем данные из старой таблицы
    INSERT INTO public.site_settings (key, value)
    SELECT id, data FROM public.site_settings_old
    ON CONFLICT (key) DO NOTHING;

    DROP TABLE public.site_settings_old;

  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'site_settings'
  ) THEN
    CREATE TABLE public.site_settings (
      key  TEXT PRIMARY KEY,
      value JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Политики для site_settings
DROP POLICY IF EXISTS "public reads settings"   ON public.site_settings;
DROP POLICY IF EXISTS "admins manage settings"  ON public.site_settings;
DROP POLICY IF EXISTS "Public reads settings"   ON public.site_settings;
DROP POLICY IF EXISTS "Admins manage settings"  ON public.site_settings;

CREATE POLICY "public reads settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "admins manage settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed начальных настроек если их нет
INSERT INTO public.site_settings (key, value) VALUES
  ('contacts', '{
    "phone":      "+7 (342) 277-77-10",
    "phone2":     null,
    "email":      "info@permasfalt59.ru",
    "address":    "г. Пермь, ул. Промышленная, д. 1",
    "work_hours": "Пн–Пт: 8:00–20:00, Сб: 9:00–18:00",
    "whatsapp":   "+73422777710",
    "telegram":   "@permasfalt59",
    "max":        null
  }'),
  ('hero', '{
    "title":    null,
    "subtitle": null,
    "badge":    "Работаем с 2010 года · Пермь и край"
  }'),
  ('about', '{
    "title": "КЛАДЁМ АСФАЛЬТ И ПЛИТКУ С 2010 ГОДА",
    "text":  "Компания Пермь Асфальт 59 специализируется на асфальтировании дворов, парковок, дорог и промышленных территорий в Перми и Пермском крае. За 15 лет работы — более 500 реализованных объектов.",
    "stats": [
      {"value": "500+",  "label": "объектов сдано"},
      {"value": "15+",   "label": "лет на рынке"},
      {"value": "3 года","label": "гарантия"},
      {"value": "24/7",  "label": "выезд по заявке"}
    ]
  }')
ON CONFLICT (key) DO NOTHING;

-- Тригер updated_at для site_settings
DROP TRIGGER IF EXISTS site_settings_touch ON public.site_settings;
CREATE TRIGGER site_settings_touch
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ----------------------------------------------------------------
-- 3. ТАБЛИЦА services
-- Используем единую финальную схему: поля которые ожидает site-data.ts
-- short_description, sort_order, price_from NUMERIC
-- ----------------------------------------------------------------

-- Если существует старая схема с полями short / position — мигрируем
DO $$ BEGIN
  -- Добавляем недостающие колонки если их нет
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'short_description'
  ) THEN
    -- Копируем из short если есть
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'short'
    ) THEN
      ALTER TABLE public.services ADD COLUMN IF NOT EXISTS short_description TEXT;
      UPDATE public.services SET short_description = short WHERE short_description IS NULL;
    ELSE
      ALTER TABLE public.services ADD COLUMN IF NOT EXISTS short_description TEXT;
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'sort_order'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'position'
    ) THEN
      ALTER TABLE public.services ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;
      UPDATE public.services SET sort_order = position WHERE sort_order = 0;
    ELSE
      ALTER TABLE public.services ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;
    END IF;
  END IF;

  -- price_from может быть TEXT — нормализуем в NUMERIC
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'services'
      AND column_name = 'price_from' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.services
      ALTER COLUMN price_from TYPE NUMERIC
      USING NULLIF(regexp_replace(price_from, '[^0-9.]', '', 'g'), '')::NUMERIC;
  END IF;

  -- price_unit
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'price_unit'
  ) THEN
    ALTER TABLE public.services ADD COLUMN price_unit TEXT DEFAULT 'м²';
  END IF;

  -- image_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.services ADD COLUMN image_url TEXT;
  END IF;

  -- updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.services ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

-- Политики services
DROP POLICY IF EXISTS "public reads active services"  ON public.services;
DROP POLICY IF EXISTS "admins manage services"        ON public.services;
DROP POLICY IF EXISTS "Public can read services"      ON public.services;
DROP POLICY IF EXISTS "Admins manage services"        ON public.services;

CREATE POLICY "public reads active services"
  ON public.services FOR SELECT
  USING (is_active OR public.is_admin());

CREATE POLICY "admins manage services"
  ON public.services FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Тригер updated_at
DROP TRIGGER IF EXISTS services_touch ON public.services;
CREATE TRIGGER services_touch
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ----------------------------------------------------------------
-- 4. ТАБЛИЦА pricing_items
-- Уже корректная в ultimate_schema, просто гарантируем наличие
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.pricing_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  unit       TEXT DEFAULT 'м²',
  price      NUMERIC NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public reads pricing"  ON public.pricing_items;
DROP POLICY IF EXISTS "admins manage pricing" ON public.pricing_items;
DROP POLICY IF EXISTS "Public can read price items"   ON public.pricing_items;
DROP POLICY IF EXISTS "Admins manage price items"     ON public.pricing_items;

CREATE POLICY "public reads pricing"
  ON public.pricing_items FOR SELECT USING (true);

CREATE POLICY "admins manage pricing"
  ON public.pricing_items FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------
-- 5. ТАБЛИЦА projects
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  category     TEXT,
  description  TEXT,
  cover_image  TEXT,
  location     TEXT,
  area_m2      NUMERIC,
  completed_at DATE,
  sort_order   INT NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public reads active projects" ON public.projects;
DROP POLICY IF EXISTS "admins manage projects"       ON public.projects;

CREATE POLICY "public reads active projects"
  ON public.projects FOR SELECT
  USING (is_active OR public.is_admin());

CREATE POLICY "admins manage projects"
  ON public.projects FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS projects_touch ON public.projects;
CREATE TRIGGER projects_touch
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ----------------------------------------------------------------
-- 6. ТАБЛИЦА project_photos
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.project_photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  caption    TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public reads project photos" ON public.project_photos;
DROP POLICY IF EXISTS "admins manage project photos" ON public.project_photos;
DROP POLICY IF EXISTS "admins manage photos" ON public.project_photos;

CREATE POLICY "public reads project photos"
  ON public.project_photos FOR SELECT USING (true);

CREATE POLICY "admins manage project photos"
  ON public.project_photos FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------
-- 7. ТАБЛИЦА reviews
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name    TEXT NOT NULL,
  author_role    TEXT,
  author_company TEXT,
  content        TEXT NOT NULL,
  rating         INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  photo_url      TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public reads active reviews" ON public.reviews;
DROP POLICY IF EXISTS "admins manage reviews"       ON public.reviews;

CREATE POLICY "public reads active reviews"
  ON public.reviews FOR SELECT
  USING (is_active OR public.is_admin());

CREATE POLICY "admins manage reviews"
  ON public.reviews FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS reviews_touch ON public.reviews;
CREATE TRIGGER reviews_touch
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- author_company может отсутствовать в старой схеме
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS author_company TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ----------------------------------------------------------------
-- 8. ТАБЛИЦА posts
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT,
  content      TEXT,
  cover_image  TEXT,
  keywords     TEXT,
  read_minutes INT NOT NULL DEFAULT 5,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public reads published posts" ON public.posts;
DROP POLICY IF EXISTS "admins manage posts"          ON public.posts;

CREATE POLICY "public reads published posts"
  ON public.posts FOR SELECT
  USING (is_published OR public.is_admin());

CREATE POLICY "admins manage posts"
  ON public.posts FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS posts_touch ON public.posts;
CREATE TRIGGER posts_touch
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ----------------------------------------------------------------
-- 9. ТАБЛИЦА leads
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT,
  phone        TEXT NOT NULL,
  message      TEXT,
  service      TEXT,
  source       TEXT,
  status       TEXT NOT NULL DEFAULT 'new',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can insert leads"  ON public.leads;
DROP POLICY IF EXISTS "admins read leads"        ON public.leads;
DROP POLICY IF EXISTS "admins manage leads"      ON public.leads;
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
DROP POLICY IF EXISTS "Admins can view leads"    ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads"  ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads"  ON public.leads;

CREATE POLICY "anyone can insert leads"
  ON public.leads FOR INSERT WITH CHECK (true);

CREATE POLICY "admins manage leads"
  ON public.leads FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS leads_touch ON public.leads;
CREATE TRIGGER leads_touch
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Дополнительные поля которые могут отсутствовать в старой схеме
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS name    TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source  TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ----------------------------------------------------------------
-- 10. ИНДЕКСЫ
-- ----------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_services_sort_order     ON public.services (sort_order);
CREATE INDEX IF NOT EXISTS idx_services_is_active      ON public.services (is_active);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order     ON public.projects (sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_is_active      ON public.projects (is_active);
CREATE INDEX IF NOT EXISTS idx_project_photos_project  ON public.project_photos (project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_reviews_sort_order      ON public.reviews (sort_order);
CREATE INDEX IF NOT EXISTS idx_reviews_is_active       ON public.reviews (is_active);
CREATE INDEX IF NOT EXISTS idx_posts_published         ON public.posts (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created_at        ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status            ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_pricing_service         ON public.pricing_items (service_id, sort_order);

-- ----------------------------------------------------------------
-- 11. STORAGE BUCKET site-images
-- ----------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Публичный доступ на чтение
DROP POLICY IF EXISTS "public reads site-images"   ON storage.objects;
DROP POLICY IF EXISTS "Public reads site-images"   ON storage.objects;

CREATE POLICY "public reads site-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');

-- Загрузка / обновление / удаление только для администраторов
DROP POLICY IF EXISTS "admins upload site-images"  ON storage.objects;
DROP POLICY IF EXISTS "admins update site-images"  ON storage.objects;
DROP POLICY IF EXISTS "admins delete site-images"  ON storage.objects;

CREATE POLICY "admins upload site-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-images' AND public.is_admin());

CREATE POLICY "admins update site-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-images' AND public.is_admin());

CREATE POLICY "admins delete site-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-images' AND public.is_admin());

-- ----------------------------------------------------------------
-- 12. ФУНКЦИЯ assign_admin_by_email
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.assign_admin_by_email(_email TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _uid UUID;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE email = _email LIMIT 1;
  IF _uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_uid, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Назначаем главного администратора
SELECT public.assign_admin_by_email('permsite1@gmail.com');
