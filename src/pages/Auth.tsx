import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Mascot from "@/components/Mascot";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showCheckInbox, setShowCheckInbox] = useState(false);
  const { user, loading: authLoading, signIn, signUp } = useAuth();

  if (!authLoading && user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
    } else {
      const { error } = await signUp(email, password, displayName || "Player");
      if (error) toast.error(error.message);
      else setShowCheckInbox(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message || "Google sign-in failed");
      setGoogleLoading(false);
      return;
    }
    if (result.redirected) return;
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

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="mb-4 h-12 w-full rounded-2xl bg-card font-semibold"
        >
          <GoogleIcon />
          <span className="ml-2">{googleLoading ? "Redirecting…" : "Continue with Google"}</span>
        </Button>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
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
