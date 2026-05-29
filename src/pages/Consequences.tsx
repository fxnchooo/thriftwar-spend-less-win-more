import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { startOfWeek, endOfWeek, isAfter, isBefore, format } from "date-fns";
import { PUNISHMENTS } from "@/types/expense";
import Mascot from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGroupMembers } from "@/hooks/useGroups";
import { useGroupExpenses } from "@/hooks/useExpenses";
import { useConvertAmount, getCurrencySymbol } from "@/hooks/useCurrency";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import type { Group } from "@/hooks/useGroups";

interface ConsequencesProps {
  group?: Group;
}

const Consequences = ({ group }: ConsequencesProps) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: members } = useGroupMembers(group?.id);
  const { data: expenses } = useGroupExpenses(group?.id);
  const convert = useConvertAmount();
  const symbol = getCurrencySymbol(profile?.preferred_currency || "USD");

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const spinCount = useRef(0);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const rankings = useMemo(() => {
    return (members || [])
      .map((m) => {
        const total = (expenses || [])
          .filter((e) => e.user_id === m.user_id && isAfter(new Date(e.created_at), weekStart))
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
  }, [members, expenses, convert, user?.id, weekStart]);

  const winner = rankings[0];
  const loser = rankings.length > 1 ? rankings[rankings.length - 1] : null;

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    // Fisher-Yates-style fresh randomness each spin (avoid index-cycling feel)
    const randomIndex = Math.floor(Math.random() * PUNISHMENTS.length);
    const segmentAngle = 360 / PUNISHMENTS.length;
    const extraSpins = 6 + Math.floor(Math.random() * 4);
    const jitter = Math.random() * segmentAngle * 0.6 - segmentAngle * 0.3;
    const targetRotation = extraSpins * 360 + randomIndex * segmentAngle + jitter;

    spinCount.current += 1;
    setRotation((prev) => prev + targetRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(`${PUNISHMENTS[randomIndex].emoji} ${PUNISHMENTS[randomIndex].text}`);
    }, 3000);
  };

  if (!group) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 pb-28 pt-16 text-center">
        <span className="text-5xl">🎡</span>
        <h2 className="text-xl font-bold text-foreground">No group, no wheel</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          The punishment wheel is a group thing. Join or create a group to crown a winner and shame the spender.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 px-4 pb-24 pt-8">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-foreground">Weekly Showdown</h1>
        <p className="text-xs text-muted-foreground">
          {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")} · lowest spend wins 🏆
        </p>
      </div>

      {/* Winner / Loser summary */}
      <div className="grid w-full max-w-xs grid-cols-2 gap-2">
        <div className="rounded-2xl bg-primary/10 p-3 text-center ring-1 ring-primary/20">
          <p className="text-xs font-semibold text-muted-foreground">👑 Winner</p>
          {winner ? (
            <>
              <Avatar className="mx-auto my-1.5 h-9 w-9">
                <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                  {winner.avatar}
                </AvatarFallback>
              </Avatar>
              <p className="truncate text-sm font-bold text-foreground">
                {winner.name}{winner.isMe && " (You)"}
              </p>
              <p className="text-xs text-muted-foreground">{symbol}{winner.totalSpent.toFixed(0)}</p>
            </>
          ) : (
            <p className="py-3 text-xs text-muted-foreground">No data yet</p>
          )}
        </div>
        <div className="rounded-2xl bg-danger/10 p-3 text-center ring-1 ring-danger/20">
          <p className="text-xs font-semibold text-muted-foreground">🤡 Pays up</p>
          {loser ? (
            <>
              <Avatar className="mx-auto my-1.5 h-9 w-9">
                <AvatarFallback className="bg-secondary text-sm font-bold text-secondary-foreground">
                  {loser.avatar}
                </AvatarFallback>
              </Avatar>
              <p className="truncate text-sm font-bold text-foreground">
                {loser.name}{loser.isMe && " (You)"}
              </p>
              <p className="text-xs text-danger">{symbol}{loser.totalSpent.toFixed(0)}</p>
            </>
          ) : (
            <p className="py-3 text-xs text-muted-foreground">Need 2+ players</p>
          )}
        </div>
      </div>

      {/* Weekly Bet */}
      <div className="w-full max-w-xs rounded-2xl bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold text-muted-foreground">This week's bet</p>
        <p className="text-sm font-bold text-foreground">{group.weekly_bet}</p>
      </div>

      {/* Wheel */}
      <div className="relative flex items-center justify-center pt-2">
        <div className="absolute -top-1 z-10 text-2xl">▼</div>
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: [0.17, 0.67, 0.12, 0.99] }}
          className="flex h-64 w-64 items-center justify-center rounded-full border-4 border-primary/20 bg-card shadow-xl"
        >
          {PUNISHMENTS.map((p, i) => {
            const angle = (i * 360) / PUNISHMENTS.length;
            return (
              <div key={p.id} className="absolute text-xl" style={{ transform: `rotate(${angle}deg) translateY(-100px)` }}>
                {p.emoji}
              </div>
            );
          })}
          <span className="text-4xl">🎰</span>
        </motion.div>
      </div>

      <Button
        onClick={handleSpin}
        disabled={spinning || !loser}
        className="h-14 w-full max-w-xs rounded-2xl bg-primary text-lg font-bold text-primary-foreground hover:bg-primary/90"
      >
        {spinning ? "Spinning... 🌀" : loser ? `Spin for ${loser.isMe ? "you" : loser.name} 🎡` : "Add players to spin"}
      </Button>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 rounded-3xl bg-card p-5 shadow-lg">
          {loser && (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {loser.isMe ? "Your punishment" : `${loser.name}'s punishment`}
            </p>
          )}
          <p className="text-center text-lg font-bold text-foreground">{result}</p>
          <Mascot state="happy" message="Justice is served! 😈" />
        </motion.div>
      )}

      {!result && !spinning && <Mascot state="happy" message="Who's paying this week? 👀" />}
    </div>
  );
};

export default Consequences;
