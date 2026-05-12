import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Nav from "@/components/Nav";
import PlannerSearch from "@/components/planner/PlannerSearch";
import PlannerWorking from "@/components/planner/PlannerWorking";
import PlannerOptions from "@/components/planner/PlannerOptions";
import PlannerRevalidate from "@/components/planner/PlannerRevalidate";
import PlannerCheckout from "@/components/planner/PlannerCheckout";
import { TripOption } from "@/components/planner/data";
import VoyaVoice from "@/components/VoyaVoice";

type Step = "search" | "working" | "options" | "revalidate" | "checkout";

const Plan = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [step, setStep] = useState<Step>(initialQuery ? "working" : "search");
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<TripOption | null>(null);
  const [aiTripOptions, setAiTripOptions] = useState<TripOption[]>([]);
  const [revalidatedTotal, setRevalidatedTotal] = useState(0);
  const [deltas, setDeltas] = useState<Record<string, number>>({});

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === "search" && (
            <PlannerSearch
              onSubmit={(q) => {
                setQuery(q);
                setStep("working");
              }}
            />
          )}
          {step === "working" && (
            <PlannerWorking
              query={query}
              onComplete={(opts) => {
                if (opts && opts.length > 0) {
                  setAiTripOptions(opts);
                }
                setStep("options");
              }}
            />
          )}
          {step === "options" && (
            <PlannerOptions
              query={query}
              options={aiTripOptions}
              onBack={() => setStep("search")}
              onSelect={(opt) => {
                setSelected(opt);
                setStep("revalidate");
              }}
            />
          )}
          {step === "revalidate" && selected && (
            <PlannerRevalidate
              option={selected}
              onComplete={(total, d) => {
                setRevalidatedTotal(total);
                setDeltas(d);
                setStep("checkout");
              }}
            />
          )}
          {step === "checkout" && selected && (
            <PlannerCheckout
              option={selected}
              total={revalidatedTotal}
              deltas={deltas}
              onBack={() => setStep("options")}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <VoyaVoice
        onSearch={(q) => {
          setQuery(q);
          setStep("working");
        }}
      />
    </main>
  );
};

export default Plan;
