
-- 1. Drop the looping policies on group_members
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Enable read access for members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can add members" ON public.group_members;

-- 2. Create a flat, non-recursive rule for viewing members
CREATE POLICY "Anyone logged in can view members" ON public.group_members FOR SELECT TO authenticated USING (true);

-- 3. Create a simple rule for adding members
CREATE POLICY "Anyone logged in can insert members" ON public.group_members FOR INSERT TO authenticated WITH CHECK (true);
