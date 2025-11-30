import { useState } from "react";
import { NavigationBar } from "./NavigationBar";
import { Sidebar } from "./Sidebar";
import { Viewport } from "./Viewport";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
}

export const BrowserWindow = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "1", title: "New Tab", url: "comet://newtab", isActive: true },
  ]);
  const [shieldActive, setShieldActive] = useState(false);

  const activeTab = tabs.find((tab) => tab.isActive);

  const handleCreateTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: "New Tab",
      url: "comet://newtab",
      isActive: false,
    };
    setTabs([...tabs, newTab]);
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) return; // Keep at least one tab

    const newTabs = tabs.filter((tab) => tab.id !== id);

    // If closing active tab, activate the last one
    if (tabs.find((tab) => tab.id === id)?.isActive && newTabs.length > 0) {
      newTabs[newTabs.length - 1].isActive = true;
    }

    setTabs(newTabs);
  };

  const handleActivateTab = (id: string) => {
    setTabs(
      tabs.map((tab) => ({
        ...tab,
        isActive: tab.id === id,
      }))
    );
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Navigation Bar */}
      <NavigationBar
        url={activeTab?.url || ""}
        shieldActive={shieldActive}
        onShieldToggle={() => setShieldActive(!shieldActive)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-zinc-950">
        {/* Sidebar (Left) */}
        <Sidebar
          tabs={tabs}
          onCreateTab={handleCreateTab}
          onCloseTab={handleCloseTab}
          onActivateTab={handleActivateTab}
        />

        {/* Viewport (Right/Main) */}
        <motion.div
          className="flex-1 relative"
          animate={{
            boxShadow: shieldActive
              ? "inset 0 0 0 2px hsl(var(--shield-active))"
              : "none",
          }}
          transition={{ duration: 0.3 }}
        >
          <Viewport shieldActive={shieldActive} />
        </motion.div>
      </div>
    </div>
  );
};
