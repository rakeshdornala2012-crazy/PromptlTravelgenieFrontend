import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  Lock,
  Plane,
  Bed,
  MapPin,
  FileCheck,
  Check,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Nav from "@/components/Nav";
import PageTransition from "@/components/PageTransition";
import { useCurrency } from "@/lib/currency";
import { useTrips } from "@/hooks/useTrips";

const Checkout = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const destination = params.get("dest") || "Bali";
  const { format } = useCurrency();
  const { addTrip } = useTrips();

  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const summary = {
    flight: 37500,
    hotel: 36000,
    activities: 12700,
    visa: 1800,
  };
  const subtotal = Object.values(summary).reduce((a, b) => a + b, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const handleSubmit = () => {
    setStep("processing");
    setTimeout(() => {
      addTrip({
        destination,
        country: "Indonesia",
        nights: 5,
        total,
        startDate: "2026-06-12",
        endDate: "2026-06-16",
        status: "upcoming",
        emoji: "🌴",
      });
      setStep("success");
    }, 1800);
  };

  return (
    <PageTransition>
      <main className="min-h-screen bg-background text-foreground">
        <Nav />

        <section className="pt-32 pb-20 px-4">
          <div className="mx-auto max-w-5xl">
            {step === "form" && (
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="h-3 w-3" /> Back to itinerary
              </button>
            )}

            <AnimatePresence mode="wait">
              {step === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-5 gap-6"
                >
                  {/* Left: Payment form */}
                  <div className="lg:col-span-3">
                    <h1 className="font-display text-4xl font-light leading-tight mb-2">
                      One booking, <span className="italic text-primary">one payment</span>
                    </h1>
                    <p className="text-sm text-muted-foreground mb-8">
                      Flights, hotels, activities, and visa — all in one go.
                    </p>

                    <div className="space-y-4 rounded-3xl border border-white/10 bg-secondary/30 p-6">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">
                          Card number
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={card.number}
                            onChange={(e) =>
                              setCard({ ...card, number: e.target.value })
                            }
                            placeholder="1234 5678 9012 3456"
                            className="w-full rounded-2xl border border-white/10 bg-background pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">
                          Cardholder name
                        </label>
                        <input
                          type="text"
                          value={card.name}
                          onChange={(e) =>
                            setCard({ ...card, name: e.target.value })
                          }
                          placeholder="As shown on card"
                          className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block">
                            Expiry
                          </label>
                          <input
                            type="text"
                            value={card.expiry}
                            onChange={(e) =>
                              setCard({ ...card, expiry: e.target.value })
                            }
                            placeholder="MM/YY"
                            className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={card.cvv}
                            onChange={(e) =>
                              setCard({ ...card, cvv: e.target.value })
                            }
                            placeholder="123"
                            className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-300">
                        <Lock className="h-3 w-3" />
                        Secured by 256-bit encryption · Mock payment for demo
                      </div>

                      <button
                        onClick={handleSubmit}
                        className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Sparkles className="h-4 w-4" />
                        Pay {format(total)} & confirm trip
                      </button>
                    </div>
                  </div>

                  {/* Right: Trip summary */}
                  <div className="lg:col-span-2">
                    <div className="sticky top-24 rounded-3xl border border-white/10 bg-gradient-card p-6">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        Your trip
                      </div>
                      <div className="font-display text-2xl mb-4">
                        {destination} · 5 nights
                      </div>

                      <div className="space-y-3 border-y border-white/10 py-4">
                        {[
                          { icon: Plane, label: "Flights (return)", amt: summary.flight },
                          { icon: Bed, label: "Hotel · 5 nights", amt: summary.hotel },
                          { icon: MapPin, label: "Activities · 12 booked", amt: summary.activities },
                          { icon: FileCheck, label: "Visa on arrival", amt: summary.visa },
                        ].map((row) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2.5">
                              <row.icon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{row.label}</span>
                            </div>
                            <span className="tabular-nums">{format(row.amt)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Subtotal</span>
                          <span className="tabular-nums">{format(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Taxes & fees</span>
                          <span className="tabular-nums">{format(tax)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <span className="font-medium">Total</span>
                          <span className="font-display text-2xl text-primary tabular-nums">
                            {format(total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-h-[60vh] grid place-items-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="mx-auto h-16 w-16 rounded-full border-2 border-white/10 border-t-primary mb-6"
                    />
                    <div className="font-display text-2xl mb-2">Processing payment</div>
                    <div className="text-sm text-muted-foreground">
                      Confirming your trip · this only takes a moment
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="min-h-[60vh] grid place-items-center"
                >
                  <div className="text-center max-w-md">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.1,
                      }}
                      className="mx-auto h-20 w-20 rounded-full bg-emerald-500/20 grid place-items-center mb-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                      >
                        <Check className="h-10 w-10 text-emerald-400" strokeWidth={3} />
                      </motion.div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="font-display text-3xl mb-2">
                        Your trip is booked
                      </div>
                      <div className="text-sm text-muted-foreground mb-8">
                        {destination} · Jun 12 – 16, 2026 · {format(total)} charged
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => navigate("/trips")}
                          className="rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          View my trips
                        </button>
                        <button
                          onClick={() => navigate("/")}
                          className="rounded-2xl border border-white/10 px-6 py-3 text-sm hover:bg-secondary/60 transition-colors"
                        >
                          Back home
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </PageTransition>
  );
};

export default Checkout;
