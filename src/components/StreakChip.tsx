import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";

interface StreakChipProps {
  name?: string;
}

const StreakChip = ({ name }: StreakChipProps) => {
  const { current, hasToday } = useStreak();

  if (current === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-muted-foreground">
        ✨ {name || "Player"} · start your streak
      </span>
    );
  }

  return (
    <motion.span
      key={current}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ${
        hasToday
          ? "bg-primary/15 text-primary"
          : "bg-card text-foreground ring-1 ring-primary/30"
      }`}
    >
      <Flame className="h-3.5 w-3.5" />
      {current}-day streak
      {!hasToday && <span className="text-[10px] font-medium opacity-70">· log today</span>}
    </motion.span>
  );
};

export default StreakChip;
