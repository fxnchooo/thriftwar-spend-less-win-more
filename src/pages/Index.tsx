import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Leaderboard from "@/pages/Leaderboard";
import Consequences from "@/pages/Consequences";
import GroupSettings from "@/components/GroupSettings";
import BottomNav, { type Tab } from "@/components/BottomNav";
import NotificationsPanel from "@/components/NotificationsPanel";
import GroupSetup from "@/components/GroupSetup";
import { useMyGroups } from "@/hooks/useGroups";
import { ChevronDown } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const { data: groups, isLoading: groupsLoading } = useMyGroups();

  useEffect(() => {
    if (groups?.length && !activeGroupId) {
      setActiveGroupId(groups[0].id);
    }
  }, [groups, activeGroupId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-4xl animate-pulse">🐷</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const hasNoGroups = !groupsLoading && (!groups || groups.length === 0);
  const activeGroup = groups?.find((g) => g.id === activeGroupId);
  const hasMultipleGroups = (groups?.length ?? 0) > 1;

  const renderPage = () => {
    if (hasNoGroups) return <Dashboard groupId={null} lobby />;
    switch (activeTab) {
      case "home": return <Dashboard groupId={activeGroupId} />;
      case "leaderboard": return <Leaderboard groupId={activeGroupId} />;
      case "consequences": return <Consequences group={activeGroup} />;
      case "settings": return activeGroup ? <GroupSettings group={activeGroup} /> : null;
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <NotificationsPanel />

      {/* Group Switcher */}
      {hasMultipleGroups && activeGroup && (
        <div className="relative flex justify-center pt-2">
          <button
            onClick={() => setShowGroupPicker(!showGroupPicker)}
            className="flex items-center gap-1 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            {activeGroup.name}
            <ChevronDown className={`h-3 w-3 transition-transform ${showGroupPicker ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showGroupPicker && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-10 z-50 w-48 rounded-xl bg-card p-2 shadow-xl"
              >
                {groups?.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setActiveGroupId(g.id);
                      setShowGroupPicker(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                      g.id === activeGroupId
                        ? "bg-primary/15 text-primary"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
      <BottomNav active={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
