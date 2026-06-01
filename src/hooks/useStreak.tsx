import { useMemo } from "react";
import { usePersonalExpenses } from "./usePersonalExpenses";
import { parseISO, differenceInCalendarDays, format } from "date-fns";

/**
 * Streak: number of consecutive calendar days (ending today or yesterday)
 * with at least one personal expense entry (including $0 no-spend days).
 */
export const useStreak = () => {
  const { expenses } = usePersonalExpenses();

  return useMemo(() => {
    if (!expenses.length) {
      return { current: 0, longest: 0, hasToday: false };
    }

    // Unique day strings (yyyy-MM-dd)
    const days = Array.from(
      new Set(expenses.map((e) => format(parseISO(e.date), "yyyy-MM-dd")))
    )
      .map((d) => parseISO(d))
      .sort((a, b) => b.getTime() - a.getTime()); // newest first

    const today = new Date();
    const hasToday = differenceInCalendarDays(today, days[0]) === 0;

    // Current streak ending today or yesterday
    let current = 0;
    const startGap = differenceInCalendarDays(today, days[0]);
    if (startGap <= 1) {
      current = 1;
      for (let i = 1; i < days.length; i++) {
        if (differenceInCalendarDays(days[i - 1], days[i]) === 1) current++;
        else break;
      }
    }

    // Longest streak across the whole history
    let longest = 1;
    let run = 1;
    for (let i = 1; i < days.length; i++) {
      if (differenceInCalendarDays(days[i - 1], days[i]) === 1) {
        run++;
        longest = Math.max(longest, run);
      } else {
        run = 1;
      }
    }

    return { current, longest, hasToday };
  }, [expenses]);
};
