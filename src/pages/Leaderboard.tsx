import { motion } from "framer-motion";
import { MOCK_LEADERBOARD } from "@/types/expense";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const sorted = [...MOCK_LEADERBOARD].sort((a, b) => a.totalSpent - b.totalSpent);

const getRankIndicator = (index: number, total: number) => {
  if (index === 0) return "👑";
  if (index === total - 1) return "🤡";
  return `#${index + 1}`;
};

const Leaderboard = () => {
  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-8">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-foreground">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Lowest spend wins! 🏆</p>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map((user, index) => {
          const isWinner = index === 0;
          const isLoser = index === sorted.length - 1;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 rounded-2xl p-4 shadow-sm ${
                isWinner
                  ? "bg-primary/10 ring-2 ring-primary/30"
                  : isLoser
                  ? "bg-danger/10 ring-2 ring-danger/30"
                  : "bg-card"
              }`}
            >
              {/* Rank */}
              <span className="flex h-10 w-10 items-center justify-center text-xl font-bold">
                {getRankIndicator(index, sorted.length)}
              </span>

              {/* Avatar */}
              <Avatar className="h-12 w-12">
                <AvatarFallback className={`text-lg font-bold ${
                  isWinner ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                  {user.avatar}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {user.name} {user.isMe && <span className="text-xs text-muted-foreground">(You)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isWinner ? "Thrift King 👑" : isLoser ? "Shame! 🤡" : "Holding steady"}
                </p>
              </div>

              {/* Amount */}
              <span className={`text-xl font-black ${isLoser ? "text-danger" : "text-foreground"}`}>
                ${user.totalSpent}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
