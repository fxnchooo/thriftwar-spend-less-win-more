import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, PERSONAL_CATEGORIES } from "@/types/expense";
import { useAddExpense } from "@/hooks/useExpenses";
import { usePersonalExpenses } from "@/hooks/usePersonalExpenses";
import { useProfile } from "@/hooks/useProfile";
import { getCurrencySymbol } from "@/hooks/useCurrency";

interface QuickAddBarProps {
  mode: "group" | "personal";
  groupId?: string | null;
}

const QuickAddBar = ({ mode, groupId }: QuickAddBarProps) => {
  const { data: profile } = useProfile();
  const currency = profile?.preferred_currency || "USD";
  const symbol = getCurrencySymbol(currency);
  const cats = mode === "group" ? CATEGORIES : PERSONAL_CATEGORIES;

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(cats[0].value);
  const addGroup = useAddExpense();
  const { addExpense: addPersonal } = usePersonalExpenses();

  const value = parseFloat(amount);
  const valid = !isNaN(value) && value > 0 && (mode === "personal" || !!groupId);

  const reset = () => {
    setAmount("");
    setCategory(cats[0].value);
  };

  const submit = () => {
    if (!valid) return;
    if (mode === "group" && groupId) {
      addGroup.mutate(
        {
          group_id: groupId,
          amount: value,
          currency,
          category,
          guilt_level: 30,
          status: "confirmed",
        },
        {
          onSuccess: () => {
            toast.success("Logged 💸");
            reset();
          },
          onError: (e) => toast.error(e.message),
        }
      );
    } else {
      addPersonal({
        amount: value,
        currency,
        description: cats.find((c) => c.value === category)?.label || "Expense",
        category,
        date: new Date().toISOString().slice(0, 10),
        payment_method: "card",
      });
      toast.success("Logged 💸");
      reset();
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1 rounded-2xl bg-secondary px-3 py-2">
          <span className="text-base font-bold text-muted-foreground">{symbol}</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Quick add…"
            className="w-full min-w-0 bg-transparent text-lg font-extrabold text-foreground outline-none placeholder:text-sm placeholder:font-medium placeholder:text-muted-foreground/70"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={submit}
          disabled={!valid || addGroup.isPending}
          aria-label="Save quick expense"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-opacity disabled:opacity-40"
        >
          <Check className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="mt-2 flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
        {cats.map((c) => {
          const active = c.value === category;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-sm leading-none">{c.emoji}</span>
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickAddBar;
