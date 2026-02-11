import { motion } from "framer-motion";
import { useGroupMembers } from "@/hooks/useGroups";
import { useGroupExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { useConvertAmount, getCurrencySymbol } from "@/hooks/useCurrency";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { startOfWeek, isAfter } from "date-fns";

interface LeaderboardProps {
  groupId: string | null;
}

const getRankIndicator = (index: number, total: number) => {
  if (index === 0) return "👑";
  if (index === total - 1 && total > 1) return "🤡";
  return `#${index + 1}`;
};

const Leaderboard = ({ groupId }: LeaderboardProps) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: members } = useGroupMembers(groupId ?? undefined);
  const { data: expenses } = useGroupExpenses(groupId ?? undefined);
  const convert = useConvertAmount();
  const symbol = getCurrencySymbol(profile?.preferred_currency || "USD");

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const rankings = (members || [])
    .map((m) => {
      const memberExpenses = (expenses || []).filter(
        (e) => e.user_id === m.user_id && isAfter(new Date(e.created_at), weekStart)
      );
      const total = memberExpenses.reduce((sum, e) => sum + convert(Number(e.amount), e.currency), 0);
      return {
        userId: m.user_id,
        name: m.profiles.display_name,
        avatar: m.profiles.avatar_text,
        totalSpent: total,
        isMe: m.user_id === user?.id,
      };
    })
    .sort((a, b) => a.totalSpent - b.totalSpent);

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-8">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-foreground">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Lowest spend wins! 🏆 (this week)</p>
      </div>

      {!rankings.length ? (
        <p className="py-8 text-center text-muted-foreground">No group members yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rankings.map((u, index) => {
            const isWinner = index === 0;
            const isLoser = index === rankings.length - 1 && rankings.length > 1;
            return (
              <motion.div
                key={u.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 rounded-2xl p-4 shadow-sm ${
                  isWinner ? "bg-primary/10 ring-2 ring-primary/30" : isLoser ? "bg-danger/10 ring-2 ring-danger/30" : "bg-card"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center text-xl font-bold">
                  {getRankIndicator(index, rankings.length)}
                </span>
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={`text-lg font-bold ${isWinner ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    {u.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {u.name} {u.isMe && <span className="text-xs text-muted-foreground">(You)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isWinner ? "Thrift King 👑" : isLoser ? "Shame! 🤡" : "Holding steady"}
                  </p>
                </div>
                <span className={`text-xl font-black ${isLoser ? "text-danger" : "text-foreground"}`}>
                  {symbol}{u.totalSpent.toFixed(0)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
