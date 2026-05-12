import { motion } from "framer-motion";
import { Plane, Hotel, Compass, FileCheck, Lock, Check } from "lucide-react";

const ITEMS = [
  { icon: Plane, label: "Flights", detail: "DEL → MLE · Indigo", price: "₹22,400" },
  { icon: Hotel, label: "Stay", detail: "5 nights · Beach villa", price: "₹19,800" },
  { icon: Compass, label: "Activities", detail: "Snorkel + sunset cruise", price: "₹4,200" },
  { icon: FileCheck, label: "Visa", detail: "On arrival · 30 days", price: "₹1,800" },
];

const Checkout = () => {
  return (
    <section className="relative py-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-4 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-xs uppercase tracking-widest text-primary">The USP</div>
          <h2 className="mt-3 font-display text-4xl font-light leading-tight sm:text-6xl">
            Four bookings.<br />
            <span className="italic text-gradient-amber">One payment.</span>
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            No tab juggling. No price re-shocks. Voya locks every component,
            revalidates fares in real-time, and charges you exactly once.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Real-time price revalidation before checkout",
              "Refundable on a per-component basis",
              "Visa fees, taxes & service charges baked in",
            ].map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-8 -z-10 bg-gradient-aurora opacity-20 blur-3xl" />
          <div className="glass overflow-hidden rounded-3xl shadow-elegant">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Trip summary
                </div>
                <div className="font-display text-lg">Maldives · 5 nights</div>
              </div>
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] uppercase tracking-widest text-primary">
                Locked
              </span>
            </div>

            <div className="divide-y divide-border">
              {ITEMS.map((it, i) => (
                <motion.div
                  key={it.label}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
                    <it.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{it.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{it.detail}</div>
                  </div>
                  <div className="font-display text-base">{it.price}</div>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-border px-6 py-5">
              <div className="flex items-baseline justify-between">
                <div className="text-sm text-muted-foreground">Total · all-in</div>
                <div className="font-display text-3xl">₹48,200</div>
              </div>
              <button className="mt-4 group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-amber py-3.5 font-medium text-primary-foreground shadow-glow hover:scale-[1.01] transition-transform">
                <Lock className="h-4 w-4" />
                Pay once · book everything
              </button>
              <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
                Secured · revalidated · fully itemized
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Checkout;
