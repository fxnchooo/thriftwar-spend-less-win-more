import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Leaderboard from "@/pages/Leaderboard";
import Consequences from "@/pages/Consequences";
import BottomNav, { type Tab } from "@/components/BottomNav";
import NotificationsPanel from "@/components/NotificationsPanel";
import GroupSetup from "@/components/GroupSetup";
import { useMyGroups } from "@/hooks/useGroups";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
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

  if (!groupsLoading && (!groups || groups.length === 0)) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-background">
        <GroupSetup />
      </div>
    );
  }

  const activeGroup = groups?.find((g) => g.id === activeGroupId);

  const renderPage = () => {
    switch (activeTab) {
      case "home": return <Dashboard groupId={activeGroupId} />;
      case "leaderboard": return <Leaderboard groupId={activeGroupId} />;
      case "consequences": return <Consequences group={activeGroup} />;
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <NotificationsPanel />
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
