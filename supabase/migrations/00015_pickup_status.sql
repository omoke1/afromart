-- Add a "Ready for pickup" order status for local collection orders.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in ('Preparing', 'Out for delivery', 'Delivered', 'Cancelled', 'Refunded', 'Ready for pickup'));
