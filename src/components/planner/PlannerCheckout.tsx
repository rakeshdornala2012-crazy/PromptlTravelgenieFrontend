import { motion } from "framer-motion";
import { ArrowLeft, Lock, Plane, Hotel, Compass, FileCheck, ShieldCheck, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { TripOption } from "./data";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

type Props = {
  option: TripOption;
  total: number;
  deltas: Record<string, number>;
  onBack: () => void;
};

const PlannerCheckout = ({ option, total, deltas, onBack }: Props) => {
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [email, setEmail] = useState("");
  const [card, setCard] = useState("");

  const items = [
    { key: "flight", icon: Plane, label: "Flight", sub: `${option.flight.route} · ${option.flight.carrier}`, price: option.flight.price + deltas.flight },
    { key: "hotel", icon: Hotel, label: "Stay", sub: `${option.nights} nights · ${option.hotel.name}`, price: option.hotel.price + deltas.hotel },
    { key: "activity", icon: Compass, label: "Activities", sub: `${option.activities.count} experiences`, price: option.activities.price + deltas.activity },
    { key: "visa", icon: FileCheck, label: "Visa", sub: option.visa.type, price: option.visa.price + deltas.visa },
  ];

  const taxes = Math.round(total * 0.05);
  const grand = total + taxes;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paying || paid) return;
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaid(true);
    }, 2200);
  };

  if (paid) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-hero noise pt-32 pb-20">
        <div className="pointer-events-none absolute inset-x-0 top-20 h-96 bg-gradient-amber opacity-[0.1] blur-[140px]" />
        <div className="relative mx-auto max-w-lg px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-amber shadow-glow"
          >
            <Check className="h-9 w-9 text-primary-foreground" strokeWidth={3} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 font-display text-4xl font-light leading-tight sm:text-5xl"
          >
            You're going to<br />
            <span className="italic text-gradient-amber">{option.destination}.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            Itinerary, vouchers and visa instructions sent. Voya will check in on you 24h before you fly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs text-muted-foreground"
          >
            Booking ID · VYA-{Math.random().toString(36).slice(2, 8).toUpperCase()}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background pt-28 pb-20">
      <div className="mx-auto max-w-5xl px-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to options
        </button>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
          {/* form */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onSubmit={submit}
            className="glass rounded-3xl p-6 shadow-card sm:p-8"
          >
            <h1 className="font-display text-3xl font-light leading-tight sm:text-4xl">
              One payment.<br />
              <span className="italic text-muted-foreground">Everything booked.</span>
            </h1>

            <div className="mt-8 space-y-5">
              <div>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@somewhere.com"
                  className="mt-1.5 w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Card details</label>
                <input
                  required
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className="mt-1.5 w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input placeholder="MM / YY" className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                  <input placeholder="CVC" className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                <div>
                  Voya only charges you once. Per-component refunds available up to 24h before travel.
                </div>
              </div>

              <button
                type="submit"
                disabled={paying || !email || !card}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-amber py-3.5 font-medium text-primary-foreground shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:scale-[1.01]"
              >
                {paying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Booking flight, hotel, activities, visa…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Pay {inr(grand)} · book everything
                  </>
                )}
              </button>
            </div>
          </motion.form>

          {/* summary */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card lg:sticky lg:top-28"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Trip summary
                </div>
                <div className="font-display text-xl mt-0.5">
                  {option.destination} · {option.nights} nights
                </div>
              </div>
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] uppercase tracking-widest text-primary">
                Locked
              </span>
            </div>

            <div className="mt-5 divide-y divide-border">
              {items.map((it) => (
                <div key={it.key} className="flex items-start gap-3 py-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-secondary">
                    <it.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs">{it.label}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{it.sub}</div>
                  </div>
                  <div className="text-sm font-medium">
                    {it.price === 0 ? "Free" : inr(it.price)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{inr(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & fees</span>
                <span>{inr(taxes)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
              <div className="text-sm">Total</div>
              <div className="font-display text-2xl">{inr(grand)}</div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

export default PlannerCheckout;
