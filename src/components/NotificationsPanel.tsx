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
        className="fixed left-4 top-3 z-50 flex items-center gap-1 rounded-full bg-card p-2.5 shadow-md transition-colors hover:bg-secondary"
      >
        <Bell className="h-5 w-5 text-foreground" />
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-danger-foreground">
            {unread.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-foreground/10 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed left-4 right-4 top-14 z-50 mx-auto max-w-sm rounded-2xl bg-card p-4 shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-foreground">Notifications</h3>
                <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-secondary">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              {!notifications?.length ? (
                <div className="flex flex-col items-center gap-2 py-6">
                  <span className="text-2xl">🔔</span>
                  <p className="text-sm text-muted-foreground">All caught up!</p>
                </div>
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
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationsPanel;
