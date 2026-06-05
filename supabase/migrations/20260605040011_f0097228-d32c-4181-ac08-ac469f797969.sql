ALTER FUNCTION public.update_personal_expenses_updated_at() SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.update_personal_expenses_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_personal_expenses_updated_at() TO service_role;