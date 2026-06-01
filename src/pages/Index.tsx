import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Personal from "@/pages/Personal";
import Leaderboard from "@/pages/Leaderboard";
import Consequences from "@/pages/Consequences";
import GroupSettings from "@/components/GroupSettings";
import BottomNav, { type Tab } from "@/components/BottomNav";
import NotificationsPanel from "@/components/NotificationsPanel";
import GroupSetup from "@/components/GroupSetup";
import { useMyGroups } from "@/hooks/useGroups";
import { ChevronDown, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
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

  const hasGroups = (groups?.length ?? 0) > 0;
  const activeGroup = groups?.find((g) => g.id === activeGroupId);

  // Auto-redirect "group-only" tabs to Personal if user has no group yet
  const needsGroup = activeTab === "home" || activeTab === "leaderboard" || activeTab === "consequences" || activeTab === "settings";
  const showNoGroupHint = !groupsLoading && !hasGroups && needsGroup && activeTab !== "home";

  const renderPage = () => {
    if (activeTab === "personal") return <Personal />;

    if (!hasGroups) {
      // Home shows lobby; other group-only tabs show a friendly empty state
      if (activeTab === "home") return <Dashboard groupId={null} lobby onCreateGroup={() => setShowCreateGroup(true)} onGoSolo={() => setActiveTab("personal")} />;
      return (
        <div className="flex flex-col items-center gap-4 px-6 pb-28 pt-16 text-center">
          <span className="text-5xl">👥</span>
          <h2 className="text-xl font-bold text-foreground">This needs a group</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Create a group to unlock leaderboards, the punishment wheel, and shared budgets — or keep tracking solo.
          </p>
          <div className="flex w-full max-w-xs flex-col gap-2">
            <Button onClick={() => setShowCreateGroup(true)} className="h-11 rounded-2xl font-bold">
              <Users className="mr-1 h-4 w-4" /> Create a group
            </Button>
            <Button
              variant="secondary"
              onClick={() => setActiveTab("personal")}
              className="h-11 rounded-2xl font-semibold"
            >
              Use Solo Tracker
            </Button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "home":
        return <Dashboard groupId={activeGroupId} onGoSolo={() => setActiveTab("personal")} onOpenWheel={() => setActiveTab("consequences")} />;
      case "leaderboard":
        return <Leaderboard groupId={activeGroupId} />;
      case "consequences":
        return <Consequences group={activeGroup} />;
      case "settings":
        return activeGroup ? <GroupSettings group={activeGroup} /> : null;
    }
  };

  const showHeader = hasGroups && activeTab !== "personal";

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      {/* Top Bar */}
      {showHeader && (
        <header className="sticky top-0 z-40 flex items-center justify-between bg-background/90 px-4 pb-2 pt-3 backdrop-blur-md">
          {/* Group Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowGroupPicker(!showGroupPicker)}
              className="flex items-center gap-1.5 rounded-xl bg-card px-3 py-2 shadow-sm transition-colors hover:bg-secondary"
            >
              <span className="max-w-[140px] truncate text-sm font-bold text-foreground">
                {activeGroup?.name || "Select Group"}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                  showGroupPicker ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {showGroupPicker && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowGroupPicker(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute left-0 top-12 z-50 w-52 rounded-2xl bg-card p-2 shadow-xl"
                  >
                    {groups?.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setActiveGroupId(g.id);
                          setShowGroupPicker(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          g.id === activeGroupId
                            ? "bg-primary/15 text-primary"
                            : "text-foreground hover:bg-secondary"
                        }`}
                      >
                        <span className="text-base">⚔️</span>
                        <span className="truncate">{g.name}</span>
                      </button>
                    ))}
                    <div className="my-1 h-px bg-border" />
                    <button
                      onClick={() => {
                        setShowGroupPicker(false);
                        setShowCreateGroup(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <Plus className="h-4 w-4" />
                      New Group
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* App Title + Notifications */}
          <div className="flex items-center gap-1">
            <span className="mr-1 text-sm font-extrabold text-foreground">ThriftWar</span>
            <NotificationsPanel />
          </div>
        </header>
      )}

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateGroup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateGroup(false)}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-x-4 top-1/3 z-50 mx-auto max-w-sm rounded-3xl bg-card p-6 shadow-2xl"
            >
              <GroupSetup onCreated={() => setShowCreateGroup(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
      <BottomNav active={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
