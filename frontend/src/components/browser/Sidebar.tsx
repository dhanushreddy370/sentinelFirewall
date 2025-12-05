import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface Tab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
}

interface SidebarProps {
  tabs: Tab[];
  onCreateTab: () => void;
  onCloseTab: (id: string) => void;
  onActivateTab: (id: string) => void;
}

export const Sidebar = ({
  tabs,
  onCreateTab,
  onCloseTab,
  onActivateTab,
}: SidebarProps) => {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 glass-panel border-r flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Comet Browser
        </h2>
        <Button
          onClick={onCreateTab}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Tab
        </Button>
      </div>

      {/* Tab List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <AnimatePresence>
            {tabs.map((tab) => (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`group relative rounded-xl p-3 cursor-pointer transition-smooth ${
                  tab.isActive
                    ? "bg-primary/20 border border-primary/50"
                    : "hover:bg-secondary/50"
                }`}
                onClick={() => onActivateTab(tab.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {tab.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tab.url}
                    </p>
                  </div>
                  
                  {tabs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {tab.isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl border-2 border-primary -z-10"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </motion.div>
  );
};
