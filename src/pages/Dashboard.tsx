import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Wallet, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Mascot from "@/components/Mascot";
import AddExpenseModal from "@/components/AddExpenseModal";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/types/expense";
import { useGroupExpenses } from "@/hooks/useExpenses";
import { usePersonalExpenses } from "@/hooks/usePersonalExpenses";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useConvertAmount, getCurrencySymbol } from "@/hooks/useCurrency";
import { useGroupMembers } from "@/hooks/useGroups";
import NotificationsPanel from "@/components/NotificationsPanel";
import { startOfWeek, startOfMonth, isAfter } from "date-fns";
import StreakChip from "@/components/StreakChip";
import NoSpendButton from "@/components/NoSpendButton";
import WeekWrappedCard from "@/components/WeekWrappedCard";

interface DashboardProps {
  groupId: string | null;
  lobby?: boolean;
  onCreateGroup?: () => void;
  onGoSolo?: () => void;
  onOpenWheel?: () => void;
}

const Dashboard = ({ groupId, lobby, onCreateGroup, onGoSolo, onOpenWheel }: DashboardProps) => {
  const [showModal, setShowModal] = useState(false);
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: expenses } = useGroupExpenses(groupId ?? undefined);
  const { data: members } = useGroupMembers(groupId ?? undefined);
  const { expenses: personalExpenses } = usePersonalExpenses();
  const convert = useConvertAmount();
  const currencySymbol = getCurrencySymbol(profile?.preferred_currency || "USD");

  const memberById = useMemo(() => {
    const m = new Map<string, { name: string; avatar: string }>();
    (members || []).forEach((mm) =>
      m.set(mm.user_id, {
        name: mm.profiles?.display_name || "Unknown",
        avatar: mm.profiles?.avatar_text || "🐷",
      })
    );
    return m;
  }, [members]);

  const today = new Date().toDateString();
  const todayExpenses = (expenses || []).filter(
    (e) => new Date(e.created_at).toDateString() === today
  );

  // Weekly competition stats
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekly = useMemo(() => {
    const totals = new Map<string, number>();
    (members || []).forEach((m) => totals.set(m.user_id, 0));
    (expenses || []).forEach((e) => {
      if (!isAfter(new Date(e.created_at), weekStart)) return;
      totals.set(
        e.user_id,
        (totals.get(e.user_id) ?? 0) + convert(Number(e.amount), e.currency)
      );
    });
    const ranking = Array.from(totals.entries())
      .map(([uid, total]) => ({ uid, total }))
      .sort((a, b) => a.total - b.total);
    const myTotal = totals.get(user?.id ?? "") ?? 0;
    const myRank = ranking.findIndex((r) => r.uid === user?.id);
    const leader = ranking[0];
    return { myTotal, myRank, total: ranking.length, leader };
  }, [expenses, members, user?.id, convert, weekStart]);

  const personalStats = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    let week = 0;
    let month = 0;
    personalExpenses.forEach((e) => {
      const d = new Date(e.date);
      if (isAfter(d, weekStart) || d.toDateString() === weekStart.toDateString()) week += e.amount;
      if (isAfter(d, monthStart) || d.toDateString() === monthStart.toDateString()) month += e.amount;
    });
    return { week, month, count: personalExpenses.length };
  }, [personalExpenses, weekStart]);

  const isLeader = weekly.total > 1 && weekly.myRank === 0;
  const isLast = weekly.total > 1 && weekly.myRank === weekly.total - 1;
  const pennyState = isLast ? "sad" : isLeader ? "happy" : "happy";
  const pennyMessage =
    weekly.total <= 1
      ? "Invite friends to start the war! ⚔️"
      : isLeader
      ? "You're winning the week! 👑"
      : isLast
      ? "You're last — careful, the wheel awaits! 🎡"
      : `Spend less to climb the board 💪`;

  const getCategoryEmoji = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat)?.emoji ?? "💰";

  if (lobby) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 pb-24 pt-6">
        <header className="flex w-full items-center justify-between">
          <div />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-foreground">ThriftWar</h1>
            <p className="text-xs text-muted-foreground">Spend less. Win more. 🐷</p>
          </div>
          <div className="flex items-center gap-1">
            <NotificationsPanel />
          </div>
        </header>

        <Mascot state="happy" message="Welcome aboard! 🎉" />

        <div className="flex w-full max-w-sm flex-col gap-3">
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">
              No group yet? No problem.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start tracking your own spending right now. You can invite friends later.
            </p>
            <Button
              onClick={onGoSolo}
              className="mt-3 h-11 w-full rounded-2xl text-sm font-bold"
            >
              <Wallet className="mr-1 h-4 w-4" /> Open Solo Tracker
            </Button>
          </div>

          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Want to play with friends?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a group to unlock the weekly leaderboard and the punishment wheel.
            </p>
            <Button
              variant="secondary"
              onClick={onCreateGroup}
              className="mt-3 h-11 w-full rounded-2xl text-sm font-bold"
            >
              <Users className="mr-1 h-4 w-4" /> Create a group
            </Button>
          </div>
        </div>

        <button
          onClick={signOut}
          className="mt-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    );
  }

  const leaderInfo = weekly.leader ? memberById.get(weekly.leader.uid) : undefined;

  return (
    <div className="flex flex-col items-center gap-5 px-4 pb-24 pt-4">
      {/* Greeting + streak */}
      <StreakChip name={profile?.display_name} />

      <Mascot state={pennyState} message={pennyMessage} />

      {/* End-of-week ritual */}
      <WeekWrappedCard groupId={groupId} onOpenWheel={onOpenWheel} />

      {/* Weekly competition card (replaces BudgetRing) */}
      <div className="w-full max-w-md rounded-3xl bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              My spend this week
            </p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums text-foreground">
              {currencySymbol}
              {weekly.myTotal.toFixed(0)}
            </p>
          </div>
          {weekly.total > 0 && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Rank
              </span>
              <span
                className={`rounded-2xl px-3 py-1.5 text-sm font-extrabold ${
                  isLeader
                    ? "bg-primary/15 text-primary"
                    : isLast
                    ? "bg-danger/15 text-danger"
                    : "bg-secondary text-foreground"
                }`}
              >
                {weekly.myRank >= 0 ? `#${weekly.myRank + 1}` : "—"}
                <span className="ml-1 text-[11px] font-medium text-muted-foreground">
                  / {weekly.total}
                </span>
              </span>
            </div>
          )}
        </div>

        {weekly.total > 1 && leaderInfo && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-xs">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">Leader:</span>
            <span className="text-base leading-none">{leaderInfo.avatar}</span>
            <span className="font-medium text-foreground">{leaderInfo.name}</span>
            <span className="ml-auto font-bold tabular-nums text-foreground">
              {currencySymbol}
              {weekly.leader!.total.toFixed(0)}
            </span>
          </div>
        )}
      </div>

      {/* Daily ritual: lock in a no-spend day */}
      <NoSpendButton className="w-full max-w-md" />

      {/* Personal summary peek */}
      <button
        onClick={onGoSolo}
        disabled={!onGoSolo}
        className="flex w-full max-w-md items-center justify-between rounded-2xl bg-card p-4 text-left shadow-sm transition-transform active:scale-[0.98] disabled:cursor-default disabled:active:scale-100"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-lg">
            🧾
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Solo Tracker</p>
            <p className="text-[11px] text-muted-foreground">
              {personalStats.count === 0
                ? "Track private spending"
                : `${currencySymbol}${personalStats.week.toFixed(0)} this week · ${personalStats.count} entries`}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-primary">Open →</span>
      </button>

      {/* Today's Group Expenses */}
      <div className="w-full max-w-md">
        <h2 className="mb-3 flex items-center justify-between text-sm font-semibold text-muted-foreground">
          <span>Today's Group Expenses</span>
          <span className="text-xs font-normal">
            {todayExpenses.length} {todayExpenses.length === 1 ? "entry" : "entries"}
          </span>
        </h2>
        <AnimatePresence>
          {!todayExpenses.length ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-6 shadow-sm">
              <span className="text-3xl">🎯</span>
              <p className="text-sm font-medium text-muted-foreground">No expenses yet today!</p>
              <p className="text-xs text-muted-foreground/60">Keep it that way to win 👑</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todayExpenses.map((expense, i) => {
                const who = memberById.get(expense.user_id);
                const isMine = expense.user_id === user?.id;
                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-xl">
                        {getCategoryEmoji(expense.category)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold capitalize text-card-foreground truncate">
                          {CATEGORIES.find((c) => c.value === expense.category)?.label || expense.category}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="bg-secondary text-[10px]">
                              {who?.avatar || "🐷"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">
                            {isMine ? "You" : who?.name || "Member"}
                          </span>
                          <span>·</span>
                          <span className="shrink-0">
                            {new Date(expense.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 pl-2 text-lg font-bold tabular-nums text-danger">
                      -{currencySymbol}{convert(Number(expense.amount), expense.currency).toFixed(2)}
                    </span>
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
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
        aria-label="Add expense"
      >
        <Plus className="h-7 w-7" />
      </motion.button>

      <AddExpenseModal
        open={showModal}
        onOpenChange={setShowModal}
        groupId={groupId}
        userCurrency={profile?.preferred_currency || "USD"}
      />
    </div>
  );
};

export default Dashboard;
