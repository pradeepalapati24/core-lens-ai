import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Moon, Sun, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Gradient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2 }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-1/3 -right-32 w-80 h-80 bg-accent/20 rounded-full blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/15 rounded-full blur-[80px]"
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="w-full border-b border-border/50 relative z-10 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center transition-shadow group-hover:shadow-lg group-hover:shadow-primary/20"
            >
              <Zap className="w-4 h-4 text-background" />
            </motion.div>
            <span className="font-semibold text-base">CoreLens</span>
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/domains", label: "Practice" },
              { to: "/profile", label: "Profile" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span className="relative z-10">{link.label}</span>
                <motion.span
                  className="absolute inset-0 bg-muted/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="nav-hover"
                />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDark(!isDark)}
              className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/40 border border-border/50 text-muted-foreground text-sm mb-10 cursor-default group hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary group-hover:animate-pulse" />
            Master technical communication
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8"
          >
            Explain your way to a{" "}
            <motion.span 
              className="text-muted-foreground/60 relative inline-block"
              whileHover={{ scale: 1.02 }}
            >
              <span className="relative z-10">top-tier</span>
              <motion.span 
                className="absolute -inset-2 bg-primary/10 rounded-lg -z-0"
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.span>{" "}
            offer.
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            CoreLens evaluates your conceptual understanding and reasoning clarity, training you to speak like a senior engineer during technical interviews.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4"
          >
            <Link to="/domains">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="h-12 px-8 text-base font-medium bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl hover:shadow-foreground/10 transition-all"
                >
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/auth">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 px-8 text-base font-medium border-border/50 hover:bg-muted/30 hover:border-primary/30 transition-all"
                >
                  Sign In
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex items-center justify-center gap-8 text-xs text-muted-foreground"
          >
            {["AI-Powered Feedback", "Senior Engineer Rubric", "Real-time Analysis"].map((item, i) => (
              <motion.div 
                key={item}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                {item}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/30 relative z-10">
        <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground">
          © 2026 CoreLens. AI-Powered Engineering Intelligence Platform.
        </div>
      </footer>
    </div>
  );
}
