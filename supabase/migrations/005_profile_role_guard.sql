-- ─── C1: Block self-service admin escalation on public.profiles ──────────────
-- The RLS policy "Users update own profile" allows a customer to UPDATE their
-- own row. Without column-level grants that includes `role`, letting any signed
-- in customer promote themselves to admin. Fix = column grants + a hard trigger.

-- 1. Column-level privileges: authenticated users may only touch name + phone.
REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM anon;
GRANT  UPDATE (full_name, phone) ON public.profiles TO authenticated;

-- 2. Defence in depth: reject any role/id mutation not made by the service role.
CREATE OR REPLACE FUNCTION public.guard_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user NOT IN ('service_role', 'postgres', 'supabase_admin') THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'profiles.role cannot be modified by %', current_user
        USING ERRCODE = '42501';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'profiles.id cannot be modified' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_privileged_columns ON public.profiles;
CREATE TRIGGER profiles_guard_privileged_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileged_columns();

-- 3. Tighten the RLS policy with a WITH CHECK clause as well.
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
