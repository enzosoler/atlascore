-- Allow admin users to read the waitlist from the app
create policy "Admins can read waitlist"
  on public.waitlist for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
