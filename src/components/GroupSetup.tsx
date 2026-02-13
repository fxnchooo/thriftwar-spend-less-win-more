import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateGroup } from "@/hooks/useGroups";
import Mascot from "@/components/Mascot";
import { toast } from "sonner";

const GroupSetup = () => {
  const [name, setName] = useState("");
  const createGroup = useCreateGroup();

  const handleCreate = () => {
    if (!name.trim()) return;
    createGroup.mutate(name, {
      onSuccess: () => toast.success("Group created! 🎉"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <Mascot state="happy" message="Create your first group! 🎉" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h2 className="text-center text-xl font-bold text-foreground">Start a ThriftWar</h2>
        <p className="text-center text-sm text-muted-foreground">
          Create a group to compete with friends on who spends the least!
        </p>
        <Input
          placeholder="Group name (e.g. Roommates)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-2xl"
        />
        <Button
          onClick={handleCreate}
          disabled={!name.trim() || createGroup.isPending}
          className="h-12 rounded-2xl bg-primary text-lg font-bold text-primary-foreground"
        >
          {createGroup.isPending ? "Creating..." : "Create Group 🚀"}
        </Button>
      </motion.div>
    </div>
  );
};

export default GroupSetup;
