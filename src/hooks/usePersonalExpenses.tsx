import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export type PaymentMethod = "card" | "cash" | "transfer" | "other";

export interface PersonalExpense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string; // ISO date string (yyyy-mm-dd)
  notes?: string;
  payment_method?: PaymentMethod;
  created_at: string;
}

const storageKey = (userId: string) => `thriftwar:personal_expenses:${userId}`;

const read = (userId: string): PersonalExpense[] => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const write = (userId: string, list: PersonalExpense[]) => {
  localStorage.setItem(storageKey(userId), JSON.stringify(list));
};

export const usePersonalExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    setExpenses(read(user.id));
    setLoaded(true);
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey(user.id)) setExpenses(read(user.id));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [user]);

  const addExpense = useCallback(
    (data: Omit<PersonalExpense, "id" | "created_at">) => {
      if (!user) return;
      const newExpense: PersonalExpense = {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      const next = [newExpense, ...expenses];
      setExpenses(next);
      write(user.id, next);
      return newExpense;
    },
    [expenses, user]
  );

  const updateExpense = useCallback(
    (id: string, patch: Partial<PersonalExpense>) => {
      if (!user) return;
      const next = expenses.map((e) => (e.id === id ? { ...e, ...patch } : e));
      setExpenses(next);
      write(user.id, next);
    },
    [expenses, user]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      if (!user) return;
      const next = expenses.filter((e) => e.id !== id);
      setExpenses(next);
      write(user.id, next);
    },
    [expenses, user]
  );

  return { expenses, addExpense, updateExpense, deleteExpense, loaded };
};
