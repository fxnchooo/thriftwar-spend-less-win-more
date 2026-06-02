import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const QUICK_REACTIONS = ["😂", "😱", "🤡", "💀", "👑", "🔥"];

interface Reaction {
  id: string;
  expense_id: string;
  user_id: string;
  emoji: string;
}

interface ExpenseReactionsProps {
  expenseId: string;
  groupId: string;
}

const ExpenseReactions = ({ expenseId, groupId }: ExpenseReactionsProps) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Load + subscribe
  useEffect(() => {
    let active = true;
    supabase
      .from("expense_reactions")
      .select("id,expense_id,user_id,emoji")
      .eq("expense_id", expenseId)
      .then(({ data }) => {
        if (active && data) setReactions(data as Reaction[]);
      });

    const channel = supabase
      .channel(`reactions-${expenseId}-${Math.random().toString(36).slice(2)}`);
    channel
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "expense_reactions",
          filter: `expense_id=eq.${expenseId}`,
        },
        (payload: any) => {
          setReactions((prev) => {
            if (payload.eventType === "INSERT") {
              if (prev.some((r) => r.id === payload.new.id)) return prev;
              return [...prev, payload.new as Reaction];
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((r) => r.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [expenseId]);

  // Group by emoji with counts and "did I react?" flag
  const grouped = useMemo(() => {
    const map = new Map<string, { count: number; mine?: string }>();
    reactions.forEach((r) => {
      const e = map.get(r.emoji) || { count: 0 };
      e.count++;
      if (r.user_id === user?.id) e.mine = r.id;
      map.set(r.emoji, e);
    });
    return Array.from(map.entries()).map(([emoji, v]) => ({ emoji, ...v }));
  }, [reactions, user?.id]);

  const toggle = async (emoji: string) => {
    if (!user) return;
    const existing = reactions.find(
      (r) => r.user_id === user.id && r.emoji === emoji
    );
    if (existing) {
      setReactions((prev) => prev.filter((r) => r.id !== existing.id));
      const { error } = await supabase
        .from("expense_reactions")
        .delete()
        .eq("id", existing.id);
      if (error) toast.error("Couldn't remove reaction");
    } else {
      const { data, error } = await supabase
        .from("expense_reactions")
        .insert({ expense_id: expenseId, user_id: user.id, emoji })
        .select()
        .single();
      if (error) {
        toast.error("Couldn't react");
        return;
      }
      if (data) {
        setReactions((prev) =>
          prev.some((r) => r.id === (data as Reaction).id)
            ? prev
            : [...prev, data as Reaction]
        );
      }
    }
    setPickerOpen(false);
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <AnimatePresence initial={false}>
        {grouped.map((g) => (
          <motion.button
            key={g.emoji}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            onClick={() => toggle(g.emoji)}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
              g.mine
                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-sm leading-none">{g.emoji}</span>
            {g.count}
          </motion.button>
        ))}
      </AnimatePresence>

      <div className="relative">
        <button
          onClick={() => setPickerOpen((v) => !v)}
          aria-label="Add reaction"
          className="flex h-6 items-center gap-1 rounded-full bg-secondary px-2 text-muted-foreground hover:text-foreground"
        >
          <Smile className="h-3 w-3" />
          <span className="text-[10px] font-bold">+</span>
        </button>

        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.9 }}
              className="absolute bottom-full left-0 z-10 mb-1 flex gap-0.5 rounded-2xl bg-card p-1.5 shadow-lg ring-1 ring-border"
            >
              {QUICK_REACTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => toggle(e)}
                  className="rounded-lg px-1.5 py-1 text-lg transition-transform hover:scale-125"
                >
                  {e}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExpenseReactions;
