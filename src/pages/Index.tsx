import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Globe, Zap, Shield, MapPin } from "lucide-react";
import Nav from "@/components/Nav";
import Agents from "@/components/Agents";
import Map from "@/components/Map";
import Trips from "@/components/Trips";
import Checkout from "@/components/Checkout";
import Footer from "@/components/Footer";
import VoyaVoice from "@/components/VoyaVoice";
import SmartSearch from "@/components/smart/SmartSearch";

const VIBES = ["Adventure", "Relaxation", "Cultural", "Romantic", "Luxury", "Budget-Friendly"];

const DESTINATIONS = [
  { name: "Bali", country: "Indonesia", emoji: "🏝", nights: 5, from: "₹2.8L" },
  { name: "Santorini", country: "Greece", emoji: "🏛", nights: 4, from: "₹3.5L" },
  { name: "Kyoto", country: "Japan", emoji: "⛩", nights: 6, from: "₹4.1L" },
  { name: "Maldives", country: "Indian Ocean", emoji: "🐚", nights: 4, from: "₹5.2L" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Tell us your dream", desc: "Describe your perfect trip in natural language", icon: Sparkles },
  { step: "02", title: "AI crafts your plan", desc: "Our concierge builds a day-by-day itinerary", icon: Zap },
  { step: "03", title: "Refine with chat", desc: "Modify anything — budget, activities, hotels", icon: Globe },
  { step: "04", title: "Book & go", desc: "One-click booking for flights, stays, experiences", icon: Shield },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* ═══ HERO ═══ */}
      <section className="relative px-4 pt-32 pb-20 lg:pt-40 lg:pb-28">
        {/* Atmospheric glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-0 h-[600px] w-[1100px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse, hsl(35 80% 58% / 0.2) 0%, hsl(0 70% 55% / 0.04) 40%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium tracking-widest uppercase text-primary">
              AI-Powered Travel Concierge
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-6xl leading-[1.05] text-foreground lg:text-7xl xl:text-8xl"
          >
            Travel planned{" "}
            <span className="italic text-gradient-amber">promptly,</span>
            <br />
            perfected personally
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mx-auto mt-6 max-w-xl text-base text-muted-foreground lg:text-lg leading-relaxed"
          >
            Tell our AI concierge your dream trip. Get a curated, day-by-day
            luxury itinerary — flights, stays, experiences — in seconds.
          </motion.p>

          {/* Primary search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mx-auto mt-10 lg:mt-12"
          >
            <SmartSearch />
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="border-t border-border px-4 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 text-center">
          <Stat value="6" label="AI agents working in parallel" />
          <Stat value="1" label="Checkout for the entire trip" />
          <Stat value="190+" label="Countries with visa intel" />
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="px-4 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">How It Works</p>
            <h2 className="font-display text-4xl lg:text-5xl leading-tight">
              Four steps to your dream trip
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="group rounded-2xl border border-border bg-gradient-card p-6 transition-all duration-300 hover:border-primary/20 hover:-translate-y-1 hover:shadow-card"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="font-mono text-[11px] text-primary/60 mb-2">{item.step}</p>
                <h3 className="text-base font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CURATED DESTINATIONS ═══ */}
      <section className="px-4 py-20 lg:py-28 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">Popular Destinations</p>
            <h2 className="font-display text-4xl lg:text-5xl leading-tight">
              Curated itineraries, ready to go
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DESTINATIONS.map((dest, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                onClick={() =>
                  navigate(`/plan?q=${encodeURIComponent(`Plan me a ${dest.nights}-night luxury trip to ${dest.name}`)}`)
                }
                className="group cursor-pointer rounded-2xl border border-border bg-gradient-card p-6 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="text-4xl mb-5">{dest.emoji}</div>
                <h3 className="font-display text-xl mb-1">{dest.name}</h3>
                <p className="text-sm text-muted-foreground mb-5">{dest.country}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground/60">{dest.nights} nights</span>
                  <span className="text-sm font-medium text-primary">from {dest.from}</span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-primary/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Plan this trip</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Existing sections */}
      <Agents />
      <Map />
      <Trips />
      <Checkout />
      <Footer />

      <VoyaVoice onSearch={(q) => navigate(`/plan?q=${encodeURIComponent(q)}`)} />
    </main>
  );
};

const Stat = ({ value, label }: { value: string; label: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <p className="font-display text-4xl text-foreground lg:text-5xl">{value}</p>
    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
  </motion.div>
);

export default Index;
