import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Group {
  id: string;
  name: string;
  created_by: string;
  daily_bet: string;
  weekly_bet: string;
  daily_limit: number;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export const useMyGroups = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my_groups", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: memberships, error: mErr } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user!.id);
      if (mErr) throw mErr;
      if (!memberships?.length) return [];
      const groupIds = memberships.map((m) => m.group_id);
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);
      if (error) throw error;
      return data as Group[];
    },
  });
};

export const useGroupMembers = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ["group_members", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_members")
        .select("*, profiles:user_id(id, display_name, avatar_text, preferred_currency)")
        .eq("group_id", groupId!);
      if (error) throw error;
      return data as (GroupMember & { profiles: { id: string; display_name: string; avatar_text: string; preferred_currency: string } })[];
    },
  });
};

export const useCreateGroup = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("groups")
        .insert({ name, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      // Admin membership is auto-created by the on_group_created trigger
      return data as Group;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my_groups"] }),
  });
};

export const useInviteMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, email }: { groupId: string; email: string }) => {
      const { data, error } = await supabase.rpc("add_member_by_email", {
        target_email: email,
        target_group_id: groupId,
      });
      if (error) throw error;
      if (data && !(data as any).success) throw new Error((data as any).message);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group_members"] }),
  });
};

export const useUpdateGroupBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, dailyLimit }: { groupId: string; dailyLimit: number }) => {
      const { error } = await supabase
        .from("groups")
        .update({ daily_limit: dailyLimit } as any)
        .eq("id", groupId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my_groups"] }),
  });
};
