CREATE OR REPLACE FUNCTION public.add_member_by_email(target_email text, target_group_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  -- Authorization: only admins of the target group can invite
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = target_group_id
      AND user_id = auth.uid()
      AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authorized');
  END IF;

  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  -- Uniform response to prevent account enumeration
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', true, 'message', 'Invite sent if user exists');
  END IF;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (target_group_id, target_user_id, 'member')
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('success', true, 'message', 'Invite sent if user exists');
END;
$function$;