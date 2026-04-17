-- ============================================================
-- PLATAFORMA DE CURSOS — SUPABASE SCHEMA
-- Diseñado para escalar: cursos, live, blogs, newsletter,
-- multi-instructor, roles, progreso, pagos (futuro)
-- ============================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- búsqueda full-text eficiente

-- ============================================================
-- TIPOS ENUMERADOS
-- ============================================================

create type user_role as enum ('student', 'instructor', 'admin');
create type course_type as enum ('recorded', 'live');
create type course_status as enum ('draft', 'published', 'archived');
create type module_content_type as enum ('youtube_video', 'youtube_live', 'twitch_live', 'text', 'file');
create type live_event_status as enum ('scheduled', 'live', 'ended', 'cancelled');
create type blog_status as enum ('draft', 'published', 'archived');
create type subscription_status as enum ('active', 'cancelled', 'expired');
create type enrollment_status as enum ('active', 'completed', 'refunded');
create type notification_type as enum ('new_course', 'new_blog', 'live_starting', 'course_update', 'general');

-- ============================================================
-- PERFILES DE USUARIO
-- Extiende auth.users de Supabase
-- ============================================================

create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            user_role not null default 'student',
  full_name       text,
  avatar_url      text,
  bio             text,
  username        text unique,                         -- slug público del perfil
  website_url     text,
  social_links    jsonb default '{}',                  -- { "twitter": "...", "youtube": "...", "linkedin": "..." }
  is_verified     boolean not null default false,      -- instructor verificado
  stripe_customer_id text,                             -- para pagos futuros
  preferences     jsonb default '{}',                  -- preferencias UI del usuario
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on column public.profiles.social_links is 'JSON libre para links sociales: twitter, youtube, linkedin, etc.';
comment on column public.profiles.preferences is 'Preferencias UI: idioma, notificaciones, etc.';

-- ============================================================
-- CATEGORÍAS DE CURSOS
-- Árbol jerárquico (categoría padre -> hijo)
-- ============================================================

create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  parent_id   uuid references public.categories(id) on delete set null,
  name        text not null,
  slug        text not null unique,
  description text,
  icon_url    text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ETIQUETAS / TAGS
-- ============================================================

