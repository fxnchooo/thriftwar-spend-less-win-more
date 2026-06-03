import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, PERSONAL_CATEGORIES } from "@/types/expense";
import { useAddExpense } from "@/hooks/useExpenses";
import { usePersonalExpenses } from "@/hooks/usePersonalExpenses";
import { useProfile } from "@/hooks/useProfile";
import { getCurrencySymbol } from "@/hooks/useCurrency";

interface QuickAddBarProps {
  mode: "group" | "personal";
  groupId?: string | null;
  /** When true, renders as a fixed dock above the bottom nav. */
  floating?: boolean;
  /** Opens the full detail modal (guilt level, snitch, photo, etc.). */
  onOpenDetails?: () => void;
}

const QuickAddBar = ({ mode, groupId, floating = false, onOpenDetails }: QuickAddBarProps) => {
  const { data: profile } = useProfile();
  const currency = profile?.preferred_currency || "USD";
  const symbol = getCurrencySymbol(currency);
  const cats = mode === "group" ? CATEGORIES : PERSONAL_CATEGORIES;

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(cats[0].value);
  const [focused, setFocused] = useState(false);
  const addGroup = useAddExpense();
  const { addExpense: addPersonal } = usePersonalExpenses();

  const value = parseFloat(amount);
  const valid = !isNaN(value) && value > 0 && (mode === "personal" || !!groupId);
  const expanded = focused || amount.length > 0;

  const reset = () => {
    setAmount("");
    setCategory(cats[0].value);
    setFocused(false);
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

  const card = (
    <div
      className={`w-full rounded-3xl border border-border/60 bg-card/95 p-2.5 shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.18)] backdrop-blur-md transition-shadow ${
        expanded ? "shadow-[0_12px_36px_-12px_hsl(var(--primary)/0.35)]" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex flex-1 items-center gap-1 rounded-2xl px-3 py-2 transition-colors ${
            expanded ? "bg-secondary/80 ring-1 ring-primary/40" : "bg-secondary"
          }`}
        >
          <span className="text-base font-bold text-muted-foreground">{symbol}</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Quick add expense…"
            className="w-full min-w-0 bg-transparent text-base font-extrabold text-foreground outline-none placeholder:text-sm placeholder:font-medium placeholder:text-muted-foreground/70"
          />
        </div>

        {onOpenDetails && (
          <button
            type="button"
            onClick={onOpenDetails}
            aria-label="Add with details"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        )}

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

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="cats"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1 pb-0.5">
              {cats.map((c) => {
                const active = c.value === category;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (!floating) {
    return <div className="w-full max-w-md">{card}</div>;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40"
      style={{ bottom: "calc(60px + env(safe-area-inset-bottom))" }}
    >
      <div className="pointer-events-auto mx-auto w-full max-w-md px-4">{card}</div>
    </div>
  );
};

export default QuickAddBar;
