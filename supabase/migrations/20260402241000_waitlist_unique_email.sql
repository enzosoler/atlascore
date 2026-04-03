-- Prevent duplicate waitlist signups by email
alter table public.waitlist add constraint waitlist_email_unique unique (email);
