import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Moon, LogOut, LayoutDashboard, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
              <Zap className="w-4 h-4 text-background" />
            </div>
            <span className="font-semibold text-base">CoreLens</span>
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link to="/practice" className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <BookOpen className="w-4 h-4" />
              Practice
            </Link>
            <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <User className="w-4 h-4" />
              Profile
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted/30 text-xs font-medium">
              <span className="text-muted-foreground">POINTS</span>
              <span className="text-foreground ml-1">20</span>
            </div>
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
              <Moon className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/40 border border-border/50 text-muted-foreground text-sm mb-10"
          >
            <Zap className="w-3.5 h-3.5" />
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
            <span className="text-muted-foreground/60">top-tier</span>{" "}
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
              <Button 
                size="lg" 
                className="h-12 px-8 text-base font-medium bg-foreground text-background hover:bg-foreground/90"
              >
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 px-8 text-base font-medium border-border/50 hover:bg-muted/30"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/30">
        <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground">
          © 2026 CoreLens. AI-Powered Engineering Intelligence Platform.
        </div>
      </footer>
    </div>
  );
}
