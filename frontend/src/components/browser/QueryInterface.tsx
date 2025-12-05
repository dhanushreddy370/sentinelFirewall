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
  const [lastResult, setLastResult] = useState<{ status: string, details: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const executeAgent = async (isConfirmation: boolean, isDeny: boolean = false) => {
    if (query.trim()) {
      // Get content from prop or fallback to DOM (for safety)
      const articleContent = currentContent || document.getElementById('browser-content')?.innerText || "No content found.";

      // Only clear result if starting a NEW request, not confirming an existing one
      if (!isConfirmation && !isDeny) {
        setLastResult(null);
      }

      if (!articleContent || articleContent === "No content found.") {
        toast.error("DEBUG: Content is missing/empty!");
      }

      setIsProcessing(true);
      let toastMsg = "Agent is thinking...";
      if (isConfirmation) toastMsg = "Authorizing Action...";
      if (isDeny) toastMsg = "Blocking Action & Processing...";
      const toastId = toast.loading(toastMsg);

      let shouldClearQuery = true;

      try {
        const response = await fetch('http://localhost:3000/api/agent/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userPrompt: query,
            webpageContent: articleContent,
            safeMode: shieldActive,
            userConfirmation: isConfirmation,
            denyAction: isDeny
          })
        });

        const data = await response.json();
        setLastResult(data);

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

          if (onContentUpdate && data.message) {
            onContentUpdate(data.message);
          }
        } else if (data.status === "CONFIRMATION_REQUIRED") {
          shouldClearQuery = false; // Keep query for re-submission
          toast.warning("Authorization Required", {
            description: "The agent requires your approval to proceed.",
            duration: 5000,
            className: "bg-yellow-950 border-yellow-500 text-yellow-200"
          });
        } else if (data.status === "SANITIZED") {
          // New status for when a denied action is stripped and we have safe content
          toast.success("Action Blocked", {
            description: "Sensitive action removed. Processing safe content...",
            duration: 3000,
            className: "bg-blue-950 border-blue-500 text-blue-200"
          });
          if (onContentUpdate && data.message) {
            onContentUpdate(data.message);
          }
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
        shouldClearQuery = false;
      } finally {
        setIsProcessing(false);
        if (shouldClearQuery) {
          setQuery("");
        }
      }
    }
  };

  const handleSubmit = () => executeAgent(false);
  const handleConfirmAction = () => executeAgent(true);
  const handleDenyAction = () => executeAgent(false, true);

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

      {/* Persistent Attack Report Display */}
      {(lastResult?.status === "PROTECTED" || lastResult?.status === "COMPROMISED" || lastResult?.status === "CONFIRMATION_REQUIRED") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-lg border flex items-start gap-4 ${lastResult.status === "PROTECTED"
              ? "bg-green-950/30 border-green-500/50 text-green-200"
              : lastResult.status === "CONFIRMATION_REQUIRED"
                ? "bg-yellow-950/30 border-yellow-500/50 text-yellow-200"
                : "bg-red-950/30 border-red-500/50 text-red-200"
            }`}
        >
          <div className={`p-2 rounded-full ${lastResult.status === "PROTECTED" ? "bg-green-500/20"
              : lastResult.status === "CONFIRMATION_REQUIRED" ? "bg-yellow-500/20"
                : "bg-red-500/20"
            }`}>
            {lastResult.status === "PROTECTED" ? <Shield className="h-6 w-6" />
              : lastResult.status === "CONFIRMATION_REQUIRED" ? <ShieldAlert className="h-6 w-6" />
                : <ShieldAlert className="h-6 w-6" />}
          </div>
          <div className="w-full">
            <h3 className="font-bold text-lg mb-1">
              {lastResult.status === "PROTECTED" ? "Threat Neutralized"
                : lastResult.status === "CONFIRMATION_REQUIRED" ? "Action Confirmation Required"
                  : "Security Breach"}
            </h3>
            <p className="text-sm opacity-90 leading-relaxed mb-3">
              {lastResult.details}
            </p>

            {lastResult.status === "PROTECTED" && (
              <div className="mt-2 text-xs opacity-70 bg-black/20 p-2 rounded">
                <strong>Sentinel Forensics:</strong> The firewall intercepted a malicious instruction attempting to override system protocols.
              </div>
            )}

            {lastResult.status === "CONFIRMATION_REQUIRED" && (
              <div className="flex gap-3 justify-end mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDenyAction}
                  className="bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/50"
                >
                  Deny
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmAction}
                  className="bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  Authorize Action
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
