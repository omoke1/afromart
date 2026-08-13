-- Order audit trail + Stripe payment reference (used for refunds).

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  event text not null,
  message text,
  actor text,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_id_idx on public.order_events(order_id);

alter table public.orders add column if not exists payment_intent text;

-- Allow the admin "Refund" action, which sets the order status to Refunded.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in ('Preparing', 'Out for delivery', 'Delivered', 'Cancelled', 'Refunded'));

alter table public.order_events enable row level security;
