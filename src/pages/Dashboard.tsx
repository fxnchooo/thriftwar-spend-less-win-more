import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Mascot from "@/components/Mascot";
import GroupSetup from "@/components/GroupSetup";
import AddExpenseModal from "@/components/AddExpenseModal";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/types/expense";
import { useGroupExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useConvertAmount, getCurrencySymbol } from "@/hooks/useCurrency";
import CurrencyPicker from "@/components/CurrencyPicker";

interface DashboardProps {
  groupId: string | null;
  lobby?: boolean;
}

const Dashboard = ({ groupId, lobby }: DashboardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showGroupSetup, setShowGroupSetup] = useState(false);
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: expenses } = useGroupExpenses(groupId ?? undefined);
  const convert = useConvertAmount();
  const currencySymbol = getCurrencySymbol(profile?.preferred_currency || "USD");

  const myExpenses = expenses?.filter((e) => e.user_id === user?.id) || [];
  const today = new Date().toDateString();
  const todayExpenses = myExpenses.filter((e) => new Date(e.created_at).toDateString() === today);
  const dailyTotal = todayExpenses.reduce((sum, e) => sum + convert(Number(e.amount), e.currency), 0);
  const dailyBudget = 50;
  const isOverBudget = dailyTotal > dailyBudget;

  const pennyState = isOverBudget ? "sad" : dailyTotal === 0 ? "happy" : "happy";
  const pennyMessage = isOverBudget
    ? "You're over budget! 😭"
    : dailyTotal === 0
    ? "Great start! Keep saving! 🎉"
    : "You're doing great! 💪";

  const getCategoryEmoji = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat)?.emoji ?? "💰";

  if (lobby) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 pb-24 pt-8">
        <div className="flex w-full items-center justify-between">
          <div />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-foreground">ThriftWar</h1>
            <p className="text-sm text-muted-foreground">Spend less. Win more. 🐷</p>
          </div>
          <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <Mascot state="happy" message="Welcome aboard! 🎉" />
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-muted-foreground">You aren't in a group yet. Create one to start a war, or wait for an invite!</p>
          {!showGroupSetup ? (
            <Button onClick={() => setShowGroupSetup(true)} className="h-12 rounded-2xl px-8 text-lg font-bold">
              Create Group 🚀
            </Button>
          ) : (
            <GroupSetup />
          )}
        </div>
        <CurrencyPicker open={showCurrency} onOpenChange={setShowCurrency} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-24 pt-8">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <button onClick={() => setShowCurrency(true)} className="text-sm text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-foreground">ThriftWar</h1>
          <p className="text-sm text-muted-foreground">Spend less. Win more. 🐷</p>
        </div>
        <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* Streak placeholder */}
      <Badge className="border-none bg-primary/15 text-primary hover:bg-primary/20 gap-1 px-4 py-1.5 text-sm font-semibold">
        🔥 {profile?.display_name || "Player"}
      </Badge>

      <Mascot state={pennyState} message={pennyMessage} />

      {/* Daily Spend */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-muted-foreground">Today's Spending</span>
        <motion.span
          key={dailyTotal}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1, color: isOverBudget ? "hsl(var(--danger))" : "hsl(var(--foreground))" }}
          className="text-5xl font-black"
        >
          {currencySymbol}{dailyTotal.toFixed(2)}
        </motion.span>
        <span className="text-xs text-muted-foreground">Budget: {currencySymbol}{dailyBudget}/day</span>
      </div>

      {/* Recent */}
      <div className="w-full max-w-md">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Recent</h2>
        <AnimatePresence>
          {!todayExpenses.length ? (
            <p className="py-4 text-center text-sm text-muted-foreground/60">No expenses yet. Keep it that way! 🎯</p>
          ) : (
            <div className="flex flex-col gap-2">
              {todayExpenses.map((expense) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryEmoji(expense.category)}</span>
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
        className="fixed bottom-24 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
      >
        <Plus className="h-8 w-8" />
      </motion.button>

      {groupId && (
        <AddExpenseModal
          open={showModal}
          onOpenChange={setShowModal}
          groupId={groupId}
          userCurrency={profile?.preferred_currency || "USD"}
        />
      )}

      <CurrencyPicker open={showCurrency} onOpenChange={setShowCurrency} />
    </div>
  );
};

export default Dashboard;
