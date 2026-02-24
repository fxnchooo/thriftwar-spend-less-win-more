
-- 1. Add variable budget column
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS daily_limit NUMERIC DEFAULT 50;

-- 2. Create a Secure Function to add members by email
CREATE OR REPLACE FUNCTION public.add_member_by_email(
  target_email TEXT,
  target_group_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (target_group_id, target_user_id, 'member')
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('success', true, 'message', 'User added');
END;
$$;
