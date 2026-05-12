import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { clientSideValidate, type ValidationResult } from "@/lib/validate";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Mic,
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  Wallet,
  Heart,
  PartyPopper,
  TreePine,
  Crown,
  Check,
  Command,
} from "lucide-react";
import DatePicker, { DateRange } from "./DatePicker";
import PeopleSelector, { People, summarizePeople } from "./PeopleSelector";
import BudgetSlider, { formatBudgetShort } from "./BudgetSlider";

type Vibe = "romantic" | "party" | "chill" | "luxury" | null;

const VIBES: { id: NonNullable<Vibe>; label: string; icon: any; gradient: string }[] = [
  { id: "romantic", label: "Romantic", icon: Heart, gradient: "from-rose-500 to-pink-500" },
  { id: "party", label: "Party", icon: PartyPopper, gradient: "from-fuchsia-500 to-purple-500" },
  { id: "chill", label: "Chill", icon: TreePine, gradient: "from-emerald-500 to-teal-500" },
  { id: "luxury", label: "Luxury", icon: Crown, gradient: "from-amber-400 to-orange-500" },
];

const POPULAR_DESTINATIONS = ["Bali", "Goa", "Dubai", "Paris", "Tokyo", "Maldives", "Manali", "Santorini"];

const SUGGESTION_CHIPS = [
  { label: "Beach getaway under ₹50K", weight: "regular" },
  { label: "Romantic Paris in November", weight: "regular" },
  { label: "Family trip to Bali", weight: "regular" },
  { label: "Adventure in Manali", weight: "regular" },
];

// Cycling placeholder prompts for the idle state
const PLACEHOLDER_PROMPTS = [
  "Where do you want to go?",
  "Paris in autumn, perhaps?",
  "A weekend in Goa?",
  "5 days in Bali?",
  "Tokyo in cherry blossom season?",
];

