import { motion } from "framer-motion";
import { Plane, Hotel, Compass, FileCheck, Loader2, Check, ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { TripOption } from "./data";
import Skeleton from "./Skeleton";

const ICONS = { flight: Plane, hotel: Hotel, activity: Compass, visa: FileCheck };

type RowState = "checking" | "same" | "down" | "up";

type Props = {
  option: TripOption;
  onComplete: (revalidatedTotal: number, deltas: Record<string, number>) => void;
};

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

const PlannerRevalidate = ({ option, onComplete }: Props) => {
  const baseRows = [
    { key: "flight", label: "Flight", sub: `${option.flight.route} · ${option.flight.carrier}`, price: option.flight.price, delta: -300 },
    { key: "hotel", label: "Hotel", sub: option.hotel.name, price: option.hotel.price, delta: 0 },
    { key: "activity", label: "Activities", sub: `${option.activities.count} curated`, price: option.activities.price, delta: 200 },
    { key: "visa", label: "Visa", sub: option.visa.type, price: option.visa.price, delta: 0 },
  ];

  const [states, setStates] = useState<Record<string, RowState>>({
    flight: "checking",
    hotel: "checking",
    activity: "checking",
    visa: "checking",
  });

  useEffect(() => {
    const timers: number[] = [];
    baseRows.forEach((r, i) => {
      timers.push(
        window.setTimeout(() => {
          setStates((s) => ({
            ...s,
            [r.key]: r.delta === 0 ? "same" : r.delta < 0 ? "down" : "up",
          }));
        }, 700 + i * 600)
      );
    });
    timers.push(
      window.setTimeout(() => {
        const deltas = Object.fromEntries(baseRows.map((r) => [r.key, r.delta]));
        const newTotal = baseRows.reduce((sum, r) => sum + r.price + r.delta, 0);
        onComplete(newTotal, deltas);
      }, 700 + baseRows.length * 600 + 900)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allDone = Object.values(states).every((s) => s !== "checking");
  const newTotal = baseRows.reduce((s, r) => s + r.price + (states[r.key] === "checking" ? 0 : r.delta), 0);

  return (
    <div className="relative min-h-screen bg-background pt-32 pb-20">
      <div className="pointer-events-none absolute inset-x-0 top-20 h-96 bg-gradient-amber opacity-[0.06] blur-[140px]" />

      <div className="relative mx-auto max-w-xl px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            {allDone ? <Check className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
            {allDone ? "Prices locked" : "Revalidating prices"}
          </div>
          <h1 className="mt-5 font-display text-3xl font-light leading-tight sm:text-4xl">
            Confirming live fares for<br />
            <span className="italic text-gradient-amber">{option.destination}</span>
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            We re-check every component before you pay. No price surprises.
          </p>
        </motion.div>

        <div className="mt-10 glass overflow-hidden rounded-3xl shadow-elegant">
          <div className="divide-y divide-border">
            {baseRows.map((r, i) => {
              const Icon = ICONS[r.key as keyof typeof ICONS];
              const state = states[r.key];
              const checking = state === "checking";
              return (
                <motion.div
                  key={r.key}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-3 px-5 py-4"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{r.label}</div>
                    <div className="truncate text-xs text-muted-foreground">{r.sub}</div>
                  </div>
                  <div className="text-right">
                    {checking ? (
                      <div className="space-y-1">
                        <Skeleton className="ml-auto h-4 w-16" />
                        <Skeleton className="ml-auto h-2.5 w-10" />
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-0.5"
                      >
                        <div className="font-display text-base">
                          {r.price + r.delta === 0 ? "Free" : inr(r.price + r.delta)}
                        </div>
                        {state === "same" ? (
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            No change
                          </div>
                        ) : state === "down" ? (
                          <div className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-widest text-primary">
                            <ArrowDown className="h-2.5 w-2.5" />
                            {inr(Math.abs(r.delta))} cheaper
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-widest text-destructive">
                            <ArrowUp className="h-2.5 w-2.5" />
                            +{inr(r.delta)}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="border-t border-border bg-secondary/30 px-5 py-4 flex items-baseline justify-between">
            <div className="text-xs text-muted-foreground">New total</div>
            <motion.div
              key={newTotal}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl"
            >
              {inr(newTotal)}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerRevalidate;
