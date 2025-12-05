import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QueryInterface } from "./QueryInterface";
import { FileText, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ViewportProps {
  shieldActive: boolean;
}

export const Viewport = ({ shieldActive }: ViewportProps) => {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sourceContent, setSourceContent] = useState<string | null>(null);
  const [agentOutput, setAgentOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch files on mount
  useEffect(() => {
    fetch('http://localhost:3000/api/files')
      .then(res => res.json())
      .then(data => setFiles(data))
      .catch(err => console.error("Failed to fetch files", err));
  }, []);

  const handleLoadFile = async (filename: string) => {
    setLoading(true);
    setSelectedFile(filename);
    setAgentOutput(null); // Clear previous output when loading new file
    try {
      const res = await fetch(`http://localhost:3000/api/files/${filename}`);
      const data = await res.json();
      setSourceContent(data.content);
      // We do NOT setAgentOutput here, so the "preview" remains hidden
    } catch (err) {
      console.error("Failed to load file", err);
      setSourceContent(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="h-full w-full bg-zinc-950 overflow-y-auto relative flex flex-col items-center"
      animate={{
        borderColor: shieldActive
          ? "hsl(var(--shield-active))"
          : "transparent",
      }}
      transition={{ duration: 0.3 }}
    >
      {/* ADDRESS BAR ... (unchanged code for address bar omitted for brevity, logic remains same) */}
      <div className="w-full max-w-2xl mt-8 px-4 flex justify-between items-center gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 flex items-center text-zinc-300 text-sm font-mono flex-1 transition-colors focus-within:border-cyan-500/50 focus-within:bg-zinc-900">
          <span className="text-cyan-500 mr-2">🔒</span>
          <input
            type="text"
            className="bg-transparent border-none outline-none w-full placeholder:text-zinc-600"
            placeholder="Enter URL (e.g., https://example.com) or select a file..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.currentTarget;
                const input = target.value;
                if (input.startsWith('http')) {
                  handleLoadFile(encodeURIComponent(input));
                } else {
                  handleLoadFile(input);
                }
              }
            }}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800">
              {selectedFile ? selectedFile : "Load Document"} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
            {files.length === 0 ? (
              <DropdownMenuItem disabled>No files in test_data</DropdownMenuItem>
            ) : (
              files.map(file => (
                <DropdownMenuItem key={file} onClick={() => handleLoadFile(file)}>
                  <FileText className="mr-2 h-4 w-4" /> {file}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* CENTERED QUERY INTERFACE */}
      {/* We pass 'sourceContent' so the agent can read it, but updates go to 'setAgentOutput' */}
      <div className="w-full max-w-3xl mt-20 px-6 z-30">
        <QueryInterface
          shieldActive={shieldActive}
          onContentUpdate={setAgentOutput}
          currentContent={sourceContent}
        />
      </div>

      {/* OUTPUT AREA (Agent Answer) */}
      {/* Only visible if we have a loading state OR an actual agent output */}
      {(loading || agentOutput) && (
        <div className="w-full max-w-2xl mt-12 px-8 pb-20">
          <div className="border-t border-zinc-800 pt-8">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                <span className="ml-3 text-zinc-500">Loading Source Content...</span>
              </div>
            ) : (
              <div className="prose prose-invert prose-lg text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-900/30 p-6 rounded-lg border border-zinc-800/50 shadow-inner">
                <h3 className="text-sm font-bold text-cyan-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Agent Response</h3>
                {agentOutput}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Glow effect */}
      {shieldActive && (
        <motion.div
          /* ... existing glow effect code ... */
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle at 50% 30%, hsl(var(--glow-shield)) 0%, transparent 60%)`,
            opacity: 0.15
          }}
        />
      )}
    </motion.div>
  );
};
