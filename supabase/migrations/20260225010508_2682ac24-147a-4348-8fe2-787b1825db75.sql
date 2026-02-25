
-- Add status column to expenses
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'confirmed';

-- Allow members to update their own personal_limit
CREATE POLICY "Members can update own membership"
ON public.group_members
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
