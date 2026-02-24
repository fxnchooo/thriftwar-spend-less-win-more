
-- 1. Strip ALL restrictive policies from the groups table
DROP POLICY IF EXISTS "Auth users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Members can view groups" ON public.groups;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.groups;
DROP POLICY IF EXISTS "Enable read access for members" ON public.groups;
DROP POLICY IF EXISTS "Allow Insert for All Logged In" ON public.groups;
DROP POLICY IF EXISTS "Allow Select for All Logged In" ON public.groups;

-- 2. Create open policies for authenticated users
CREATE POLICY "Allow Insert for All Logged In" ON public.groups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow Select for All Logged In" ON public.groups FOR SELECT TO authenticated USING (true);

-- 3. Update the auto-join function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_group()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$;
