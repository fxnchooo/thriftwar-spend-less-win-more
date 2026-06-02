import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export interface DbExpense {
  id: string;
  user_id: string;
  group_id: string;
  amount: number;
  currency: string;
  category: string;
  guilt_level: number;
  note: string | null;
  created_at: string;
}

export const useGroupExpenses = (groupId: string | undefined) => {
  const qc = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!groupId) return;
    const channel = supabase.channel(`expenses-${groupId}-${Math.random().toString(36).slice(2)}`);
    channel
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "expenses", filter: `group_id=eq.${groupId}` }, () => {
        qc.invalidateQueries({ queryKey: ["expenses", groupId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [groupId, qc]);

  return useQuery({
    queryKey: ["expenses", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("group_id", groupId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbExpense[];
    },
  });
};

export const useAddExpense = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (expense: {
      group_id: string;
      amount: number;
      currency: string;
      category: string;
      guilt_level: number;
      note?: string;
      status?: string;
      target_user_id?: string;
    }) => {
      const { target_user_id, ...rest } = expense;
      const { error } = await supabase.from("expenses").insert({
        ...rest,
        user_id: target_user_id ?? user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
};
