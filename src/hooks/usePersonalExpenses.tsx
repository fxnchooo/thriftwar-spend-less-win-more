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
const EVENT_NAME = "thriftwar:personal_expenses_changed";

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
  // Notify other hook instances in the same tab (storage event only fires across tabs)
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { userId } }));
};

export const usePersonalExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    setExpenses(read(user.id));
    setLoaded(true);

    const refresh = () => setExpenses(read(user.id));
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey(user.id)) refresh();
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.userId === user.id) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(EVENT_NAME, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVENT_NAME, onCustom);
    };
  }, [user]);

  const addExpense = useCallback(
    (data: Omit<PersonalExpense, "id" | "created_at">) => {
      if (!user) return;
      const newExpense: PersonalExpense = {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      const next = [newExpense, ...read(user.id)];
      setExpenses(next);
      write(user.id, next);
      return newExpense;
    },
    [user]
  );

  const updateExpense = useCallback(
    (id: string, patch: Partial<PersonalExpense>) => {
      if (!user) return;
      const next = read(user.id).map((e) => (e.id === id ? { ...e, ...patch } : e));
      setExpenses(next);
      write(user.id, next);
    },
    [user]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      if (!user) return;
      const next = read(user.id).filter((e) => e.id !== id);
      setExpenses(next);
      write(user.id, next);
    },
    [user]
  );

  return { expenses, addExpense, updateExpense, deleteExpense, loaded };
};
