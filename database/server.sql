create table public.licenses (
  id uuid not null default gen_random_uuid (),
  key text not null,
  machine_id text null,
  is_active boolean null default true,
  activated_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  customer_name text null,
  app_name text null,
  constraint licenses_pkey primary key (id),
  constraint licenses_key_key unique (key)
) TABLESPACE pg_default;
