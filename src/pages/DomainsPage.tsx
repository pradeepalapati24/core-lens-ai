import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Monitor, Loader2, FileText } from "lucide-react";
import { useDomains, DbDomain } from "@/hooks/useDomains";

export default function DomainsPage() {
  const navigate = useNavigate();
  const { data: domains = [], isLoading } = useDomains();

  const itDomains = domains.filter((d) => d.type === "software");
  const coreDomains = domains.filter((d) => d.type === "core");

  const handleDomainClick = (domain: DbDomain) => {
    navigate("/topics", {
      state: {
        domainId: domain.id,
        domainName: domain.name,
        domainType: domain.type,
        domainIcon: domain.icon || "📚",
      },
    });
  };

  const DomainCard = ({ domain }: { domain: DbDomain }) => (
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
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{domain.description}</p>
    </motion.button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-[28px] font-semibold mb-2">Domains</h1>
        <p className="text-sm text-muted-foreground">Choose a domain to start practicing and improve your skills.</p>
      </motion.div>

      {/* IT Domains */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Monitor className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">IT / Software Engineering</h2>
            <p className="text-xs text-muted-foreground">Data Structures, Algorithms, OS, Networks, Databases & System Design</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {itDomains.map((domain, i) => (
            <motion.div key={domain.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.03 }}>
              <DomainCard domain={domain} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Core Domains */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
            <Cpu className="w-4.5 h-4.5 text-success" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Core Engineering</h2>
            <p className="text-xs text-muted-foreground">Electronics, IoT Systems & VLSI Design</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreDomains.map((domain, i) => (
            <motion.div key={domain.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.03 }}>
              <DomainCard domain={domain} />
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Core domains focus on theoretical understanding and explanation-based evaluation.
        </p>
      </motion.section>
    </div>
  );
}
