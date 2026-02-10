import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Dashboard from "@/pages/Dashboard";
import Leaderboard from "@/pages/Leaderboard";
import Consequences from "@/pages/Consequences";
import BottomNav, { type Tab } from "@/components/BottomNav";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const renderPage = () => {
    switch (activeTab) {
      case "home": return <Dashboard />;
      case "leaderboard": return <Leaderboard />;
      case "consequences": return <Consequences />;
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
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
