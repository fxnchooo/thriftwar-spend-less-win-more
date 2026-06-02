CREATE TABLE public.expense_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (expense_id, user_id, emoji)
);

CREATE INDEX idx_expense_reactions_expense ON public.expense_reactions(expense_id);

GRANT SELECT, INSERT, DELETE ON public.expense_reactions TO authenticated;
GRANT ALL ON public.expense_reactions TO service_role;

ALTER TABLE public.expense_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view reactions on group expenses"
ON public.expense_reactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.expenses e
    WHERE e.id = expense_reactions.expense_id
      AND public.is_group_member(auth.uid(), e.group_id)
  )
);

CREATE POLICY "Members can react on their group's expenses"
ON public.expense_reactions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.expenses e
    WHERE e.id = expense_reactions.expense_id
      AND public.is_group_member(auth.uid(), e.group_id)
  )
);

CREATE POLICY "Users can remove their own reactions"
ON public.expense_reactions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_reactions;
ALTER TABLE public.expense_reactions REPLICA IDENTITY FULL;