import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Sparkles, Code2, Brain, BarChart3, Shield, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Brain, title: "AI-Powered Evaluation", description: "Get feedback graded on a senior engineer rubric — reasoning, clarity, depth." },
  { icon: Code2, title: "Code + Explanation", description: "Write code then explain your approach. Two-step flow mirrors real interviews." },
  { icon: BarChart3, title: "Progress Analytics", description: "Track growth across 4 domains, 22 topics, and 143 subtopics." },
  { icon: Shield, title: "Interview Simulation", description: "Timed sessions with countdown pressure. Practice under real conditions." },
  { icon: Users, title: "Challenge Friends", description: "Compete on the same topic. Share links or invite users directly." },
  { icon: Sparkles, title: "Skill Reports", description: "Export shareable proficiency summaries for resumes and LinkedIn." },
];

const domainGroups = [
  {
    category: "SOFTWARE ENGINEERING",
    domains: [
      { icon: "💻", name: "IT / Software Engineering", topics: "6 topics · 60+ subtopics" },
    ],
  },
  {
    category: "CORE ENGINEERING",
    domains: [
      { icon: "⚡", name: "Core Electronics", topics: "6 topics · 40+ subtopics" },
      { icon: "🌐", name: "IoT Systems", topics: "5 topics · 25+ subtopics" },
      { icon: "🔬", name: "VLSI Design", topics: "5 topics · 25+ subtopics" },
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="w-full border-b border-border/50 sticky top-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm"
            >
              <Zap className="w-4 h-4 text-primary-foreground" />
            </motion.div>
            <span className="font-bold text-base">CoreLens</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: "/domains", label: "Domains" },
              { to: "/practice", label: "Practice" },
              { to: "/challenge", label: "Challenge" },
            ].map((link) => (
              <Link key={link.to} to={link.to} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="text-sm h-8 px-4">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Subtle gradient bg */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium mb-8">
                <Sparkles className="w-3 h-3" />
                AI Technical Interview Coach for Engineers
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Practice technical
                <br />
                <span className="text-gradient-primary">interviews with AI</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                Solve engineering problems, explain your reasoning, and get evaluated like a real technical interview.
              </p>

              <div className="flex items-center justify-center gap-3">
                <Link to="/auth">
                  <Button size="lg" className="h-11 px-7 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                    Start Free <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/domains">
                  <Button variant="outline" size="lg" className="h-11 px-7 text-sm font-medium">
                    Explore Domains
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Domains preview */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">4 Engineering Domains</h2>
              <p className="text-sm text-muted-foreground">Real engineering curriculum depth — not surface-level categories</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {domains.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link to="/domains" className="card-hover block p-5">
                    <span className="text-2xl mb-3 block">{d.icon}</span>
                    <h3 className="font-semibold text-sm mb-1">{d.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{d.topics}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="border-t border-border/50 bg-muted/30">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-2">Built for serious engineers</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">Every feature designed to bridge the gap between knowing and explaining</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="surface-elevated p-6"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center mb-3">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-3">Ready to level up?</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
              Join engineers who practice explaining, not just solving.
            </p>
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 text-sm font-semibold shadow-lg shadow-primary/20">
                Get Started Free <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">© 2026 CoreLens</span>
          </div>
          <span className="text-[11px] text-muted-foreground">AI-Powered Engineering Intelligence</span>
        </div>
      </footer>
    </div>
  );
}
