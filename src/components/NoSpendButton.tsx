import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { usePersonalExpenses } from "@/hooks/usePersonalExpenses";
import { useProfile } from "@/hooks/useProfile";
import { format, parseISO } from "date-fns";

interface NoSpendButtonProps {
  variant?: "primary" | "ghost";
  className?: string;
}

const NoSpendButton = ({ variant = "primary", className = "" }: NoSpendButtonProps) => {
  const { expenses, addExpense } = usePersonalExpenses();
  const { data: profile } = useProfile();

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const loggedToday = useMemo(
    () => expenses.some((e) => format(parseISO(e.date), "yyyy-MM-dd") === todayStr),
    [expenses, todayStr]
  );

  const handle = () => {
    if (loggedToday) {
      toast("Today is already on the board ✅");
      return;
    }
    addExpense({
      amount: 0,
      currency: profile?.preferred_currency || "USD",
      description: "No-spend day 🛡️",
      category: "other",
      date: todayStr,
    });
    toast.success("No-spend day locked in! 🔥");
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-transform active:scale-95 disabled:opacity-60 disabled:active:scale-100";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
      : "bg-card text-foreground shadow-sm";

  return (
    <motion.button
      whileHover={{ scale: loggedToday ? 1 : 1.02 }}
      onClick={handle}
      disabled={loggedToday}
      className={`${base} ${styles} ${className}`}
    >
      <Sparkles className="h-4 w-4" />
      {loggedToday ? "No-spend logged today" : "Log no-spend day"}
    </motion.button>
  );
};

export default NoSpendButton;
