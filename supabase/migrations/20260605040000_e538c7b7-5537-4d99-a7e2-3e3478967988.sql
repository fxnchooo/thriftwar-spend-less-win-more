CREATE TABLE public.personal_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  date date NOT NULL DEFAULT (now()::date),
  notes text,
  payment_method text NOT NULL DEFAULT 'card',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_expenses TO authenticated;
GRANT ALL ON public.personal_expenses TO service_role;

ALTER TABLE public.personal_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own personal expenses"
  ON public.personal_expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own personal expenses"
  ON public.personal_expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own personal expenses"
  ON public.personal_expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own personal expenses"
  ON public.personal_expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_personal_expenses_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER personal_expenses_set_updated_at
BEFORE UPDATE ON public.personal_expenses
FOR EACH ROW EXECUTE FUNCTION public.update_personal_expenses_updated_at();

CREATE INDEX idx_personal_expenses_user_date ON public.personal_expenses(user_id, date DESC);