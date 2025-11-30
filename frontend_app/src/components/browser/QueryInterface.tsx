import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Paperclip, Shield, ShieldAlert, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface QueryInterfaceProps {
  shieldActive: boolean;
  onContentUpdate?: (content: string) => void;
  currentContent?: string | null;
}

export const QueryInterface = ({ shieldActive, onContentUpdate, currentContent }: QueryInterfaceProps) => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (query.trim()) {
      // Get content from prop or fallback to DOM (for safety)
      const articleContent = currentContent || document.getElementById('browser-content')?.innerText || "No content found.";

      if (!articleContent || articleContent === "No content found.") {
        toast.error("DEBUG: Content is missing/empty!");
        // Proceed anyway to see what happens, or return?
        // return; 
      }

      setIsProcessing(true);
      const toastId = toast.loading("Agent is thinking...");

      try {
        const response = await fetch('http://localhost:3000/api/agent/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userPrompt: query,
            webpageContent: articleContent,
            safeMode: shieldActive
          })
        });

        const data = await response.json();

        toast.dismiss(toastId);

        if (data.status === "COMPROMISED") {
          toast.error("SECURITY BREACH DETECTED", {
            description: data.message,
            duration: 5000,
            className: "bg-red-950 border-red-500 text-red-200"
          });
        } else if (data.status === "PROTECTED") {
          toast.success("THREAT BLOCKED", {
            description: data.details,
            duration: 5000,
            className: "bg-green-950 border-green-500 text-green-200"
          });
        } else {
          toast.info("Agent Response", {
            description: "Check the main view for the answer.",
            duration: 3000
          });
          // Update the main view with the agent's response
          if (onContentUpdate) {
            onContentUpdate(data.message);
          }
        }

      } catch (e) {
        toast.dismiss(toastId);
        toast.error("Connection Failed", { description: "Could not reach Sentinel Backend." });
      } finally {
        setIsProcessing(false);
      }

      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      const toastId = toast.loading("Uploading file...");
      try {
        await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          body: formData
        });
        toast.dismiss(toastId);
        toast.success("File Uploaded", { description: `${file.name} is ready to load.` });
        // Ideally, trigger a refresh of the file list in Viewport, but for now user can just open dropdown
      } catch (err) {
        toast.dismiss(toastId);
        toast.error("Upload Failed");
      }
    }
  };

  return (
    <div className="relative w-full">
      <div className={`relative rounded-xl border bg-zinc-900/50 backdrop-blur-xl shadow-2xl transition-all duration-300 ${shieldActive ? "border-cyan-500/50 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]" : "border-zinc-800"
        }`}>

        {/* Header / Status Indicator */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            {shieldActive ? (
              <Shield className="w-4 h-4 text-cyan-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-xs font-medium tracking-wider ${shieldActive ? "text-cyan-400" : "text-zinc-500"}`}>
              {shieldActive ? "SENTINEL ACTIVE" : "UNPROTECTED MODE"}
            </span>
          </div>
          {isProcessing && (
            <span className="text-xs text-zinc-500 animate-pulse">Processing...</span>
          )}
        </div>

        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={shieldActive ? "Enter a command safely..." : "Enter a command..."}
          className="min-h-[120px] w-full resize-none bg-transparent px-4 py-4 text-base text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-0 border-none"
        />

        <div className="flex items-center justify-between p-3">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!query.trim() || isProcessing}
            className={`transition-all duration-300 ${shieldActive
              ? "bg-cyan-500 hover:bg-cyan-400 text-black"
              : "bg-zinc-100 hover:bg-white text-black"
              }`}
          >
            <Send className="h-4 w-4 mr-2" />
            Execute Agent
          </Button>
        </div>
      </div>
    </div>
  );
};
