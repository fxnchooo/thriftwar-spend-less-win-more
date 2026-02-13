
-- 1. Drop the broken policies that are causing the lockout
DROP POLICY IF EXISTS "Auth users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Members can view groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.groups;

-- 2. Create a permissive INSERT policy
CREATE POLICY "Enable insert for authenticated users" ON public.groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- 3. Create a permissive SELECT policy
CREATE POLICY "Enable read access for members" ON public.groups FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid()
  )
);

-- 4. Create the Trigger Function to auto-add the creator
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

-- 5. Attach the Trigger
DROP TRIGGER IF EXISTS on_group_created ON public.groups;
CREATE TRIGGER on_group_created
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_group();
