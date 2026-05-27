
-- 1. Realtime: enable RLS on realtime.messages (app does not use Realtime broadcast)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- 2. groups: restrict SELECT to members and INSERT to creator
DROP POLICY IF EXISTS "Allow Select for All Logged In" ON public.groups;
DROP POLICY IF EXISTS "Allow Insert for All Logged In" ON public.groups;

CREATE POLICY "Members can view their groups"
ON public.groups FOR SELECT TO authenticated
USING (public.is_group_member(auth.uid(), id) OR created_by = auth.uid());

CREATE POLICY "Users can create their own groups"
ON public.groups FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- 3. group_members: tighten SELECT/INSERT/UPDATE
DROP POLICY IF EXISTS "Anyone logged in can view members" ON public.group_members;
DROP POLICY IF EXISTS "Anyone logged in can insert members" ON public.group_members;
DROP POLICY IF EXISTS "Members can update own membership" ON public.group_members;

CREATE POLICY "Members can view co-members"
ON public.group_members FOR SELECT TO authenticated
USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Users can join groups as member only"
ON public.group_members FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'member');

CREATE POLICY "Members can update own membership"
ON public.group_members FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Restrict updatable columns so members cannot escalate role
REVOKE UPDATE ON public.group_members FROM authenticated;
GRANT UPDATE (personal_limit) ON public.group_members TO authenticated;

-- 4. notifications: prevent sender spoofing
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Members can create notifications from themselves"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = from_user_id AND public.is_group_member(auth.uid(), group_id));

-- 5. Revoke EXECUTE on SECURITY DEFINER functions not intended to be called directly
REVOKE EXECUTE ON FUNCTION public.handle_group_creator() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_group() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_expense_added() FROM PUBLIC, anon, authenticated;

-- Keep add_member_by_email callable by signed-in users only
REVOKE EXECUTE ON FUNCTION public.add_member_by_email(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_member_by_email(text, uuid) TO authenticated;
