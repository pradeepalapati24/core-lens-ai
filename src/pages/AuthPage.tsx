import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Zap, ArrowLeft, Loader2, Mail, Lock, User } from "lucide-react";

type AuthMode = "signin" | "signup" | "forgot";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username,
          display_name: username,
        },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a verification link.",
      });
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="w-full border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center"
            >
              <Zap className="w-4 h-4 text-background" />
            </motion.div>
            <span className="font-semibold text-base">CoreLens</span>
          </Link>
        </div>
      </header>

      {/* Auth form */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>

          <div className="surface-elevated p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl font-semibold mb-1">
                  {mode === "signin" && "Welcome back"}
                  {mode === "signup" && "Create account"}
                  {mode === "forgot" && "Reset password"}
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  {mode === "signin" && "Sign in to continue your practice"}
                  {mode === "signup" && "Start mastering technical interviews"}
                  {mode === "forgot" && "We'll send you a reset link"}
                </p>

                <form
                  onSubmit={
                    mode === "signin"
                      ? handleSignIn
                      : mode === "signup"
                      ? handleSignUp
                      : handleForgotPassword
                  }
                  className="space-y-4"
                >
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-xs">
                        Username
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="johndoe"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-9 h-10"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 h-10"
                        required
                      />
                    </div>
                  </div>

                  {mode !== "forgot" && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 h-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : mode === "signin" ? (
                      "Sign In"
                    ) : mode === "signup" ? (
                      "Create Account"
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-xs text-muted-foreground">
                  {mode === "signin" && (
                    <>
                      <button
                        onClick={() => setMode("forgot")}
                        className="hover:text-foreground transition-colors"
                      >
                        Forgot password?
                      </button>
                      <span className="mx-2">·</span>
                      <button
                        onClick={() => setMode("signup")}
                        className="hover:text-foreground transition-colors"
                      >
                        Create account
                      </button>
                    </>
                  )}
                  {mode === "signup" && (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => setMode("signin")}
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                  {mode === "forgot" && (
                    <>
                      Remember your password?{" "}
                      <button
                        onClick={() => setMode("signin")}
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
