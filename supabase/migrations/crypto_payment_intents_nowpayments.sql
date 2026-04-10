-- NOWPayments invoice id when using hosted invoice checkout (replaces former BTCPay column name).

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'crypto_payment_intents' and column_name = 'btcpay_invoice_id'
  ) then
    alter table public.crypto_payment_intents rename column btcpay_invoice_id to nowpayments_invoice_id;
  elsif not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'crypto_payment_intents' and column_name = 'nowpayments_invoice_id'
  ) then
    alter table public.crypto_payment_intents add column nowpayments_invoice_id text;
  end if;
end $$;

drop index if exists crypto_payment_intents_btcpay_invoice_idx;

create index if not exists crypto_payment_intents_nowpayments_invoice_idx
  on public.crypto_payment_intents (nowpayments_invoice_id)
  where nowpayments_invoice_id is not null;
