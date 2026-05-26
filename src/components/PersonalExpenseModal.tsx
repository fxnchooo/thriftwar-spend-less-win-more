import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PERSONAL_CATEGORIES, PAYMENT_METHODS } from "@/types/expense";
import { usePersonalExpenses, type PersonalExpense, type PaymentMethod } from "@/hooks/usePersonalExpenses";
import { useProfile } from "@/hooks/useProfile";
import { getCurrencySymbol } from "@/hooks/useCurrency";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: PersonalExpense | null;
}

const today = () => new Date().toISOString().slice(0, 10);

const PersonalExpenseModal = ({ open, onOpenChange, editing }: Props) => {
  const { addExpense, updateExpense } = usePersonalExpenses();
  const { data: profile } = useProfile();
  const currency = profile?.preferred_currency || "USD";
  const symbol = getCurrencySymbol(currency);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("food");
  const [date, setDate] = useState<string>(today());
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("card");

  useEffect(() => {
    if (open) {
      if (editing) {
        setAmount(String(editing.amount));
        setDescription(editing.description);
        setCategory(editing.category);
        setDate(editing.date);
        setNotes(editing.notes ?? "");
        setPayment(editing.payment_method ?? "card");
      } else {
        setAmount("");
        setDescription("");
        setCategory("food");
        setDate(today());
        setNotes("");
        setPayment("card");
      }
    }
  }, [open, editing]);

  const valid = parseFloat(amount) > 0 && description.trim().length > 0;

  const handleSubmit = () => {
    if (!valid) {
      toast.error("Add an amount and a short description");
      return;
    }
    const payload = {
      amount: parseFloat(amount),
      currency,
      description: description.trim(),
      category,
      date,
      notes: notes.trim() || undefined,
      payment_method: payment,
    };
    if (editing) {
      updateExpense(editing.id, payload);
      toast.success("Expense updated ✨");
    } else {
      addExpense(payload);
      toast.success("Expense saved 💸");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-w-md rounded-3xl border-none bg-card p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {editing ? "Edit Expense" : "New Personal Expense"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Amount */}
          <div className="flex flex-col items-center gap-1">
            <label className="text-xs font-medium text-muted-foreground">Amount</label>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-foreground">{symbol}</span>
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
            <span className="text-[11px] text-muted-foreground">{currency}</span>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Coffee with Lola"
              maxLength={80}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {PERSONAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-xs font-medium transition-all ${
                    category === cat.value
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date + payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={today()}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Payment</label>
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value as PaymentMethod)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.emoji} {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else worth remembering…"
              maxLength={300}
              className="min-h-[64px] rounded-xl text-sm"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!valid}
            className="h-12 rounded-2xl text-base font-bold"
          >
            {editing ? "Save Changes" : "Add Expense 💸"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalExpenseModal;
