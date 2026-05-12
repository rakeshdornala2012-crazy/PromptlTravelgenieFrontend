import Nav from "@/components/Nav";
import GeminiBrain from "@/components/GeminiBrain";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AIPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <div className="flex-1 pt-20 px-4 pb-0 mx-auto w-full max-w-2xl flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center pt-6 pb-4"
        >
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-medium tracking-widest uppercase text-primary">
              AI Concierge
            </span>
          </div>
          <h1 className="font-display text-2xl text-foreground">
            Promptly <span className="text-gradient-amber">Travel</span> Concierge
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your personal AI travel planner — ask anything
          </p>
        </motion.div>

        {/* Chat area */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-3xl overflow-hidden shadow-elegant flex-1 flex flex-col"
        >
          <GeminiBrain />
        </motion.div>
      </div>
    </main>
  );
}