const SmartSearch = () => {
  const navigate = useNavigate();

  // State
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState<DateRange>({ start: null, end: null });
  const [people, setPeople] = useState<People>({ adults: 2, children: 0 });
  const [budget, setBudget] = useState(50000);
  const [vibe, setVibe] = useState<Vibe>(null);

  // Validation state
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // Flow control
  const [inputFocused, setInputFocused] = useState(false);
  const [activePanel, setActivePanel] = useState<"dates" | "people" | "budget" | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "launching">("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycling placeholder
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    if (destination || inputFocused) return; // pause cycling when user is engaged
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_PROMPTS.length);
    }, 3500);
    return () => clearInterval(id);
  }, [destination, inputFocused]);

  // Magnetic mouse-follow on the input bar
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useTransform(mouseX, (v) => `${v}px`);
  const glowY = useTransform(mouseY, (v) => `${v}px`);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  // Cmd/Ctrl+K to focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Validate on destination change (instant client-side)
  useEffect(() => {
    if (destination.trim()) {
      const result = clientSideValidate(destination);
      // Override fields based on wizard state
      if (dates.start && dates.end) result.fields.dates = { value: "set", status: "ok" };
      if (people.adults > 0) result.fields.travelers = { value: people.adults, status: "ok" };
      if (budget > 0) result.fields.budget = { value: budget, status: "ok" };
      result.missingCount = Object.values(result.fields).filter(f => f.status !== "ok").length;
      result.complete = result.fields.destination.status === "ok" && result.fields.dates.status === "ok";
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [destination, dates, people, budget]);

  // Has the user committed? Trigger wizard expansion.
  const expanded = destination.trim().length > 0;

  // Click outside to close active panel
  useEffect(() => {
    if (!activePanel) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [activePanel]);

  // Build the query string and submit (with launch animation)
  const submit = () => {
    if (!destination.trim()) return;
    setSubmitState("launching");
    const parts: string[] = [destination.trim()];
    const nights =
      dates.start && dates.end
        ? Math.round((dates.end.getTime() - dates.start.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    if (nights > 0) parts.push(`${nights} days`);
    const total = people.adults + people.children;
    if (total > 0) parts.push(`for ${total} ${total === 1 ? "person" : "people"}`);
    if (budget) parts.push(`under ${formatBudgetShort(budget).toLowerCase()}`);
    if (vibe) parts.push(vibe);
    const query = parts.join(" ");
    setTimeout(() => navigate(`/plan?q=${encodeURIComponent(query)}`), 450);
  };

  const ready = destination.trim().length > 0;

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-2xl">
      {/* MAIN INPUT BAR — premium edition */}
      <motion.div
        layout
        onMouseMove={handleMouseMove}
        animate={{
          y: submitState === "launching" ? -8 : 0,
          opacity: submitState === "launching" ? 0 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Outer breathing aura */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-8 rounded-full"
          animate={{
            opacity: inputFocused ? [0.4, 0.55, 0.4] : [0.15, 0.22, 0.15],
            scale: inputFocused ? [1, 1.02, 1] : [1, 1.01, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(212,168,106,0.35) 0%, rgba(212,168,106,0) 60%)",
            filter: "blur(40px)",
          }}
        />

        {/* The bar itself */}
        <motion.div
          animate={{
            scale: inputFocused ? 1.005 : 1,
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Cursor-follow spotlight (only when focused) */}
          {inputFocused && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
              style={{ borderRadius: 9999 }}
            >
              <motion.div
                className="absolute h-32 w-32 rounded-full"
                style={{
                  left: glowX,
                  top: glowY,
                  x: "-50%",
                  y: "-50%",
                  background:
                    "radial-gradient(circle, rgba(212,168,106,0.18) 0%, transparent 70%)",
                }}
              />
            </motion.div>
          )}

          {/* Hairline gradient border */}
          <div
            className={`relative rounded-full p-px transition-all duration-500 ${
              inputFocused || expanded
                ? "bg-gradient-to-r from-amber-400/60 via-amber-200/30 to-amber-400/60"
                : "bg-white/[0.08]"
            }`}
          >
            <div className="relative flex h-[64px] items-center gap-2 rounded-full bg-[#0a0a0a]/95 px-3 backdrop-blur-2xl">
              {/* Sparkle icon — minimal, refined */}
              <motion.div
                animate={{ rotate: inputFocused ? [0, 8, -8, 0] : 0 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #f5d27a 0%, #c98a3a 70%, #8a5a1f 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px rgba(212,168,106,0.4)",
                }}
              >
                <Sparkles className="h-4 w-4 text-black" strokeWidth={2.4} />
              </motion.div>

              {/* Input + animated placeholder layer */}
              <div className="relative flex flex-1 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder=""
                  className="w-full bg-transparent px-1 py-2 text-base text-white outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                {/* Animated placeholder — only when input is empty */}
                {!destination && (
                  <div className="pointer-events-none absolute inset-0 flex items-center px-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={placeholderIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 0.45, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="text-base text-white/40"
                      >
                        {PLACEHOLDER_PROMPTS[placeholderIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Cmd+K hint — only when not focused, desktop */}
              {!inputFocused && !destination && (
                <div className="hidden items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/35 sm:flex">
                  <Command className="h-2.5 w-2.5" />
                  <span>K</span>
                </div>
              )}

              {/* Voice button */}
              <button
                aria-label="Voice input"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/50 transition hover:bg-white/[0.04] hover:text-white"
              >
                <Mic className="h-4 w-4" strokeWidth={1.8} />
              </button>

              {/* Submit — refined gold pill with comet trail */}
              <motion.button
                onClick={submit}
                disabled={!ready}
                whileTap={{ scale: 0.93 }}
                className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full overflow-hidden disabled:cursor-not-allowed"
                aria-label="Submit"
                style={{
                  background: ready
                    ? "radial-gradient(circle at 30% 30%, #f5d27a, #c98a3a)"
                    : "rgba(255,255,255,0.04)",
                  boxShadow: ready
                    ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 16px rgba(212,168,106,0.5)"
                    : "none",
                  opacity: ready ? 1 : 0.4,
                }}
              >
                <ArrowRight
                  className={`relative z-10 h-4 w-4 ${ready ? "text-black" : "text-white/40"}`}
                  strokeWidth={2.4}
                />
                {/* Shimmer trail on submit */}
                {submitState === "launching" && (
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* SUGGESTION CHIPS — refined: TRY: prefix kerned, chips with subtle hierarchy */}
      <AnimatePresence>
        {!expanded && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
          >
            <span className="mr-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/30">
              Try
            </span>
            {SUGGESTION_CHIPS.map((s, i) => (
              <motion.button
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                onClick={() => {
                  const dest = POPULAR_DESTINATIONS.find((d) =>
                    s.label.toLowerCase().includes(d.toLowerCase())
                  );
                  setDestination(dest ?? s.label);
                }}
                whileHover={{ y: -1 }}
                className="rounded-full border border-white/[0.06] bg-white/[0.015] px-3 py-1.5 text-[12px] text-white/55 transition-all hover:border-amber-400/25 hover:bg-amber-400/[0.03] hover:text-white/90"
              >
                {s.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPULAR DESTINATIONS — surfaces on focus */}
      <AnimatePresence>
        {inputFocused && !expanded && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 rounded-3xl border border-white/[0.06] bg-[#0a0a0a]/95 p-5 backdrop-blur-2xl"
            style={{
              boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,106,0.04)",
            }}
          >
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">
              Popular destinations
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_DESTINATIONS.map((d, i) => (
                <motion.button
                  key={d}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDestination(d);
                  }}
                  whileHover={{ y: -1 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.015] px-3 py-1.5 text-[12px] text-white/70 transition-all hover:border-amber-400/30 hover:bg-amber-400/[0.04] hover:text-white"
                >
                  <MapPin className="h-3 w-3 text-amber-400/80" />
                  {d}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WIZARD — expands once user has a destination */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3">
              {/* AI validation message */}
              {validation && validation.aiMessage && validation.fields.destination.status === "ok" && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs text-primary/90">{validation.aiMessage}</span>
                </motion.div>
              )}

              {/* Field row */}
              <div className="grid gap-2 sm:grid-cols-3">
                <FieldTrigger
                  icon={Calendar}
                  label="When"
                  value={
                    dates.start && dates.end
                      ? formatRange(dates.start, dates.end)
                      : "Add dates"
                  }
                  filled={Boolean(dates.start && dates.end)}
                  active={activePanel === "dates"}
                  onClick={() => setActivePanel(activePanel === "dates" ? null : "dates")}
                  delay={0}
                  missing={validation?.fields.dates.status === "missing"}
                />
                <FieldTrigger
                  icon={Users}
                  label="Who"
                  value={summarizePeople(people)}
                  filled
                  active={activePanel === "people"}
                  onClick={() => setActivePanel(activePanel === "people" ? null : "people")}
                  delay={0.05}
                  missing={validation?.fields.travelers.status === "missing"}
                />
                <FieldTrigger
                  icon={Wallet}
                  label="Budget"
                  value={`Up to ${formatBudgetShort(budget)}`}
                  filled
                  active={activePanel === "budget"}
                  onClick={() => setActivePanel(activePanel === "budget" ? null : "budget")}
                  delay={0.1}
                  missing={validation?.fields.budget.status === "missing"}
                />
              </div>

              <AnimatePresence mode="wait">
                {activePanel === "dates" && (
                  <DatePicker
                    key="dates"
                    value={dates}
                    onChange={setDates}
                    onClose={() => setActivePanel(null)}
                  />
                )}
                {activePanel === "people" && (
                  <PeopleSelector
                    key="people"
                    value={people}
                    onChange={setPeople}
                    onClose={() => setActivePanel(null)}
                  />
                )}
                {activePanel === "budget" && (
                  <BudgetSlider
                    key="budget"
                    value={budget}
                    onChange={setBudget}
                    onClose={() => setActivePanel(null)}
                  />
                )}
              </AnimatePresence>

              {/* Vibe selector */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="rounded-3xl border border-white/[0.06] bg-[#0a0a0a]/60 p-4 backdrop-blur-xl"
              >
                <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">
                  What's the vibe?
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {VIBES.map((v, i) => {
                    const Icon = v.icon;
                    const active = vibe === v.id;
                    return (
                      <motion.button
                        key={v.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                        onClick={() => setVibe(active ? null : v.id)}
                        whileHover={{ y: -2 }}
                        className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition-all ${
                          active
                            ? "border-white/15 bg-white/[0.04]"
                            : "border-white/[0.06] bg-white/[0.015] hover:border-white/12"
                        }`}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 ${v.gradient} ${
                            active ? "opacity-[0.18]" : "group-hover:opacity-[0.08]"
                          }`}
                        />
                        <div className="relative flex items-center gap-2">
                          <div
                            className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${v.gradient} shadow-md`}
                          >
                            <Icon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="text-sm text-white">{v.label}</span>
                          {active && (
                            <motion.span
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              className="ml-auto"
                            >
                              <Check className="h-4 w-4 text-emerald-300" />
                            </motion.span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Big CTA — refined */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                onClick={submit}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.99 }}
                className="group relative w-full overflow-hidden rounded-2xl py-4 text-[13px] font-semibold uppercase tracking-[0.28em] text-black"
                style={{
                  background:
                    "linear-gradient(135deg, #f5d27a 0%, #d4a86a 50%, #c98a3a 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.4), 0 25px 50px -15px rgba(212,168,106,0.5), 0 10px 20px -10px rgba(212,168,106,0.4)",
                }}
              >
                <span className="relative z-10 inline-flex items-center gap-3">
                  <Sparkles className="h-4 w-4" strokeWidth={2.4} />
                  Plan my {destination.trim()} trip
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={2.4} />
                </span>
                {/* Sweeping shine */}
                <span
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
                />
              </motion.button>

              {/* Generated query preview */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="text-center text-[11px] text-white/30"
              >
                <span className="text-white/45">Voya hears:</span>{" "}
                <span className="italic text-white/55">
                  "{buildQueryPreview(destination, dates, people, budget, vibe)}"
                </span>
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------- Helpers ----------

const FieldTrigger = ({
  icon: Icon,
  label,
  value,
  filled,
  active,
  onClick,
  delay,
  missing = false,
}: {
  icon: any;
  label: string;
  value: string;
  filled: boolean;
  active: boolean;
  onClick: () => void;
  delay: number;
  missing?: boolean;
}) => (
  <motion.button
    initial={{ opacity: 0, y: 8 }}
    animate={{
      opacity: 1,
      y: 0,
      boxShadow: missing ? ["0 0 0 0 rgba(251,146,60,0)", "0 0 0 4px rgba(251,146,60,0.15)", "0 0 0 0 rgba(251,146,60,0)"] : "none",
    }}
    transition={{
      duration: 0.4,
      delay,
      boxShadow: missing ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined,
    }}
    onClick={onClick}
    whileHover={{ y: -1 }}
    className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
      active
        ? "border-amber-400/40 bg-amber-400/[0.05]"
        : missing
          ? "border-orange-400/40 bg-orange-400/[0.04]"
          : filled
            ? "border-white/[0.08] bg-white/[0.025] hover:border-white/15"
            : "border-white/[0.06] bg-white/[0.015] hover:border-white/12"
    }`}
  >
    {missing && (
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-40" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-400" />
      </span>
    )}
    <div
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors ${
        active
          ? "bg-amber-400/[0.12] text-amber-300"
          : missing
            ? "bg-orange-400/[0.12] text-orange-300"
            : "bg-white/[0.03] text-white/65"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.8} />
    </div>
    <div className="min-w-0 flex-1">
      <p className={`text-[10px] font-medium uppercase tracking-[0.22em] ${missing ? "text-orange-300/60" : "text-white/35"}`}>
        {label}{missing && " ·  needed"}
      </p>
      <p className="truncate text-sm text-white/95">{value}</p>
    </div>
  </motion.button>
);

const formatRange = (start: Date, end: Date) => {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const s = start.toLocaleDateString("en-GB", opts);
  const e = end.toLocaleDateString("en-GB", opts);
  return `${s} → ${e}`;
};

const buildQueryPreview = (
  destination: string,
  dates: DateRange,
  people: People,
  budget: number,
  vibe: Vibe
) => {
  const parts: string[] = [destination.trim() || "..."];
  if (dates.start && dates.end) {
    const nights = Math.round(
      (dates.end.getTime() - dates.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (nights > 0) parts.push(`${nights} days`);
  }
  const total = people.adults + people.children;
  parts.push(`for ${total} ${total === 1 ? "person" : "people"}`);
  parts.push(`under ${formatBudgetShort(budget).toLowerCase()}`);
  if (vibe) parts.push(vibe);
  return parts.join(" ");
};

export default SmartSearch;
