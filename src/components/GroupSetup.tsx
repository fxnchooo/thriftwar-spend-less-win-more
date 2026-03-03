import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateGroup } from "@/hooks/useGroups";
import { toast } from "sonner";

interface GroupSetupProps {
  onCreated?: () => void;
}

const GroupSetup = ({ onCreated }: GroupSetupProps) => {
  const [name, setName] = useState("");
  const createGroup = useCreateGroup();

  const handleCreate = () => {
    if (!name.trim()) return;
    createGroup.mutate(name, {
      onSuccess: () => {
        toast.success("Group created! 🎉");
        onCreated?.();
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full flex-col gap-4"
    >
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground">Start a ThriftWar ⚔️</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Create a group to compete with friends on who spends the least!
        </p>
      </div>
      <Input
        placeholder="Group name (e.g. Roommates)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-12 rounded-2xl"
        autoFocus
      />
      <Button
        onClick={handleCreate}
        disabled={!name.trim() || createGroup.isPending}
        className="h-12 rounded-2xl text-base font-bold"
      >
        {createGroup.isPending ? "Creating..." : "Create Group 🚀"}
      </Button>
    </motion.div>
  );
};

export default GroupSetup;
