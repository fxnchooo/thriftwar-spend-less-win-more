import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, TrendingUp, Calendar, Tag, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Mascot from "@/components/Mascot";
import BudgetRing from "@/components/BudgetRing";
import PersonalExpenseModal from "@/components/PersonalExpenseModal";
import { usePersonalExpenses, type PersonalExpense } from "@/hooks/usePersonalExpenses";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { getCurrencySymbol } from "@/hooks/useCurrency";
import { PERSONAL_CATEGORIES } from "@/types/expense";
import { startOfWeek, startOfMonth, isAfter, format, parseISO } from "date-fns";
import { toast } from "sonner";
import StreakChip from "@/components/StreakChip";
import NoSpendButton from "@/components/NoSpendButton";
import QuickAddBar from "@/components/QuickAddBar";

const budgetKey = (uid: string) => `thriftwar:personal_budget:${uid}`;

const Personal = () => {
  const { user } = useAuth();
  const { expenses, deleteExpense } = usePersonalExpenses();
  const { data: profile } = useProfile();
  const symbol = getCurrencySymbol(profile?.preferred_currency || "USD");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PersonalExpense | null>(null);

  const [dailyBudget, setDailyBudget] = useState<number>(50);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState("50");

  useEffect(() => {
    if (!user) return;
    const raw = localStorage.getItem(budgetKey(user.id));
    const val = raw ? Number(raw) : 50;
    setDailyBudget(Number.isFinite(val) && val > 0 ? val : 50);
    setBudgetDraft(String(Number.isFinite(val) && val > 0 ? val : 50));
  }, [user]);

  const saveBudget = () => {
    if (!user) return;
    const val = Number(budgetDraft);
    if (!Number.isFinite(val) || val <= 0) {
      toast.error("Enter a valid budget");
      return;
    }
    localStorage.setItem(budgetKey(user.id), String(val));
    setDailyBudget(val);
    setEditingBudget(false);
    toast.success("Budget updated");
  };

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const monthStart = startOfMonth(new Date());
    let day = 0;
    let week = 0;
    let month = 0;
    const byCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      const d = parseISO(e.date);
      if (d.toDateString() === today) day += e.amount;
      if (isAfter(d, weekStart) || d.toDateString() === weekStart.toDateString()) week += e.amount;
      if (isAfter(d, monthStart) || d.toDateString() === monthStart.toDateString()) month += e.amount;
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    return { day, week, month, topCategory: top?.[0], topAmount: top?.[1] ?? 0 };
  }, [expenses]);

  const isOver = stats.day > dailyBudget;
  const pennyState = isOver ? "sad" : "happy";
  const pennyMessage = isOver
    ? "Over budget today 😬"
    : stats.day === 0
    ? "Fresh start today! 🎉"
    : `${symbol}${(dailyBudget - stats.day).toFixed(0)} left today 💪`;

  const getCat = (v: string) => PERSONAL_CATEGORIES.find((c) => c.value === v);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (e: PersonalExpense) => {
    setEditing(e);
    setModalOpen(true);
  };
  const handleDelete = async (e: PersonalExpense) => {
    try {
      await deleteExpense(e.id);
      toast.success("Expense removed");
    } catch (err: any) {
      toast.error(err.message || "Could not delete");
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 px-4 pb-28 pt-4">
      <StreakChip name={profile?.display_name} />

      <Mascot state={pennyState} message={pennyMessage} />

      <BudgetRing spent={stats.day} budget={dailyBudget} currencySymbol={symbol} />

      <NoSpendButton variant="ghost" />

      {/* Quick add — one-tap expense logging */}
      <QuickAddBar mode="personal" />



      {/* Daily budget editor */}
      <div className="flex items-center gap-2 text-xs">
        {editingBudget ? (
          <>
            <span className="text-muted-foreground">Daily budget</span>
            <Input
              value={budgetDraft}
              onChange={(e) => setBudgetDraft(e.target.value)}
              type="number"
              inputMode="decimal"
              className="h-8 w-20 rounded-lg text-center text-sm"
            />
            <button
              onClick={saveBudget}
              className="rounded-lg bg-primary p-1.5 text-primary-foreground"
              aria-label="Save budget"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setEditingBudget(false);
                setBudgetDraft(String(dailyBudget));
              }}
              className="rounded-lg bg-secondary p-1.5 text-foreground"
              aria-label="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditingBudget(true)}
            className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-sm hover:text-foreground"
          >
            <Pencil className="h-3 w-3" /> Edit daily budget ({symbol}{dailyBudget})
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Calendar className="h-3 w-3" /> This week
          </div>
          <p className="text-xl font-extrabold text-foreground">
            {symbol}{stats.week.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="h-3 w-3" /> This month
          </div>
          <p className="text-xl font-extrabold text-foreground">
            {symbol}{stats.month.toFixed(2)}
          </p>
        </div>
        <div className="col-span-2 rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Tag className="h-3 w-3" /> Biggest category
          </div>
          {stats.topCategory ? (
            <p className="flex items-center gap-2 text-base font-bold text-foreground">
              <span className="text-2xl">{getCat(stats.topCategory)?.emoji}</span>
              <span>{getCat(stats.topCategory)?.label || stats.topCategory}</span>
              <span className="ml-auto text-sm font-semibold text-muted-foreground">
                {symbol}{stats.topAmount.toFixed(2)}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Add an expense to see your top category.</p>
          )}
        </div>
      </div>

      {/* List */}
      <div className="w-full max-w-md">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Recent expenses</h2>
          <span className="text-xs text-muted-foreground">{expenses.length} total</span>
        </div>

        <AnimatePresence>
          {expenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 rounded-2xl bg-card p-8 text-center shadow-sm"
            >
              <span className="text-4xl">🧾</span>
              <div>
                <p className="font-semibold text-foreground">No personal expenses yet</p>
                <p className="text-xs text-muted-foreground">
                  Track your first expense to start your money story.
                </p>
              </div>
              <Button onClick={openAdd} className="h-10 rounded-xl px-5 font-bold">
                <Plus className="mr-1 h-4 w-4" /> Add your first expense
              </Button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2">
              {expenses.slice(0, 50).map((e, i) => {
                const cat = getCat(e.category);
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.2) }}
                    className="flex items-center gap-3 rounded-2xl bg-card p-3 pr-3 shadow-sm last:mr-20"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">
                      {cat?.emoji || "💰"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {e.description}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(parseISO(e.date), "MMM d")} · {cat?.label || e.category}
                        {e.payment_method ? ` · ${e.payment_method}` : ""}
                      </p>
                    </div>
                    <span className="text-base font-bold text-danger">
                      -{getCurrencySymbol(e.currency)}
                      {e.amount.toFixed(2)}
                    </span>
                    <div className="ml-1 flex flex-col gap-1">
                      <button
                        onClick={() => openEdit(e)}
                        aria-label="Edit expense"
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(e)}
                        aria-label="Delete expense"
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={openAdd}
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
        aria-label="Add personal expense"
      >
        <Plus className="h-7 w-7" />
      </motion.button>

      <PersonalExpenseModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} />
    </div>
  );
};

export default Personal;
