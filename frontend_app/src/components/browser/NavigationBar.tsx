import { ArrowLeft, ArrowRight, RotateCw, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SentinelShield } from "./SentinelShield";
import { motion } from "framer-motion";

interface NavigationBarProps {
  url: string;
  shieldActive: boolean;
  onShieldToggle: () => void;
}

export const NavigationBar = ({
  url,
  shieldActive,
  onShieldToggle,
}: NavigationBarProps) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel border-b p-4 flex items-center gap-3"
    >
      {/* Control Cluster */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Omnibox */}
      <motion.div
        className="flex-1 max-w-3xl mx-auto glass-panel rounded-full px-4 py-2 flex items-center gap-3"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Lock className="h-4 w-4 text-primary" />
        <input
          type="text"
          value={url}
          readOnly
          className="flex-1 bg-transparent border-none outline-none text-foreground text-sm"
          placeholder="Search or enter address"
        />
        <Star className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
      </motion.div>

      {/* Sentinel Shield Toggle */}
      <SentinelShield active={shieldActive} onToggle={onShieldToggle} />
    </motion.div>
  );
};
