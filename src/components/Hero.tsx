import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles, ArrowRight, Calendar, Wallet, MapPin, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "@/assets/hero-lagoon.jpg";
import { chat, shouldTriggerAPI, getAPITargets, type TripIntent } from "@/lib/gemini";

const PROMPTS = [
  "5-day beach trip under ₹50,000 in November",
  "Solo hiking week in the Alps next March",
  "Anniversary in Kyoto with cherry blossoms",
  "Long weekend in Lisbon, foodie focused",
];

const CHIPS = [
  { icon: Wallet, label: "Under ₹50K", query: "budget beach trip under 50000 rupees" },
  { icon: Calendar, label: "November", query: "best destinations to visit in November" },
  { icon: MapPin, label: "Beach + chill", query: "best beach destinations for relaxing" },
];

const Hero = () => {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focused) return;
    const target = PROMPTS[idx];
    let i = 0;
    setTyped("");
    const t = setInterval(() => {
      i++;
      setTyped(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(t);
        setTimeout(() => setIdx((p) => (p + 1) % PROMPTS.length), 2400);
      }
    }, 38);
    return () => clearInterval(t);
  }, [idx, focused]);

  const handleSearch = (query?: string) => {
    const q = query ?? input;
    if (!q.trim()) {
      inputRef.current?.focus();
      return;
    }
    
    // Navigate directly to the Plan flow, which now accepts the 'q' parameter
    // and handles its own AI intent detection + option generation.
    navigate(`/plan?q=${encodeURIComponent(q)}`);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-hero noise pt-32 pb-20">
      {/* hero image */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Cinematic aerial view of a turquoise lagoon at golden hour"
          width={1920}
          height={1080}
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Multi-agent AI travel planner — preview
          </div>

          <h1 className="mt-6 font-display text-5xl font-light leading-[1.05] tracking-tight sm:text-7xl md:text-8xl">
            Speak it.<br />
            <span className="italic text-gradient-amber">See it.</span> Book it.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Tell Voya how you want to feel. Our AI agents plan flights, hotels,
            activities and visas — and check you out in one tap.
          </p>
        </motion.div>

        {/* ── Smart Search Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <div className={`glass group relative rounded-3xl p-2 shadow-elegant transition-all ${focused ? "ring-1 ring-primary/30" : ""}`}>
            <div className="flex items-center gap-2">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-amber">
                {loading
                  ? <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
                  : <Sparkles className="h-5 w-5 text-primary-foreground" />
                }
              </div>
              <div className="relative flex-1 text-left">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Tell Voya anything
                </div>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={focused ? "e.g. flights to Bali in May for 2..." : typed}
                  className="w-full bg-transparent font-display text-lg sm:text-xl text-foreground outline-none placeholder:text-muted-foreground/50 min-h-[28px]"
                  disabled={loading}
                />
                {!focused && !input && (
                  <span className="pointer-events-none absolute left-0 top-0 ml-0.5 inline-block h-5 w-[2px] translate-y-1 animate-pulse bg-primary" />
                )}
              </div>
              <button
                aria-label="Voice search"
                onClick={() => window.dispatchEvent(new CustomEvent("open-voice-assistant"))}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-secondary text-foreground hover:bg-secondary/70 transition-all"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                aria-label="Search"
                className="hidden sm:grid h-12 w-12 place-items-center rounded-2xl bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* chips */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {CHIPS.map((c) => (
              <button
                key={c.label}
                onClick={() => handleSearch(c.query)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-50"
              >
                <c.icon className="h-3 w-3" />
                {c.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mx-auto mt-20 grid max-w-3xl grid-cols-3 divide-x divide-border border-y border-border py-6 text-center"
        >
          {[
            ["6", "AI agents working in parallel"],
            ["1", "Checkout for the entire trip"],
            ["190+", "Countries with visa intel"],
          ].map(([n, l]) => (
            <div key={l} className="px-4">
              <div className="font-display text-3xl">{n}</div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
