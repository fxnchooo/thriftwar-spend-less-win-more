import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useInviteMember,
  useMyMembership,
  useGroupMembers,
} from "@/hooks/useGroups";
import type { Group } from "@/hooks/useGroups";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { getCurrencySymbol, CURRENCIES } from "@/hooks/useCurrency";
import { toast } from "sonner";
import {
  Users,
  Crown,
  Mail,
  UserCircle,
  DollarSign,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface GroupSettingsProps {
  group: Group;
}

const AVATARS = ["🐷", "🐱", "🐶", "🦊", "🐼", "🐨", "🐸", "🦄", "🐙", "🦋", "🐝", "🎯"];

const GroupSettings = ({ group }: GroupSettingsProps) => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: members } = useGroupMembers(group.id);
  
  const inviteMember = useInviteMember();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const currencySymbol = getCurrencySymbol(profile?.preferred_currency || "USD");

  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name);
  }, [profile]);

  const handleSaveName = () => {
    if (!displayName.trim()) return;
    updateProfile.mutate(
      { display_name: displayName.trim() },
      { onSuccess: () => toast.success("Name updated! ✨") }
    );
  };

  const handleAvatarSelect = (avatar: string) => {
    updateProfile.mutate(
      { avatar_text: avatar },
      { onSuccess: () => toast.success("Avatar updated!") }
    );
    setShowAvatarPicker(false);
  };

  const handleCurrencySelect = (code: string) => {
    updateProfile.mutate(
      { preferred_currency: code },
      { onSuccess: () => toast.success(`Currency → ${code} ${getCurrencySymbol(code)}`) }
    );
    setShowCurrencyPicker(false);
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
      className="flex flex-col gap-4 px-4 pb-28 pt-6"
    >
      {/* Profile Section */}
      <section className="rounded-2xl bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <UserCircle className="h-4 w-4" />
          My Profile
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-3xl transition-transform hover:scale-105 active:scale-95"
          >
            {profile?.avatar_text || "🐷"}
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              ✏️
            </span>
          </button>
          <div className="flex flex-1 flex-col gap-1.5">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={handleSaveName}
              placeholder="Your name"
              className="h-10 rounded-xl border-none bg-secondary text-sm font-semibold"
            />
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <AnimatePresence>
          {showAvatarPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="grid grid-cols-6 gap-2 rounded-xl bg-secondary p-3">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => handleAvatarSelect(a)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all hover:scale-110 ${
                      profile?.avatar_text === a ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-card"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Currency selector */}
        <button
          onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
          className="mt-3 flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm transition-colors hover:bg-secondary/80"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Currency</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="font-semibold text-foreground">
              {currencySymbol} {profile?.preferred_currency || "USD"}
            </span>
            <ChevronRight className={`h-4 w-4 transition-transform ${showCurrencyPicker ? "rotate-90" : ""}`} />
          </div>
        </button>

        <AnimatePresence>
          {showCurrencyPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-secondary p-3 max-h-48 overflow-y-auto">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCurrencySelect(c.code)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      profile?.preferred_currency === c.code
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-card"
                    }`}
                  >
                    <span className="text-sm font-bold">{c.symbol}</span>
                    {c.code}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Members Section */}
      <section className="rounded-2xl bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Users className="h-4 w-4" />
            Members
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-foreground">
              {members?.length || 0}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {members?.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                m.user_id === user?.id ? "bg-primary/8" : "bg-secondary/50"
              }`}
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-secondary text-sm">
                  {m.profiles?.avatar_text || "🐷"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {m.profiles?.display_name || "Unknown"}
                  {m.user_id === user?.id && (
                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">(you)</span>
                  )}
                </p>
              </div>
              {m.role === "admin" && (
                <span className="flex items-center gap-0.5 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                  <Crown className="h-3 w-3" /> Admin
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Invite */}
        <div className="mt-4">
          <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Mail className="h-3 w-3" /> Invite by Email
          </label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-xl text-sm"
            />
            <Button
              onClick={handleInvite}
              disabled={inviteMember.isPending || !email.trim()}
              size="sm"
              className="h-10 rounded-xl px-4 font-semibold"
            >
              {inviteMember.isPending ? "..." : "Invite"}
            </Button>
          </div>
        </div>
      </section>

      {/* Sign Out */}
      <button
        onClick={signOut}
        className="flex items-center justify-center gap-2 rounded-2xl bg-card p-4 text-sm font-semibold text-danger shadow-sm transition-colors hover:bg-danger/10"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </motion.div>
  );
};

export default GroupSettings;
