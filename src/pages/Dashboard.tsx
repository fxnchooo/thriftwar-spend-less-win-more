import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import Mascot from "@/components/Mascot";
import AddExpenseModal from "@/components/AddExpenseModal";
import BudgetRing from "@/components/BudgetRing";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/types/expense";
import { useGroupExpenses } from "@/hooks/useExpenses";
import { usePersonalExpenses } from "@/hooks/usePersonalExpenses";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useConvertAmount, getCurrencySymbol } from "@/hooks/useCurrency";
import { useMyMembership } from "@/hooks/useGroups";
import NotificationsPanel from "@/components/NotificationsPanel";
import { startOfWeek, startOfMonth, isAfter } from "date-fns";

interface DashboardProps {
  groupId: string | null;
  lobby?: boolean;
  onCreateGroup?: () => void;
  onGoSolo?: () => void;
}

const Dashboard = ({ groupId, lobby, onCreateGroup, onGoSolo }: DashboardProps) => {
  const [showModal, setShowModal] = useState(false);
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: expenses } = useGroupExpenses(groupId ?? undefined);
  const { data: membership } = useMyMembership(groupId ?? undefined);
  const { expenses: personalExpenses } = usePersonalExpenses();
  const convert = useConvertAmount();
  const currencySymbol = getCurrencySymbol(profile?.preferred_currency || "USD");

  const myExpenses = expenses?.filter((e) => e.user_id === user?.id) || [];
  const today = new Date().toDateString();
  const todayExpenses = myExpenses.filter((e) => new Date(e.created_at).toDateString() === today);
  const dailyTotal = todayExpenses.reduce((sum, e) => sum + convert(Number(e.amount), e.currency), 0);
  const dailyBudget = membership?.personal_limit != null ? Number(membership.personal_limit) : 50;
  const isOverBudget = dailyTotal > dailyBudget;

  const personalStats = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const monthStart = startOfMonth(new Date());
    let week = 0;
    let month = 0;
    personalExpenses.forEach((e) => {
      const d = new Date(e.date);
      if (isAfter(d, weekStart) || d.toDateString() === weekStart.toDateString()) week += e.amount;
      if (isAfter(d, monthStart) || d.toDateString() === monthStart.toDateString()) month += e.amount;
    });
    return { week, month, count: personalExpenses.length };
  }, [personalExpenses]);

  const pennyState = isOverBudget ? "sad" : "happy";
  const pennyMessage = isOverBudget
    ? "You're over budget! 😭"
    : dailyTotal === 0
    ? "No spending yet! 🎉"
    : `${currencySymbol}${(dailyBudget - dailyTotal).toFixed(0)} left today 💪`;

  const getCategoryEmoji = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat)?.emoji ?? "💰";

  if (lobby) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 pb-24 pt-6">
        <header className="flex w-full items-center justify-between">
          <div />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-foreground">ThriftWar</h1>
            <p className="text-xs text-muted-foreground">Spend less. Win more. 🐷</p>
          </div>
          <div className="flex items-center gap-1">
            <NotificationsPanel />
          </div>
        </header>

        <Mascot state="happy" message="Welcome aboard! 🎉" />

        <div className="flex w-full max-w-sm flex-col gap-3">
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">
              No group yet? No problem.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start tracking your own spending right now. You can invite friends later.
            </p>
            <Button
              onClick={onGoSolo}
              className="mt-3 h-11 w-full rounded-2xl text-sm font-bold"
            >
              <Wallet className="mr-1 h-4 w-4" /> Open Solo Tracker
            </Button>
          </div>

          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Want to play with friends?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a group to unlock leaderboards, shared budgets, and the punishment wheel.
            </p>
            <Button
              variant="secondary"
              onClick={onCreateGroup}
              className="mt-3 h-11 w-full rounded-2xl text-sm font-bold"
            >
              <Users className="mr-1 h-4 w-4" /> Create a group
            </Button>
          </div>
        </div>

        <button
          onClick={signOut}
          className="mt-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 px-4 pb-24 pt-4">
      {/* Greeting */}
      <Badge className="border-none bg-primary/15 text-primary hover:bg-primary/20 gap-1 px-4 py-1.5 text-sm font-semibold">
        🔥 {profile?.display_name || "Player"}
      </Badge>

      <Mascot state={pennyState} message={pennyMessage} />

      {/* Budget Ring */}
      <BudgetRing spent={dailyTotal} budget={dailyBudget} currencySymbol={currencySymbol} />

      {/* Personal summary peek */}
      <button
        onClick={onGoSolo}
        className="flex w-full max-w-md items-center justify-between rounded-2xl bg-card p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-lg">
            🧾
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Solo Tracker</p>
            <p className="text-[11px] text-muted-foreground">
              {personalStats.count === 0
                ? "Track private spending"
                : `${currencySymbol}${personalStats.week.toFixed(0)} this week · ${personalStats.count} entries`}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-primary">Open →</span>
      </button>

      {/* Today's Group Expenses */}
      <div className="w-full max-w-md">
        <h2 className="mb-3 flex items-center justify-between text-sm font-semibold text-muted-foreground">
          <span>Today's Group Expenses</span>
          <span className="text-xs font-normal">
            {todayExpenses.length} {todayExpenses.length === 1 ? "entry" : "entries"}
          </span>
        </h2>
        <AnimatePresence>
          {!todayExpenses.length ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-6 shadow-sm">
              <span className="text-3xl">🎯</span>
              <p className="text-sm font-medium text-muted-foreground">No expenses yet today!</p>
              <p className="text-xs text-muted-foreground/60">Keep it that way to win 👑</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todayExpenses.map((expense, i) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-xl">
                      {getCategoryEmoji(expense.category)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold capitalize text-card-foreground">
                        {CATEGORIES.find((c) => c.value === expense.category)?.label || expense.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(expense.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-danger">
                    -{currencySymbol}{convert(Number(expense.amount), expense.currency).toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
        aria-label="Add expense"
      >
        <Plus className="h-7 w-7" />
      </motion.button>

      <AddExpenseModal
        open={showModal}
        onOpenChange={setShowModal}
        groupId={groupId}
        userCurrency={profile?.preferred_currency || "USD"}
      />
    </div>
  );
};

export default Dashboard;