create table public.tags (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- CURSOS
-- ============================================================

create table public.courses (
  id                  uuid primary key default uuid_generate_v4(),
  instructor_id       uuid not null references public.profiles(id) on delete restrict,
  category_id         uuid references public.categories(id) on delete set null,
  type                course_type not null default 'recorded',
  status              course_status not null default 'draft',
  title               text not null,
  slug                text not null unique,
  short_description   text,                            -- para cards (máx ~160 chars)
  description         text,                            -- descripción larga
  thumbnail_url       text,
  trailer_youtube_id  text,                            -- video de presentación del curso
  level               text check (level in ('beginner', 'intermediate', 'advanced', 'all')),
  language            text not null default 'es',
  duration_minutes    integer,                         -- calculado o manual
  is_free             boolean not null default true,
  price               numeric(10,2),                   -- null = gratis, valor = precio en USD
  currency            text not null default 'usd',
  max_students        integer,                         -- null = sin límite
  requirements        text[],                          -- lista de prerrequisitos
  what_you_learn      text[],                          -- lista de lo que aprenderás
  meta_title          text,                            -- SEO
  meta_description    text,                            -- SEO
  published_at        timestamptz,
  sort_order          integer not null default 0,
  metadata            jsonb default '{}',              -- extensiones futuras sin migrar
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on column public.courses.metadata is 'Extensible: certificates, cohort_id, etc.';

-- Relación cursos <-> tags (many-to-many)
create table public.course_tags (
  course_id uuid not null references public.courses(id) on delete cascade,
  tag_id    uuid not null references public.tags(id) on delete cascade,
  primary key (course_id, tag_id)
);

-- Co-instructores: un curso puede tener múltiples instructores
create table public.course_instructors (
  course_id     uuid not null references public.courses(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  role          text not null default 'co-instructor',  -- 'owner', 'co-instructor', 'guest'
  added_at      timestamptz not null default now(),
  primary key (course_id, instructor_id)
);

-- ============================================================
-- SECCIONES DE CURSO (agrupa módulos)
-- ============================================================

create table public.course_sections (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- MÓDULOS (capítulos / clases individuales)
-- ============================================================

create table public.modules (
  id              uuid primary key default uuid_generate_v4(),
  course_id       uuid not null references public.courses(id) on delete cascade,
  section_id      uuid references public.course_sections(id) on delete set null,
  content_type    module_content_type not null default 'youtube_video',
  title           text not null,
  description     text,
  youtube_video_id text,                               -- ID del video de YouTube
  youtube_url     text,                                -- URL completa si se prefiere
  duration_seconds integer,                            -- duración del video en segundos
  is_free_preview boolean not null default false,      -- módulo demo sin enrolamiento
  is_published    boolean not null default false,
  sort_order      integer not null default 0,
  resources       jsonb default '[]',                  -- [{ "title": "PDF", "url": "..." }]
  transcript      text,                                -- transcripción para SEO y accesibilidad
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on column public.modules.resources is 'Array de recursos descargables: [{title, url, type}]';

-- ============================================================
-- EVENTOS EN VIVO
-- ============================================================

create table public.live_events (
  id                  uuid primary key default uuid_generate_v4(),
  course_id           uuid references public.courses(id) on delete set null,  -- null = evento independiente
  instructor_id       uuid not null references public.profiles(id) on delete restrict,
  status              live_event_status not null default 'scheduled',
  title               text not null,
  slug                text not null unique,
  description         text,
  thumbnail_url       text,
  platform            text not null default 'youtube',  -- 'youtube' | 'twitch'
  stream_id           text,                              -- YouTube live stream ID o Twitch channel
  stream_url          text,                              -- URL pública del stream
  chat_enabled        boolean not null default true,
  scheduled_at        timestamptz not null,
  ended_at            timestamptz,
  replay_youtube_id   text,                              -- si queda grabado en YouTube
  max_attendees       integer,
  is_free             boolean not null default true,
  price               numeric(10,2),
  metadata            jsonb default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- ENROLAMIENTOS (acceso a cursos)
-- ============================================================

create table public.enrollments (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  course_id       uuid not null references public.courses(id) on delete cascade,
  status          enrollment_status not null default 'active',
  enrolled_at     timestamptz not null default now(),
  completed_at    timestamptz,
  -- Datos de pago (cuando aplique)
  amount_paid     numeric(10,2),
  currency        text,
  payment_intent  text,                                -- Stripe PaymentIntent ID
  coupon_code     text,
  unique (user_id, course_id)
);

-- Asistencia a eventos en vivo
create table public.live_event_registrations (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  event_id      uuid not null references public.live_events(id) on delete cascade,
  registered_at timestamptz not null default now(),
  attended      boolean not null default false,
  unique (user_id, event_id)
);

-- ============================================================
-- PROGRESO DE USUARIO POR MÓDULO
-- ============================================================

create table public.module_progress (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  module_id           uuid not null references public.modules(id) on delete cascade,
  course_id           uuid not null references public.courses(id) on delete cascade,  -- desnormalizado para queries rápidas
  completed           boolean not null default false,
  watched_seconds     integer not null default 0,      -- segundos vistos (para reanudar)
  playback_position   integer not null default 0,      -- posición en segundos para "continuar"
  last_watched_at     timestamptz,
  completed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (user_id, module_id)
);

-- ============================================================
-- BLOG / ENTRADAS DE CONTENIDO
-- ============================================================

create table public.blog_posts (
  id               uuid primary key default uuid_generate_v4(),
  author_id        uuid not null references public.profiles(id) on delete restrict,
  status           blog_status not null default 'draft',
  title            text not null,
  slug             text not null unique,
  excerpt          text,                               -- resumen corto para cards y email
  content          jsonb,                              -- JSON de Tiptap (rich text estructurado)
  content_html     text,                               -- HTML renderizado (cache para SSR/email)
  cover_image_url  text,
  reading_time_min integer,                            -- calculado al guardar
  is_featured      boolean not null default false,
  send_newsletter  boolean not null default false,     -- ¿enviar por email al publicar?
  newsletter_sent_at timestamptz,
  meta_title       text,
  meta_description text,
  related_course_id uuid references public.courses(id) on delete set null,
  published_at     timestamptz,
  metadata         jsonb default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Relación blog <-> tags
create table public.blog_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id  uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ============================================================
-- SUSCRIPTORES DE NEWSLETTER
-- Independiente de auth.users (puede suscribirse sin cuenta)
-- ============================================================

create table public.newsletter_subscribers (
  id              uuid primary key default uuid_generate_v4(),
  email           text not null unique,
  user_id         uuid references public.profiles(id) on delete set null, -- null si no tiene cuenta
  status          subscription_status not null default 'active',
  first_name      text,
  subscribed_at   timestamptz not null default now(),
  unsubscribed_at timestamptz,
  source          text,                               -- 'footer', 'blog', 'course_page', etc.
  tags            text[] default '{}',               -- segmentación futura
  resend_contact_id text,                             -- ID en Resend/Loops
  metadata        jsonb default '{}'
);

-- ============================================================
-- PÁGINAS ESTÁTICAS / SECCIONES CUSTOM
-- Para embeds HTML, landing pages, páginas de ventas
-- ============================================================

create table public.pages (
  id           uuid primary key default uuid_generate_v4(),
  author_id    uuid not null references public.profiles(id) on delete restrict,
  title        text not null,
  slug         text not null unique,
  content      jsonb,                                 -- JSON Tiptap
  content_html text,                                  -- HTML renderizado
  is_published boolean not null default false,
  show_in_nav  boolean not null default false,
  nav_label    text,
  sort_order   integer not null default 0,
  meta_title   text,
  meta_description text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- COMENTARIOS (cursos, módulos, blogs)
-- Polimórfico con target_type
-- ============================================================

create table public.comments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  parent_id   uuid references public.comments(id) on delete cascade,  -- respuestas
  target_type text not null check (target_type in ('module', 'blog_post', 'live_event')),
  target_id   uuid not null,
  content     text not null,
  is_pinned   boolean not null default false,
  is_hidden   boolean not null default false,         -- moderación
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- RESEÑAS DE CURSOS
-- ============================================================

create table public.course_reviews (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  title      text,
  content    text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ============================================================
-- NOTIFICACIONES IN-APP
-- ============================================================

create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        notification_type not null,
  title       text not null,
  body        text,
  action_url  text,
  is_read     boolean not null default false,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);

-- ============================================================
-- CUPONES DE DESCUENTO (preparado para pagos)
-- ============================================================

create table public.coupons (
  id                uuid primary key default uuid_generate_v4(),
  code              text not null unique,
  discount_type     text not null check (discount_type in ('percent', 'fixed')),
  discount_value    numeric(10,2) not null,
  max_uses          integer,
  used_count        integer not null default 0,
  course_id         uuid references public.courses(id) on delete cascade,  -- null = global
  expires_at        timestamptz,
  is_active         boolean not null default true,
  created_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- AUDIT LOG (trazabilidad de acciones admin)
-- ============================================================

create table public.audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,                          -- 'publish_course', 'delete_user', etc.
  target_type text,
  target_id   uuid,
  details     jsonb default '{}',
  ip_address  inet,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Búsqueda y filtros frecuentes
create index idx_courses_instructor on public.courses(instructor_id);
create index idx_courses_status on public.courses(status);
create index idx_courses_type on public.courses(type);
create index idx_courses_category on public.courses(category_id);
create index idx_courses_slug on public.courses(slug);
create index idx_modules_course on public.modules(course_id);
create index idx_modules_section on public.modules(section_id);
create index idx_module_progress_user on public.module_progress(user_id);
create index idx_module_progress_course on public.module_progress(course_id);
create index idx_enrollments_user on public.enrollments(user_id);
create index idx_enrollments_course on public.enrollments(course_id);
create index idx_blog_posts_author on public.blog_posts(author_id);
create index idx_blog_posts_status on public.blog_posts(status);
create index idx_blog_posts_slug on public.blog_posts(slug);
create index idx_live_events_scheduled on public.live_events(scheduled_at);
create index idx_live_events_status on public.live_events(status);
create index idx_comments_target on public.comments(target_type, target_id);
create index idx_notifications_user on public.notifications(user_id, is_read);
create index idx_newsletter_email on public.newsletter_subscribers(email);

-- Full-text search en cursos y blogs
create index idx_courses_fts on public.courses using gin(to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(short_description,'')));
create index idx_blog_posts_fts on public.blog_posts using gin(to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(excerpt,'')));

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_courses_updated_at before update on public.courses for each row execute function public.set_updated_at();
create trigger trg_modules_updated_at before update on public.modules for each row execute function public.set_updated_at();
create trigger trg_course_sections_updated_at before update on public.course_sections for each row execute function public.set_updated_at();
create trigger trg_live_events_updated_at before update on public.live_events for each row execute function public.set_updated_at();
create trigger trg_blog_posts_updated_at before update on public.blog_posts for each row execute function public.set_updated_at();
create trigger trg_comments_updated_at before update on public.comments for each row execute function public.set_updated_at();
create trigger trg_module_progress_updated_at before update on public.module_progress for each row execute function public.set_updated_at();
create trigger trg_pages_updated_at before update on public.pages for each row execute function public.set_updated_at();

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- FUNCIÓN: progreso total de un usuario en un curso (%)
-- ============================================================

create or replace function public.get_course_progress(p_user_id uuid, p_course_id uuid)
returns numeric language sql stable as $$
  select
    case
      when count(m.id) = 0 then 0
      else round(
        count(mp.id) filter (where mp.completed = true)::numeric
        / count(m.id)::numeric * 100, 1
      )
    end
  from public.modules m
  left join public.module_progress mp
    on mp.module_id = m.id and mp.user_id = p_user_id
  where m.course_id = p_course_id
    and m.is_published = true;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_sections enable row level security;
alter table public.modules enable row level security;
alter table public.live_events enable row level security;
alter table public.enrollments enable row level security;
alter table public.module_progress enable row level security;
alter table public.blog_posts enable row level security;
alter table public.comments enable row level security;
alter table public.course_reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.pages enable row level security;
alter table public.coupons enable row level security;
alter table public.live_event_registrations enable row level security;
alter table public.audit_logs enable row level security;

-- Helper: saber si el usuario actual es admin
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: saber si es instructor del curso
create or replace function public.is_course_instructor(p_course_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.courses
    where id = p_course_id and instructor_id = auth.uid()
  ) or exists (
    select 1 from public.course_instructors
    where course_id = p_course_id and instructor_id = auth.uid()
  );
$$;

-- PROFILES
create policy "Perfiles públicos visibles para todos" on public.profiles for select using (true);
create policy "Usuario actualiza su propio perfil" on public.profiles for update using (auth.uid() = id);
create policy "Admin actualiza cualquier perfil" on public.profiles for update using (public.is_admin());

-- COURSES
create policy "Cursos publicados visibles para todos" on public.courses for select using (status = 'published' or auth.uid() = instructor_id or public.is_admin());
create policy "Instructor crea cursos" on public.courses for insert with check (auth.uid() = instructor_id);
create policy "Instructor edita sus cursos" on public.courses for update using (auth.uid() = instructor_id or public.is_admin());
create policy "Solo admin elimina cursos" on public.courses for delete using (public.is_admin());

-- MODULES
create policy "Módulos visibles si el curso está publicado" on public.modules for select
  using (
    is_free_preview = true
    or exists (select 1 from public.courses where id = course_id and status = 'published')
    or exists (select 1 from public.enrollments where course_id = modules.course_id and user_id = auth.uid() and status = 'active')
    or public.is_course_instructor(course_id)
    or public.is_admin()
  );
create policy "Instructor gestiona módulos de sus cursos" on public.modules for all using (public.is_course_instructor(course_id) or public.is_admin());

-- ENROLLMENTS
create policy "Usuario ve sus propios enrolamientos" on public.enrollments for select using (auth.uid() = user_id or public.is_admin());
create policy "Usuario se enrola" on public.enrollments for insert with check (auth.uid() = user_id);
create policy "Admin gestiona enrolamientos" on public.enrollments for all using (public.is_admin());

-- MODULE PROGRESS
create policy "Usuario ve y actualiza su propio progreso" on public.module_progress for all using (auth.uid() = user_id);
create policy "Admin ve todo el progreso" on public.module_progress for select using (public.is_admin());

-- BLOG POSTS
create policy "Posts publicados visibles para todos" on public.blog_posts for select using (status = 'published' or auth.uid() = author_id or public.is_admin());
create policy "Instructor/admin crea posts" on public.blog_posts for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('instructor','admin'))
);
create policy "Autor edita sus posts" on public.blog_posts for update using (auth.uid() = author_id or public.is_admin());
create policy "Solo admin elimina posts" on public.blog_posts for delete using (public.is_admin());

-- COMMENTS
create policy "Comentarios visibles para todos" on public.comments for select using (is_hidden = false or public.is_admin());
create policy "Usuario autenticado comenta" on public.comments for insert with check (auth.uid() = user_id);
create policy "Usuario borra su propio comentario" on public.comments for delete using (auth.uid() = user_id or public.is_admin());

-- NOTIFICATIONS
create policy "Usuario ve sus notificaciones" on public.notifications for select using (auth.uid() = user_id);
create policy "Usuario actualiza sus notificaciones" on public.notifications for update using (auth.uid() = user_id);

-- NEWSLETTER SUBSCRIBERS
create policy "Cualquiera puede suscribirse" on public.newsletter_subscribers for insert with check (true);
create policy "Suscriptor ve su propia entrada" on public.newsletter_subscribers for select using (auth.uid() = user_id or public.is_admin());
create policy "Admin gestiona suscriptores" on public.newsletter_subscribers for all using (public.is_admin());

-- PAGES
create policy "Páginas publicadas visibles" on public.pages for select using (is_published = true or public.is_admin());
create policy "Admin gestiona páginas" on public.pages for all using (public.is_admin());

-- COUPONS
create policy "Admin gestiona cupones" on public.coupons for all using (public.is_admin());

-- LIVE EVENTS
create policy "Eventos visibles para todos" on public.live_events for select using (status != 'cancelled' or public.is_admin());
create policy "Instructor gestiona sus eventos" on public.live_events for all using (auth.uid() = instructor_id or public.is_admin());

-- LIVE EVENT REGISTRATIONS
create policy "Usuario ve su registro" on public.live_event_registrations for select using (auth.uid() = user_id or public.is_admin());
create policy "Usuario se registra a evento" on public.live_event_registrations for insert with check (auth.uid() = user_id);

-- AUDIT LOGS
create policy "Solo admin ve audit logs" on public.audit_logs for select using (public.is_admin());

-- ============================================================
-- DATOS INICIALES (seed mínimo)
-- ============================================================

-- Categorías base
insert into public.categories (name, slug, sort_order) values
  ('Tecnología', 'tecnologia', 1),
  ('Diseño', 'diseno', 2),
  ('Negocios', 'negocios', 3),
  ('Marketing', 'marketing', 4),
  ('Personal', 'desarrollo-personal', 5);

insert into public.categories (name, slug, parent_id, sort_order)
  select 'Programación', 'programacion', id, 1 from public.categories where slug = 'tecnologia';
insert into public.categories (name, slug, parent_id, sort_order)
  select 'Inteligencia Artificial', 'inteligencia-artificial', id, 2 from public.categories where slug = 'tecnologia';
