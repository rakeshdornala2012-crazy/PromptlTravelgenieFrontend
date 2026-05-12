import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles, ArrowRight, Wallet, Calendar, MapPin, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { clientSideValidate, type ValidationResult } from "@/lib/validate";

const SUGGESTIONS = [
  "5-day beach trip under ₹50,000 in November",
  "Solo hiking week in the Alps next March",
  "Anniversary in Kyoto with cherry blossoms",
  "Foodie long weekend in Lisbon",
];

type Props = {
  onSubmit: (query: string) => void;
};

const PlannerSearch = ({ onSubmit }: Props) => {
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [pIdx, setPIdx] = useState(0);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Validate on query change (debounced via effect)
  useEffect(() => {
    if (query.trim()) {
      const result = clientSideValidate(query);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [query]);

  useEffect(() => {
    if (query) return;
    const target = SUGGESTIONS[pIdx];
    let i = 0;
    setPlaceholder("");
    const t = setInterval(() => {
      i++;
      setPlaceholder(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(t);
        setTimeout(() => setPIdx((p) => (p + 1) % SUGGESTIONS.length), 2400);
      }
    }, 38);
    return () => clearInterval(t);
  }, [pIdx, query]);

  // Fake voice listening
  useEffect(() => {
    if (!listening) return;
    const t = setTimeout(() => {
      setQuery("5-day beach trip under ₹50,000 in November");
      setListening(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [listening]);

  const submit = (q?: string) => {
    const final = (q ?? query).trim();
    if (!final || submitting) return;
    setSubmitting(true);
    setTimeout(() => onSubmit(final), 350);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-hero noise pt-32 pb-20">
      <div className="pointer-events-none absolute inset-x-0 top-20 h-96 bg-gradient-amber opacity-[0.07] blur-[140px]" />

      <div className="relative mx-auto max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" />
            Tell Voya what you want — anything goes
          </div>
          <h1 className="mt-6 font-display text-5xl font-light leading-[1.05] tracking-tight sm:text-6xl">
            What's the trip<br />
            <span className="italic text-gradient-amber">in your head?</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-10"
        >
          <div className="glass relative rounded-3xl p-3 shadow-elegant">
            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={placeholder}
              rows={2}
              className="block w-full resize-none bg-transparent px-3 py-2 font-display text-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none sm:text-2xl"
            />
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { icon: Wallet, label: "Budget" },
                  { icon: Calendar, label: "Dates" },
                  { icon: MapPin, label: "Vibe" },
                ].map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                  >
                    <c.icon className="h-3 w-3" />
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Voice search"
                  onClick={() => setListening((s) => !s)}
                  className={`grid h-10 w-10 place-items-center rounded-2xl border border-border transition-all ${
                    listening
                      ? "bg-primary text-primary-foreground animate-pulse-glow"
                      : "bg-secondary text-foreground hover:bg-secondary/70"
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => submit()}
                  disabled={!query.trim() || submitting}
                  className="group inline-flex h-10 items-center gap-2 rounded-2xl bg-gradient-amber px-4 text-sm font-medium text-primary-foreground shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-[1.02]"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Plan trip
                      <ArrowRight className="h-4 w-4 transition-transform group-enabled:group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI validation message */}
          <AnimatePresence>
            {validation && validation.aiMessage && validation.fields.destination.status === "ok" && (
              <motion.div
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                className="mt-3 overflow-hidden text-left"
              >
                <div className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs text-primary/90">{validation.aiMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {listening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"
            >
              <span className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ height: ["8px", "20px", "8px"] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.1 }}
                    className="w-0.5 rounded-full bg-primary"
                  />
                ))}
              </span>
              Listening… (demo)
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10"
        >
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground text-center">
            Try one of these
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlannerSearch;
