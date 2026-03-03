import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Mascot from "@/components/Mascot";
import GroupSetup from "@/components/GroupSetup";
import AddExpenseModal from "@/components/AddExpenseModal";
import BudgetRing from "@/components/BudgetRing";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/types/expense";
import { useGroupExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useConvertAmount, getCurrencySymbol } from "@/hooks/useCurrency";
import { useMyMembership } from "@/hooks/useGroups";
import NotificationsPanel from "@/components/NotificationsPanel";

interface DashboardProps {
  groupId: string | null;
  lobby?: boolean;
}

const Dashboard = ({ groupId, lobby }: DashboardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showGroupSetup, setShowGroupSetup] = useState(false);
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: expenses } = useGroupExpenses(groupId ?? undefined);
  const { data: membership } = useMyMembership(groupId ?? undefined);
  const convert = useConvertAmount();
  const currencySymbol = getCurrencySymbol(profile?.preferred_currency || "USD");

  const myExpenses = expenses?.filter((e) => e.user_id === user?.id) || [];
  const today = new Date().toDateString();
  const todayExpenses = myExpenses.filter((e) => new Date(e.created_at).toDateString() === today);
  const dailyTotal = todayExpenses.reduce((sum, e) => sum + convert(Number(e.amount), e.currency), 0);
  const dailyBudget = membership?.personal_limit != null ? Number(membership.personal_limit) : 50;
  const isOverBudget = dailyTotal > dailyBudget;

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
      <div className="flex flex-col items-center gap-6 px-4 pb-24 pt-16">
        {/* Lobby Header */}
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

        <div className="flex w-full max-w-xs flex-col items-center gap-4 text-center">
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              You aren't in a group yet. Create one to start a war, or wait for an invite!
            </p>
          </div>
          {!showGroupSetup ? (
            <Button
              onClick={() => setShowGroupSetup(true)}
              className="h-12 w-full rounded-2xl text-base font-bold"
            >
              Create Group 🚀
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <GroupSetup />
            </motion.div>
          )}
        </div>

        <button
          onClick={signOut}
          className="mt-4 text-xs font-medium text-muted-foreground hover:text-foreground"
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

      {/* Recent */}
      <div className="w-full max-w-md">
        <h2 className="mb-3 flex items-center justify-between text-sm font-semibold text-muted-foreground">
          <span>Today's Expenses</span>
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
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
      >
        <Plus className="h-7 w-7" />
      </motion.button>

      {groupId && (
        <AddExpenseModal
          open={showModal}
          onOpenChange={setShowModal}
          groupId={groupId}
          userCurrency={profile?.preferred_currency || "USD"}
        />
      )}
    </div>
  );
};

export default Dashboard;
