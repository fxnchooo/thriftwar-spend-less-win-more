import { motion } from "framer-motion";

interface BudgetRingProps {
  spent: number;
  budget: number;
  currencySymbol: string;
}

const BudgetRing = ({ spent, budget, currencySymbol }: BudgetRingProps) => {
  const ratio = Math.min(spent / budget, 1.5);
  const isOver = spent > budget;
  const percentage = Math.min(ratio * 100, 100);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const ringColor = isOver
    ? "hsl(var(--danger))"
    : ratio > 0.75
    ? "hsl(40, 90%, 55%)"
    : "hsl(var(--primary))";

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative h-48 w-48">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
          {/* Background ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Progress ring */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {(() => {
            const spentLabel = `${currencySymbol}${spent.toFixed(2)}`;
            const sizeClass =
              spentLabel.length > 11
                ? "text-base"
                : spentLabel.length > 9
                ? "text-lg"
                : spentLabel.length > 7
                ? "text-xl"
                : spentLabel.length > 5
                ? "text-2xl"
                : "text-3xl";
            return (
              <motion.span
                key={spent}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`block w-full truncate font-black tabular-nums leading-tight ${
                  isOver ? "text-danger" : "text-foreground"
                } ${sizeClass}`}
              >
                {spentLabel}
              </motion.span>
            );
          })()}
          <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            of {currencySymbol}{budget}/day
          </span>
        </div>
      </div>
      {/* Status label */}
      <div className={`mt-1 rounded-full px-3 py-1 text-xs font-semibold ${
        isOver
          ? "bg-danger/15 text-danger"
          : ratio > 0.75
          ? "bg-[hsl(40,90%,55%)]/15 text-[hsl(40,90%,35%)]"
          : "bg-primary/15 text-primary"
      }`}>
        {isOver
          ? `Over by ${currencySymbol}${(spent - budget).toFixed(2)} 😬`
          : `${currencySymbol}${(budget - spent).toFixed(2)} remaining ✨`}
      </div>
    </div>
  );
};

export default BudgetRing;
