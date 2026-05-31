-- ============================================================
-- ПЕРМЬ АСФАЛЬТ 59 — ULTIMATE SCHEMA
-- ============================================================

-- Roles
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin','user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  price_from NUMERIC,
  price_unit TEXT DEFAULT 'м²',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads active services" ON public.services FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage services" ON public.services FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Pricing items
CREATE TABLE IF NOT EXISTS public.pricing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT DEFAULT 'м²',
  price NUMERIC NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads pricing" ON public.pricing_items FOR SELECT USING (true);
CREATE POLICY "admins manage pricing" ON public.pricing_items FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Projects (portfolio)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  cover_image TEXT,
  location TEXT,
  area_m2 NUMERIC,
  completed_at DATE,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads active projects" ON public.projects FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Project photos
CREATE TABLE IF NOT EXISTS public.project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads project photos" ON public.project_photos FOR SELECT USING (true);
CREATE POLICY "admins manage project photos" ON public.project_photos FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_company TEXT,
  content TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads active reviews" ON public.reviews FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage reviews" ON public.reviews FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Blog posts
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  keywords TEXT,
  read_minutes INT NOT NULL DEFAULT 5,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published posts" ON public.posts FOR SELECT USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage posts" ON public.posts FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT NOT NULL,
  message TEXT,
  service TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read leads" ON public.leads FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage leads" ON public.leads FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Site settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- SEED DATA — Services
-- ============================================================
INSERT INTO public.services (slug, title, short_description, description, icon, price_from, price_unit, sort_order) VALUES
('asfaltirovanie', 'Асфальтирование', 'Укладка асфальта любой сложности — дворы, парковки, дороги', 'Полный цикл работ: подготовка основания, укладка горячей асфальтобетонной смеси, уплотнение катками. Собственный парк техники. Гарантия 3 года.', 'hard-hat', 1500, 'м²', 0),
('yamochnyy-remont', 'Ямочный ремонт', 'Локальный ремонт асфальтового покрытия', 'Карточный метод: фрезерование краёв, грунтовка битумной эмульсией, укладка горячим асфальтом. Работаем от 5 м². Срок 3–5 лет.', 'wrench', 500, 'м²', 1),
('trotuarnaya-plitka', 'Тротуарная плитка', 'Мощение дорожек, дворов, парковок и отмосток', 'Укладка вибропрессованной плитки с подготовкой щебёночного основания. Любой рисунок и форма. Установка бордюрного камня.', 'layout-grid', 1200, 'м²', 2),
('zemlyanye-raboty', 'Земляные работы', 'Разработка грунта, планировка, рытьё траншей', 'Экскаваторные работы, срезка и планировка площадок, рытьё котлованов и траншей, вывоз грунта. Работаем в Перми и крае.', 'mountain', 250, 'м³', 3),
('demontazh', 'Демонтаж', 'Снос старых покрытий, зданий и вывоз мусора', 'Демонтаж асфальта, плитки, бордюров, малых строений. Вывоз и утилизация с документами. Быстро и аккуратно.', 'trash-2', 150, 'м²', 4),
('arenda-spetstekhniki', 'Аренда спецтехники', 'Экскаваторы, самосвалы, катки, бульдозеры', 'Аренда экскаваторов-погрузчиков, самосвалов, асфальтовых катков, бульдозеров. Опытные операторы. Работаем круглосуточно.', 'truck', 2500, 'час', 5),
('materialy', 'Стройматериалы', 'Доставка щебня, песка, асфальтовой смеси', 'Доставка инертных материалов: щебень, песок, ПГС, асфальтовая смесь. Самосвалы от 10 до 30 тонн. Документы на утилизацию.', 'package', 1200, 'тонна', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA — Reviews
-- ============================================================
INSERT INTO public.reviews (author_name, author_role, author_company, content, rating, sort_order) VALUES
('Алексей Михайлов', 'Директор', 'ООО «СтройИнвест»', 'Заказывали асфальтирование территории склада 2400 м². Сделали за 4 дня, без срыва сроков. Качество — отличное, после года эксплуатации трещин нет.', 5, 0),
('Ирина Соколова', 'Председатель', 'ТСЖ «Парковая, 12»', 'Замостили двор тротуарной плиткой. Аккуратно, чисто, согласовали рисунок. Жильцы довольны, рекомендуем.', 5, 1),
('Дмитрий Кузнецов', 'Частный заказчик', NULL, 'Снос старого дома и вывоз мусора. Управились за один день, всё чисто, документы на утилизацию выдали.', 5, 2),
('Сергей Петров', 'Технический директор', 'АО «ПермГазСтрой»', 'Работали с ними по сезонному договору на уборку снега. Парковка всегда чистая, выезжают ночью без напоминаний.', 5, 3),
('Мария Лебедева', 'Управляющий', 'Сеть АЗС «МаксиПетрол»', 'Ямочный ремонт на трёх объектах. Сделали быстро, цена адекватная, гарантию подтверждают договором.', 5, 4),
('Андрей Васильев', 'Предприниматель', 'ИП Васильев А.В.', 'Доставили 80 тонн щебня в срок. Документы в порядке, водитель адекватный. Буду заказывать ещё.', 5, 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA — Site Settings
-- ============================================================
INSERT INTO public.site_settings (key, value) VALUES
('contacts', '{"phone": "+7 (342) 277-77-10", "phone2": null, "email": "info@permasfalt59.ru", "address": "г. Пермь, ул. Промышленная, д. 1", "work_hours": "Пн–Пт: 8:00–20:00, Сб: 9:00–18:00", "whatsapp": "+73422777710", "telegram": "@permasfalt59", "max": null}'),
('hero', '{"title": null, "subtitle": null, "badge": "Работаем с 2010 года · Пермь и край"}'),
('about', '{"title": "КЛАДЁМ АСФАЛЬТ И ПЛИТКУ С 2010 ГОДА", "text": "Компания Пермь Асфальт 59 специализируется на асфальтировании дворов, парковок, дорог и промышленных территорий в Перми и Пермском крае. За 15 лет работы — более 500 реализованных объектов. Собственная техника, обученные бригады, полный цикл работ под ключ.", "stats": [{"value": "500+", "label": "объектов сдано"}, {"value": "15+", "label": "лет на рынке"}, {"value": "3 года", "label": "гарантия"}, {"value": "24/7", "label": "выезд по заявке"}]}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Function: assign admin by email
-- ============================================================
CREATE OR REPLACE FUNCTION public.assign_admin_by_email(_email TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _uid UUID;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE email = _email LIMIT 1;
  IF _uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin') ON CONFLICT DO NOTHING;
  END IF;
END;
$$;
