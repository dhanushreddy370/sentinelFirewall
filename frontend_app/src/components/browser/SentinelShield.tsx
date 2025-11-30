import { Shield, ShieldOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface SentinelShieldProps {
  active: boolean;
  onToggle: () => void;
}

export const SentinelShield = ({ active, onToggle }: SentinelShieldProps) => {
  const handleToggle = () => {
    onToggle();
    if (!active) {
      toast.success("Sentinel Shield Activated", {
        description:
          "Heuristic analysis for indirect prompt injection is now live.",
        duration: 3000,
      });
    } else {
      toast.info("Sentinel Shield Deactivated", {
        description: "Protection layer has been disabled.",
        duration: 3000,
      });
    }
  };

  return (
    <motion.div
      className="flex items-center gap-3 glass-panel rounded-full px-4 py-2"
      animate={{
        borderColor: active ? "hsl(var(--shield-active))" : "hsl(var(--border))",
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{
          color: active ? "hsl(var(--shield-active))" : "hsl(var(--shield-inactive))",
          scale: active ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {active ? (
          <Shield className="h-5 w-5" fill="currentColor" />
        ) : (
          <ShieldOff className="h-5 w-5" />
        )}
      </motion.div>

      <div className="flex flex-col">
        <span className="text-xs font-medium text-foreground">
          Sentinel Shield
        </span>
        <span className="text-[10px] text-muted-foreground">
          {active ? "Active" : "Inactive"}
        </span>
      </div>

      <Switch checked={active} onCheckedChange={handleToggle} />
    </motion.div>
  );
};
