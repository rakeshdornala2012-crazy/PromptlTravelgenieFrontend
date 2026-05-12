import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, ChevronDown, ChevronUp, Cpu, Network, Info } from "lucide-react";

export type LogType = "info" | "network" | "ai" | "error";

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: LogType;
  message: string;
  data?: any;
}

// ── Global Logger Dispatcher ──────────────────────────────────
export const vLog = (type: LogType, message: string, data?: any) => {
  const event = new CustomEvent("voya-log", {
    detail: { type, message, data, timestamp: new Date(), id: Date.now().toString() + Math.random() },
  });
  window.dispatchEvent(event);
};

// ── UI Component ──────────────────────────────────────────────
export default function LoggerOverlay() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLog = (e: Event) => {
      const customEvent = e as CustomEvent<LogEntry>;
      setLogs((prev) => [...prev, customEvent.detail].slice(-50)); // Keep last 50 logs
      if (!isOpen) setUnread((prev) => prev + 1);
    };

    window.addEventListener("voya-log", handleLog);
    return () => window.removeEventListener("voya-log", handleLog);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const getIcon = (type: LogType) => {
    switch (type) {
      case "ai": return <Cpu className="h-3 w-3 text-purple-400" />;
      case "network": return <Network className="h-3 w-3 text-amber-400" />;
      case "error": return <X className="h-3 w-3 text-red-400" />;
      default: return <Info className="h-3 w-3 text-sky-400" />;
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex flex-col items-start font-mono">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "300px" }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="w-[400px] mb-2 overflow-hidden rounded-xl border border-white/20 bg-black/80 backdrop-blur-xl shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 bg-white/5">
              <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" /> System Logs
              </span>
              <button onClick={() => setLogs([])} className="text-[10px] text-white/50 hover:text-white transition">
                Clear
              </button>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
              {logs.length === 0 ? (
                <p className="text-xs text-white/30 text-center mt-4">Waiting for events...</p>
              ) : (
                logs.map((log) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log.id}
                    className="text-[11px] leading-relaxed border-l-2 pl-2"
                    style={{ borderColor: log.type === 'error' ? '#ef4444' : log.type === 'ai' ? '#a855f7' : log.type === 'network' ? '#f59e0b' : '#38bdf8' }}
                  >
                    <div className="flex items-start gap-1.5">
                      <span className="mt-0.5 opacity-60">{log.timestamp.toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 })}</span>
                      {getIcon(log.type)}
                      <span className="text-white/90 break-words">{log.message}</span>
                    </div>
                    {log.data && (
                      <pre className="mt-1 overflow-x-auto rounded bg-black/40 p-1.5 text-[9px] text-white/60">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setUnread(0);
        }}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white shadow-lg hover:bg-white/10 transition-all"
      >
        <Terminal className="h-3.5 w-3.5" />
        {isOpen ? "Close Logs" : "Show Logs"}
        {!isOpen && unread > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
