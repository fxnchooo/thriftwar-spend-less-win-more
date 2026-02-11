import { useNotifications, useMarkRead } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { useState } from "react";

const NotificationsPanel = () => {
  const { data: notifications } = useNotifications();
  const markRead = useMarkRead();
  const [open, setOpen] = useState(false);
  const unread = notifications?.filter((n) => !n.read) || [];

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-4 top-4 z-50 flex items-center gap-1 rounded-full bg-card p-2 shadow-md"
      >
        <Bell className="h-5 w-5 text-foreground" />
        {unread.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-bold text-danger-foreground">
            {unread.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed right-4 top-14 z-50 w-80 rounded-2xl bg-card p-4 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-foreground">Notifications</h3>
              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            {!notifications?.length ? (
              <p className="text-sm text-muted-foreground">No notifications yet 🔔</p>
            ) : (
              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                {notifications.slice(0, 10).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => !n.read && markRead.mutate(n.id)}
                    className={`rounded-xl p-3 text-left text-sm transition-colors ${
                      n.read ? "bg-secondary/50" : "bg-primary/10"
                    }`}
                  >
                    <p className="font-medium text-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationsPanel;
