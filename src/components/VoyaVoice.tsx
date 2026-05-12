import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, X, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { useVoiceAssistant, VoiceState } from "@/hooks/useVoiceAssistant";

interface Props {
  onSearch?: (query: string) => void;
}

const STATE_COLORS: Record<VoiceState, string> = {
  idle: "bg-primary/10 border-primary/30 text-primary",
  listening: "bg-red-500/20 border-red-400/60 text-red-400",
  thinking: "bg-amber-500/20 border-amber-400/60 text-amber-400",
  speaking: "bg-emerald-500/20 border-emerald-400/60 text-emerald-400",
};

const STATE_LABEL: Record<VoiceState, string> = {
  idle: "Tap to speak",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Voya speaking…",
};

export default function VoyaVoice({ onSearch }: Props) {
  const [open, setOpen] = useState(false);
  const { state, transcript, lastReply, error, startListening, stopListening, reset, greet } =
    useVoiceAssistant({ onSearch });

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => greet(), 300);
  };

  const handleClose = () => {
    stopListening();
    reset();
    setOpen(false);
  };

  useEffect(() => {
    const onOpenEvent = () => handleOpen();
    window.addEventListener("open-voice-assistant", onOpenEvent);
    return () => window.removeEventListener("open-voice-assistant", onOpenEvent);
  }, [greet]);

  const handleMic = () => {
    if (state === "listening") {
      stopListening();
    } else if (state === "idle") {
      startListening();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpen}
          className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-background shadow-glow backdrop-blur"
        >
          <Mic className="h-5 w-5 text-primary" />
        </motion.button>
      )}

      {/* Voice panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-8 right-8 z-50 w-80 overflow-hidden rounded-3xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="font-display text-sm font-medium">Voya Voice</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 py-5 space-y-4">
              {/* Voya reply bubble */}
              {lastReply && (
                <motion.div
                  key={lastReply}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-secondary/60 px-4 py-3 text-sm leading-relaxed text-foreground"
                >
                  {lastReply.replace(/\[SEARCH:.*?\]/g, "").trim()}
                </motion.div>
              )}

              {/* User transcript */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-right"
                >
                  <span className="inline-block rounded-2xl bg-primary/15 px-4 py-2 text-sm text-primary">
                    {transcript}
                  </span>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}

              {/* Mic button */}
              <div className="flex flex-col items-center gap-2 pt-1">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleMic}
                  disabled={state === "thinking" || state === "speaking"}
                  className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all ${STATE_COLORS[state]} disabled:opacity-40`}
                >
                  {/* Pulse ring when listening */}
                  {state === "listening" && (
                    <motion.span
                      className="absolute inset-0 rounded-full border-2 border-red-400/50"
                      animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                  {state === "listening" ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </motion.button>
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {STATE_LABEL[state]}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}