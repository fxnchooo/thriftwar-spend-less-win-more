import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, TrendingUp, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import PersonalExpenseModal from "@/components/PersonalExpenseModal";
import { usePersonalExpenses, type PersonalExpense } from "@/hooks/usePersonalExpenses";
import { useProfile } from "@/hooks/useProfile";
import { getCurrencySymbol } from "@/hooks/useCurrency";
import { PERSONAL_CATEGORIES } from "@/types/expense";
import { startOfWeek, startOfMonth, isAfter, format } from "date-fns";
import { toast } from "sonner";

const Personal = () => {
  const { expenses, deleteExpense } = usePersonalExpenses();
  const { data: profile } = useProfile();
  const symbol = getCurrencySymbol(profile?.preferred_currency || "USD");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PersonalExpense | null>(null);

  const stats = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const monthStart = startOfMonth(new Date());
    let week = 0;
    let month = 0;
    const byCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      const d = new Date(e.date);
      if (isAfter(d, weekStart) || d.toDateString() === weekStart.toDateString()) week += e.amount;
      if (isAfter(d, monthStart) || d.toDateString() === monthStart.toDateString()) month += e.amount;
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    return { week, month, topCategory: top?.[0], topAmount: top?.[1] ?? 0 };
  }, [expenses]);

  const getCat = (v: string) => PERSONAL_CATEGORIES.find((c) => c.value === v);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (e: PersonalExpense) => {
    setEditing(e);
    setModalOpen(true);
  };
  const handleDelete = (e: PersonalExpense) => {
    deleteExpense(e.id);
    toast.success("Expense removed");
  };

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-4">
      <header>
        <h1 className="text-2xl font-extrabold text-foreground">Solo Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Your private spending — no group needed 🔒
        </p>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Calendar className="h-3 w-3" /> This week
          </div>
          <p className="text-2xl font-extrabold text-foreground">
            {symbol}
            {stats.week.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="h-3 w-3" /> This month
          </div>
          <p className="text-2xl font-extrabold text-foreground">
            {symbol}
            {stats.month.toFixed(2)}
          </p>
        </div>
        <div className="col-span-2 rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Tag className="h-3 w-3" /> Biggest category
          </div>
          {stats.topCategory ? (
            <p className="flex items-center gap-2 text-lg font-bold text-foreground">
              <span className="text-2xl">{getCat(stats.topCategory)?.emoji}</span>
              <span>{getCat(stats.topCategory)?.label || stats.topCategory}</span>
              <span className="ml-auto text-base font-semibold text-muted-foreground">
                {symbol}
                {stats.topAmount.toFixed(2)}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Add an expense to see your top category.</p>
          )}
        </div>
      </div>

      {/* List */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Recent expenses</h2>
          <span className="text-xs text-muted-foreground">
            {expenses.length} total
          </span>
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
                    className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">
                      {cat?.emoji || "💰"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {e.description}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(e.date), "MMM d")} · {cat?.label || e.category}
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
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
        aria-label="Add personal expense"
      >
        <Plus className="h-7 w-7" />
      </motion.button>

      <PersonalExpenseModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} />
    </div>
  );
};

export default Personal;
