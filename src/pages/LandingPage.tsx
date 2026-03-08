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
    <div className="min-h-full">
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-muted-foreground text-xs font-medium mb-8">
              <Cpu className="w-3 h-3" />
              AI-Powered Engineering Intelligence
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Think like a
              <span className="text-gradient-primary"> senior engineer.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              CoreLens evaluates your problem-solving, reasoning clarity, code quality, and domain understanding.
            </p>

            <div className="flex items-center justify-center gap-3">
              <Link to="/practice">
                <Button size="lg" className="h-10 px-6 text-sm font-medium">
                  Start Practicing <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="h-10 px-6 text-sm font-medium">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
                className="card-hover p-5"
              >
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-8 text-center">How it works</h2>
          <div className="space-y-4">
            {[
              "Select your domain, topic, and difficulty level",
              "Solve the problem with the integrated code editor",
              "Explain your reasoning via text or voice",
              "Get AI-powered evaluation with rubric scoring & expert feedback",
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground">
          © 2026 CoreLens. AI-Powered Engineering Intelligence Platform.
        </div>
      </footer>
    </div>
  );
}
