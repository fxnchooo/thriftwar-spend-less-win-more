import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/types/expense";
import Mascot from "@/components/Mascot";
import { useAddExpense } from "@/hooks/useExpenses";
import { useGroupMembers } from "@/hooks/useGroups";
import { useAuth } from "@/hooks/useAuth";
import { getCurrencySymbol } from "@/hooks/useCurrency";
import { toast } from "sonner";
import type { ExpenseCategory } from "@/types/expense";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  userCurrency: string;
}

const AddExpenseModal = ({ open, onOpenChange, groupId, userCurrency }: AddExpenseModalProps) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [guiltLevel, setGuiltLevel] = useState(30);
  const [snitchMode, setSnitchMode] = useState(false);
  const [snitchTarget, setSnitchTarget] = useState<string>("");
  const addExpense = useAddExpense();
  const { user } = useAuth();
  const { data: members } = useGroupMembers(groupId);

  const otherMembers = members?.filter((m) => m.user_id !== user?.id) ?? [];

  const isHighGuilt = guiltLevel > 70;
  const symbol = getCurrencySymbol(userCurrency);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (snitchMode && !snitchTarget) {
      toast.error("Pick a friend to snitch on!");
      return;
    }

    const targetUserId = snitchMode ? snitchTarget : undefined;
    const status = snitchMode ? "pending" : "confirmed";

    addExpense.mutate(
      {
        group_id: groupId,
        amount: parseFloat(amount),
        currency: userCurrency,
        category,
        guilt_level: guiltLevel,
        ...(targetUserId ? { target_user_id: targetUserId } : {}),
        status,
      },
      {
        onSuccess: () => {
          toast.success(snitchMode ? "Snitch logged! Waiting for confirmation. 🕵️" : "Expense added! 💸");
          setAmount("");
          setCategory("food");
          setGuiltLevel(30);
          setSnitchMode(false);
          setSnitchTarget("");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const guiltLabel = guiltLevel < 30 ? "No guilt 😌" : guiltLevel < 70 ? "Some guilt 😅" : "Maximum guilt 😰";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-w-md rounded-3xl border-none bg-card p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Add Expense</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Snitch Mode Toggle */}
          <div className="flex items-center justify-between rounded-2xl bg-secondary p-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Log for a friend? (Snitch Mode) 🕵️</span>
              <span className="text-xs text-muted-foreground">Log an expense on their behalf</span>
            </div>
            <Switch checked={snitchMode} onCheckedChange={setSnitchMode} />
          </div>

          {/* Snitch Target Dropdown */}
          <AnimatePresence>
            {snitchMode && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <Select value={snitchTarget} onValueChange={setSnitchTarget}>
                  <SelectTrigger className="h-12 rounded-2xl">
                    <SelectValue placeholder="Pick a friend to snitch on..." />
                  </SelectTrigger>
                  <SelectContent>
                    {otherMembers.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.profiles?.display_name || "Unknown"} {m.profiles?.avatar_text || ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">How much?</label>
            <div className="flex items-center gap-1">
              <span className="text-3xl font-bold text-foreground">{symbol}</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-40 bg-transparent text-center text-4xl font-extrabold text-foreground outline-none placeholder:text-muted-foreground/40"
                autoFocus
              />
            </div>
            <span className="text-xs text-muted-foreground">{userCurrency}</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-3 text-sm font-medium transition-all ${
                    category === cat.value
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">Guilt Level</label>
              <span className="text-sm">{guiltLabel}</span>
            </div>
            <Slider value={[guiltLevel]} onValueChange={([v]) => setGuiltLevel(v)} max={100} step={1} className="w-full" />
          </div>

          <AnimatePresence>
            {isHighGuilt && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-center">
                <Mascot state="prompting" message="Do you really need this? 🤔" />
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || addExpense.isPending}
            className="h-12 rounded-2xl bg-primary text-lg font-bold text-primary-foreground hover:bg-primary/90"
          >
            {addExpense.isPending ? "Adding..." : snitchMode ? "Snitch! 🕵️" : "Add Expense 💸"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
