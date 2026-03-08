import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, BarChart3, Code2, Lightbulb, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Brain, title: "AI Evaluation", desc: "Senior-engineer level code review and feedback" },
  { icon: BarChart3, title: "Rubric Scoring", desc: "6-axis evaluation with radar charts and analytics" },
  { icon: Code2, title: "Multi-Domain", desc: "IT and Core Engineering domains covered" },
  { icon: Lightbulb, title: "Learning Context", desc: "Real-world applications for every concept" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8">
              <Cpu className="w-3.5 h-3.5" />
              AI-Powered Engineering Intelligence
            </div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              Think like a
              <span className="text-gradient-primary"> senior engineer.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              CoreLens evaluates your problem-solving, reasoning clarity, code quality, and domain
              understanding — like having a senior engineer review every solution.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link to="/practice">
                <Button size="lg" className="h-12 px-8 text-base font-semibold glow-primary">
                  Start Practicing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="surface-elevated rounded-xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How CoreLens Works</h2>
          <div className="space-y-6 text-left">
            {[
              "Select your domain, topic, and difficulty level",
              "Solve the problem with the integrated code editor",
              "Explain your reasoning via text or voice",
              "Get AI-powered evaluation with rubric scoring & expert feedback",
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * i }}
                className="flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-lg pt-0.5">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          © 2026 CoreLens. AI-Powered Engineering Intelligence Platform.
        </div>
      </footer>
    </div>
  );
}
