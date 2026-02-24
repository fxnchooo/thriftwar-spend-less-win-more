import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateGroupBudget, useInviteMember } from "@/hooks/useGroups";
import type { Group } from "@/hooks/useGroups";
import { toast } from "sonner";

interface GroupSettingsProps {
  group: Group;
}

const GroupSettings = ({ group }: GroupSettingsProps) => {
  const [budget, setBudget] = useState<number>(group.daily_limit ?? 50);
  const [email, setEmail] = useState("");
  const updateBudget = useUpdateGroupBudget();
  const inviteMember = useInviteMember();

  const handleBudgetSave = () => {
    updateBudget.mutate(
      { groupId: group.id, dailyLimit: budget },
      {
        onSuccess: () => toast.success("Budget updated! 💰"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleInvite = () => {
    if (!email.trim()) return;
    inviteMember.mutate(
      { groupId: group.id, email: email.trim() },
      {
        onSuccess: () => {
          toast.success("Member added! 🎉");
          setEmail("");
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 px-4 pb-24 pt-8"
    >
      <h1 className="text-2xl font-extrabold text-foreground">Group Settings ⚙️</h1>

      {/* Budget */}
      <div className="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-sm">
        <label className="text-sm font-semibold text-muted-foreground">Daily Budget Limit</label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="h-12 rounded-2xl"
            min={1}
          />
          <Button
            onClick={handleBudgetSave}
            disabled={updateBudget.isPending}
            className="h-12 rounded-2xl px-6 font-bold"
          >
            {updateBudget.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Invite */}
      <div className="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-sm">
        <label className="text-sm font-semibold text-muted-foreground">Add Member by Email</label>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="friend@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-2xl"
          />
          <Button
            onClick={handleInvite}
            disabled={inviteMember.isPending || !email.trim()}
            className="h-12 rounded-2xl px-6 font-bold"
          >
            {inviteMember.isPending ? "Adding..." : "Invite"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupSettings;
