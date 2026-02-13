import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Mascot from "@/components/Mascot";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCheckInbox, setShowCheckInbox] = useState(false);
  const { user, loading: authLoading, signIn, signUp } = useAuth();

  // Redirect immediately if already logged in
  if (!authLoading && user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
      // On success, the auth state change will trigger the Navigate above
    } else {
      const { error } = await signUp(email, password, displayName || "Player");
      if (error) {
        toast.error(error.message);
      } else {
        setShowCheckInbox(true);
      }
    }
    setLoading(false);
  };

  if (showCheckInbox) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <Mascot state="prompting" message="Check your inbox! 📧" />
          <h2 className="mt-6 text-2xl font-bold text-foreground">Confirm your email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation link to <span className="font-semibold">{email}</span>. Click it to activate your account.
          </p>
          <Button
            variant="outline"
            className="mt-6 h-12 w-full rounded-2xl"
            onClick={() => {
              setShowCheckInbox(false);
              setIsLogin(true);
            }}
          >
            ← Back to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <Mascot state="happy" message={isLogin ? "Welcome back! 🎉" : "Join the thrift war! ⚔️"} />
          <h1 className="mt-4 text-3xl font-extrabold text-foreground">ThriftWar</h1>
          <p className="text-sm text-muted-foreground">Spend less. Win more. 🐷</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <Input
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-12 rounded-2xl"
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 rounded-2xl"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-12 rounded-2xl"
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-12 rounded-2xl bg-primary text-lg font-bold text-primary-foreground"
          >
            {loading ? "Loading..." : isLogin ? "Sign In 🚀" : "Sign Up ✨"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-primary hover:underline"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
