import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Zap } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  isAfter,
  isBefore,
  format,
  getDay,
} from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useGroupMembers } from "@/hooks/useGroups";
import { useGroupExpenses } from "@/hooks/useExpenses";
import { useConvertAmount, getCurrencySymbol } from "@/hooks/useCurrency";
import { useProfile } from "@/hooks/useProfile";

interface WeekWrappedCardProps {
  groupId: string | null;
  onOpenWheel?: () => void;
}

const dismissKey = (uid: string, weekStart: Date) =>
  `thriftwar:week_wrapped_dismissed:${uid}:${format(weekStart, "yyyy-MM-dd")}`;

const WeekWrappedCard = ({ groupId, onOpenWheel }: WeekWrappedCardProps) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: members } = useGroupMembers(groupId ?? undefined);
  const { data: expenses } = useGroupExpenses(groupId ?? undefined);
  const convert = useConvertAmount();
  const symbol = getCurrencySymbol(profile?.preferred_currency || "USD");

  // Window: Sunday 18:00 → Monday 23:59 (local time)
  const inRitualWindow = useMemo(() => {
    const day = getDay(new Date()); // 0 = Sun
    const hour = new Date().getHours();
    return (day === 0 && hour >= 18) || day === 1;
  }, []);

  // The week we're wrapping = the just-finished week
  const lastWeekStart = useMemo(
    () => startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
    []
  );
  const lastWeekEnd = useMemo(
    () => endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
    []
  );

  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    if (!user) return;
    setDismissed(!!localStorage.getItem(dismissKey(user.id, lastWeekStart)));
  }, [user, lastWeekStart]);

  const rankings = useMemo(() => {
    return (members || [])
      .map((m) => {
        const total = (expenses || [])
          .filter((e) => {
            const d = new Date(e.created_at);
            return (
              e.user_id === m.user_id &&
              isAfter(d, lastWeekStart) &&
              isBefore(d, lastWeekEnd)
            );
          })
          .reduce((sum, e) => sum + convert(Number(e.amount), e.currency), 0);
        return {
          userId: m.user_id,
          name: m.profiles.display_name,
          avatar: m.profiles.avatar_text,
          totalSpent: total,
          isMe: m.user_id === user?.id,
        };
      })
      .sort((a, b) => a.totalSpent - b.totalSpent);
  }, [members, expenses, convert, lastWeekStart, lastWeekEnd, user?.id]);

  if (!inRitualWindow || dismissed || !groupId || rankings.length < 2) return null;

  const winner = rankings[0];
  const loser = rankings[rankings.length - 1];
  const me = rankings.find((r) => r.isMe);
  const myRank = me ? rankings.findIndex((r) => r.isMe) + 1 : null;

  const dismiss = () => {
    if (!user) return;
    localStorage.setItem(dismissKey(user.id, lastWeekStart), "1");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-card to-card p-5 shadow-sm ring-1 ring-primary/20"
      >
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-secondary"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
          <Trophy className="h-3 w-3" /> Week wrapped
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {format(lastWeekStart, "MMM d")} – {format(lastWeekEnd, "MMM d")}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-background/60 p-2.5">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">👑 Winner</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-lg">{winner.avatar}</span>
              <span className="truncate text-sm font-bold text-foreground">
                {winner.isMe ? "You" : winner.name}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {symbol}
              {winner.totalSpent.toFixed(0)}
            </p>
          </div>
          <div className="rounded-2xl bg-background/60 p-2.5">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">🤡 Pays up</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-lg">{loser.avatar}</span>
              <span className="truncate text-sm font-bold text-foreground">
                {loser.isMe ? "You" : loser.name}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-danger">
              {symbol}
              {loser.totalSpent.toFixed(0)}
            </p>
          </div>
        </div>

        {myRank && (
          <p className="mt-3 text-xs text-muted-foreground">
            You finished{" "}
            <span className="font-bold text-foreground">
              #{myRank} of {rankings.length}
            </span>
            {me && (
              <>
                {" "}· {symbol}
                {me.totalSpent.toFixed(0)} spent
              </>
            )}
          </p>
        )}

        <button
          onClick={() => {
            dismiss();
            onOpenWheel?.();
          }}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          <Zap className="h-4 w-4" /> Spin the wheel 🎡
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default WeekWrappedCard;
