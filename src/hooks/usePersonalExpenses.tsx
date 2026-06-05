import { useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type PaymentMethod = "card" | "cash" | "transfer" | "other";

export interface PersonalExpense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string; // yyyy-mm-dd
  notes?: string;
  payment_method?: PaymentMethod;
  created_at: string;
}

const LEGACY_KEY = (uid: string) => `thriftwar:personal_expenses:${uid}`;
const MIGRATED_KEY = (uid: string) => `thriftwar:personal_expenses_migrated:${uid}`;

const rowToExpense = (row: any): PersonalExpense => ({
  id: row.id,
  amount: Number(row.amount),
  currency: row.currency,
  description: row.description ?? "",
  category: row.category,
  date: row.date,
  notes: row.notes ?? undefined,
  payment_method: (row.payment_method ?? "card") as PaymentMethod,
  created_at: row.created_at,
});

export const usePersonalExpenses = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;
  const queryKey = ["personal_expenses", userId];

  // One-time migration of localStorage rows into the DB
  useEffect(() => {
    if (!userId) return;
    if (localStorage.getItem(MIGRATED_KEY(userId))) return;
    const raw = localStorage.getItem(LEGACY_KEY(userId));
    if (!raw) {
      localStorage.setItem(MIGRATED_KEY(userId), "1");
      return;
    }
    try {
      const list = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) {
        localStorage.setItem(MIGRATED_KEY(userId), "1");
        return;
      }
      const rows = list.map((e: any) => ({
        user_id: userId,
        amount: Number(e.amount) || 0,
        currency: e.currency || "USD",
        description: e.description || "",
        category: e.category || "other",
        date: e.date || new Date().toISOString().slice(0, 10),
        notes: e.notes || null,
        payment_method: e.payment_method || "card",
      }));
      supabase.from("personal_expenses").insert(rows).then(({ error }) => {
        if (!error) {
          localStorage.removeItem(LEGACY_KEY(userId));
          localStorage.setItem(MIGRATED_KEY(userId), "1");
          qc.invalidateQueries({ queryKey });
        }
      });
    } catch {
      localStorage.setItem(MIGRATED_KEY(userId), "1");
    }
  }, [userId, qc]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`personal-expenses-${userId}`)
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "personal_expenses", filter: `user_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);

  const query = useQuery({
    queryKey,
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personal_expenses")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(rowToExpense);
    },
  });

  const addExpense = useCallback(
    async (data: Omit<PersonalExpense, "id" | "created_at">) => {
      if (!userId) return;
      const { error } = await supabase.from("personal_expenses").insert({
        user_id: userId,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        category: data.category,
        date: data.date,
        notes: data.notes ?? null,
        payment_method: data.payment_method ?? "card",
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey });
    },
    [userId, qc]
  );

  const updateExpense = useCallback(
    async (id: string, patch: Partial<PersonalExpense>) => {
      if (!userId) return;
      const { error } = await supabase
        .from("personal_expenses")
        .update({
          ...(patch.amount !== undefined && { amount: patch.amount }),
          ...(patch.currency !== undefined && { currency: patch.currency }),
          ...(patch.description !== undefined && { description: patch.description }),
          ...(patch.category !== undefined && { category: patch.category }),
          ...(patch.date !== undefined && { date: patch.date }),
          ...(patch.notes !== undefined && { notes: patch.notes ?? null }),
          ...(patch.payment_method !== undefined && { payment_method: patch.payment_method }),
        })
        .eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey });
    },
    [userId, qc]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!userId) return;
      const { error } = await supabase.from("personal_expenses").delete().eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey });
    },
    [userId, qc]
  );

  return {
    expenses: query.data ?? [],
    addExpense,
    updateExpense,
    deleteExpense,
    loaded: !query.isLoading,
  };
};
