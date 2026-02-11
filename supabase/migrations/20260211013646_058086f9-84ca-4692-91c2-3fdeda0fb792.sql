-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_text TEXT NOT NULL DEFAULT '🐷',
  preferred_currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Player'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  daily_bet TEXT NOT NULL DEFAULT 'Buy coffee for the winner ☕',
  weekly_bet TEXT NOT NULL DEFAULT 'Cook dinner for the group 🍳',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Group members
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Helper: check group membership (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE user_id = _user_id AND group_id = _group_id
  );
$$;

-- Groups RLS (uses helper)
CREATE POLICY "Members can view groups" ON public.groups FOR SELECT
  USING (public.is_group_member(auth.uid(), id));
CREATE POLICY "Auth users can create groups" ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can update groups" ON public.groups FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid() AND role = 'admin'));

-- Group members RLS
CREATE POLICY "Members can view group members" ON public.group_members FOR SELECT
  USING (public.is_group_member(auth.uid(), group_id));
CREATE POLICY "Admins can add members" ON public.group_members FOR INSERT
  WITH CHECK (public.is_group_member(auth.uid(), group_id));
CREATE POLICY "Members can remove themselves" ON public.group_members FOR DELETE
  USING (auth.uid() = user_id);

-- Profiles visible to group mates
CREATE POLICY "Group mates can view profiles" ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = profiles.id
    )
  );

-- Expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  category TEXT NOT NULL DEFAULT 'food',
  guilt_level INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group expenses" ON public.expenses FOR SELECT
  USING (public.is_group_member(auth.uid(), group_id));
CREATE POLICY "Users can add own expenses" ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_group_member(auth.uid(), group_id));
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT
  WITH CHECK (public.is_group_member(auth.uid(), group_id));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Currency rates table (public read)
CREATE TABLE public.currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(18,8) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rates" ON public.currency_rates FOR SELECT TO authenticated USING (true);

-- Enable realtime for expenses and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: notify group members when expense is added
CREATE OR REPLACE FUNCTION public.notify_expense_added()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _member RECORD;
  _user_name TEXT;
  _amount TEXT;
BEGIN
  SELECT display_name INTO _user_name FROM public.profiles WHERE id = NEW.user_id;
  _amount := NEW.amount::TEXT || ' ' || NEW.currency;
  
  FOR _member IN
    SELECT user_id FROM public.group_members
    WHERE group_id = NEW.group_id AND user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, group_id, from_user_id, message)
    VALUES (_member.user_id, NEW.group_id, NEW.user_id,
      _user_name || ' spent ' || _amount || ' on ' || NEW.category || '! 💸');
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_expense_added
  AFTER INSERT ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.notify_expense_added();

-- Seed common currency rates (USD base)
INSERT INTO public.currency_rates (from_currency, to_currency, rate) VALUES
  ('USD', 'EUR', 0.92), ('USD', 'GBP', 0.79), ('USD', 'JPY', 149.50),
  ('USD', 'CAD', 1.36), ('USD', 'AUD', 1.53), ('USD', 'CHF', 0.88),
  ('USD', 'CNY', 7.24), ('USD', 'INR', 83.12), ('USD', 'MXN', 17.15),
  ('USD', 'BRL', 4.97), ('USD', 'KRW', 1325.00), ('USD', 'SGD', 1.34),
  ('USD', 'HKD', 7.82), ('USD', 'NOK', 10.55), ('USD', 'SEK', 10.42),
  ('USD', 'DKK', 6.87), ('USD', 'NZD', 1.63), ('USD', 'ZAR', 18.75),
  ('USD', 'TRY', 30.25), ('USD', 'THB', 35.50), ('USD', 'TWD', 32.50),
  ('USD', 'USD', 1.00),
  ('EUR', 'USD', 1.09), ('GBP', 'USD', 1.27), ('JPY', 'USD', 0.0067),
  ('CAD', 'USD', 0.74), ('AUD', 'USD', 0.65), ('CHF', 'USD', 1.14),
  ('CNY', 'USD', 0.14), ('INR', 'USD', 0.012), ('MXN', 'USD', 0.058),
  ('BRL', 'USD', 0.20), ('KRW', 'USD', 0.00075), ('SGD', 'USD', 0.75),
  ('HKD', 'USD', 0.13), ('NOK', 'USD', 0.095), ('SEK', 'USD', 0.096),
  ('DKK', 'USD', 0.15), ('NZD', 'USD', 0.61), ('ZAR', 'USD', 0.053),
  ('TRY', 'USD', 0.033), ('THB', 'USD', 0.028), ('TWD', 'USD', 0.031);