import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { domains } from "@/lib/domains";
import { Domain } from "@/lib/types";
import { Code2, FileText, ArrowRight, Cpu, Monitor } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DomainsPage() {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const itDomains = domains.filter((d) => d.category === "it");
  const coreDomains = domains.filter((d) => d.category === "core");

  const handleDomainClick = (domain: Domain) => {
    if (domain.category === "it") {
      setSelectedDomain(domain);
      setShowCodeModal(true);
    } else {
      // Core domains go directly to practice without code
      navigate("/practice", {
        state: {
          selectedDomain: domain,
          includeCode: false,
        },
      });
    }
  };

  const handleModeSelection = (includeCode: boolean) => {
    setShowCodeModal(false);
    if (selectedDomain) {
      navigate("/practice", {
        state: {
          selectedDomain,
          includeCode,
        },
      });
    }
  };

  const DomainCard = ({ domain }: { domain: Domain }) => {
    const topicCount = domain.topics.length;
    const subtopicCount = domain.topics.reduce((a, t) => a + t.subtopics.length, 0);

    return (
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        onClick={() => handleDomainClick(domain)}
        className="card-hover text-left p-5 group"
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{domain.icon}</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <h3 className="font-medium text-sm mb-1">{domain.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {domain.description}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{topicCount} topics</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>{subtopicCount} subtopics</span>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-[28px] font-semibold mb-2">Domains</h1>
        <p className="text-sm text-muted-foreground">
          Choose a domain to start practicing and improve your skills.
        </p>
      </motion.div>

      {/* IT Domains Section */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Monitor className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">IT Domains</h2>
            <p className="text-xs text-muted-foreground">Software Engineering & Computer Science</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {itDomains.map((domain, i) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.03 }}
            >
              <DomainCard domain={domain} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Core Domains Section */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <Cpu className="w-4.5 h-4.5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Core Domains</h2>
            <p className="text-xs text-muted-foreground">Electronics & Hardware Engineering</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreDomains.map((domain, i) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.03 }}
            >
              <DomainCard domain={domain} />
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Core domains focus on theoretical understanding and explanation-based evaluation.
        </p>
      </motion.section>

      {/* Code Mode Selection Modal for IT Domains */}
      <Dialog open={showCodeModal} onOpenChange={setShowCodeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{selectedDomain?.icon}</span>
              {selectedDomain?.name}
            </DialogTitle>
            <DialogDescription>
              How would you like to practice this domain?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeSelection(true)}
              className="surface-elevated p-5 text-center group hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-medium text-sm mb-1">With Code</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Write code and explain your approach
              </p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeSelection(false)}
              className="surface-elevated p-5 text-center group hover:border-accent/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <h4 className="font-medium text-sm mb-1">Theory Only</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Focus on concepts and explanation
              </p>
            </motion.button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs text-muted-foreground"
            onClick={() => setShowCodeModal(false)}
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
