
-- Fix groups INSERT policy
DROP POLICY IF EXISTS "Auth users can create groups" ON "public"."groups";
CREATE POLICY "Enable insert for authenticated users only" ON "public"."groups" FOR INSERT TO authenticated WITH CHECK (true);

-- Ensure auto-join trigger exists
CREATE OR REPLACE FUNCTION public.handle_group_creator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_group_created ON public.groups;
CREATE TRIGGER on_group_created
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_group_creator();
