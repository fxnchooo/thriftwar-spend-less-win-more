import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import Penny from "@/components/Penny";
import AddExpenseModal from "@/components/AddExpenseModal";
import { Badge } from "@/components/ui/badge";
import type { Expense } from "@/types/expense";
import { CATEGORIES } from "@/types/expense";

const Dashboard = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [streak] = useState(5);

  const dailyTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyBudget = 50;
  const isOverBudget = dailyTotal > dailyBudget;
  const lastExpenseHigh = expenses.length > 0 && expenses[expenses.length - 1]?.amount > 20;

  const pennyState = lastExpenseHigh || isOverBudget ? "sad" : "happy";
  const pennyMessage = isOverBudget
    ? "You're over budget! 😭"
    : lastExpenseHigh
    ? "That was a big one... 💸"
    : dailyTotal === 0
    ? "Great start! Keep saving! 🎉"
    : "You're doing great! 💪";

  const handleAddExpense = (data: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const getCategoryEmoji = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat)?.emoji ?? "💰";

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-24 pt-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-foreground">ThriftWar</h1>
        <p className="text-sm text-muted-foreground">Spend less. Win more. 🐷</p>
      </div>

      {/* Streak */}
      <Badge className="bg-primary/15 text-primary hover:bg-primary/20 gap-1 px-4 py-1.5 text-sm font-semibold border-none">
        🔥 {streak} days under budget
      </Badge>

      {/* Penny */}
      <Penny state={pennyState} message={pennyMessage} />

      {/* Daily Spend */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-muted-foreground">Today's Spending</span>
        <motion.span
          key={dailyTotal}
          initial={{ scale: 1.3, color: "hsl(var(--danger))" }}
          animate={{ scale: 1, color: isOverBudget ? "hsl(var(--danger))" : "hsl(var(--foreground))" }}
          className="text-5xl font-black"
        >
          ${dailyTotal.toFixed(2)}
        </motion.span>
        <span className="text-xs text-muted-foreground">Budget: ${dailyBudget}/day</span>
      </div>

      {/* Recent Expenses */}
      <div className="w-full max-w-md">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Recent</h2>
        <AnimatePresence>
          {expenses.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground/60 py-4">No expenses yet. Keep it that way! 🎯</p>
          ) : (
            <div className="flex flex-col gap-2">
              {[...expenses].reverse().map((expense) => (
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
                        {CATEGORIES.find((c) => c.value === expense.category)?.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expense.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-danger">-${expense.amount.toFixed(2)}</span>
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

      <AddExpenseModal open={showModal} onOpenChange={setShowModal} onAdd={handleAddExpense} />
    </div>
  );
};

export default Dashboard;
