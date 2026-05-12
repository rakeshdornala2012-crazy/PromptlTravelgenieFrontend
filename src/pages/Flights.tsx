import Nav from "@/components/Nav";
import FlightSearch from "@/components/FlightSearch";
import HotelSearch from "@/components/HotelSearch";
import CarSearch from "@/components/CarSearch";
import AttractionsSearch from "@/components/AttractionsSearch";
import VisaChecker from "@/components/VisaChecker";
import { motion } from "framer-motion";
import { useState } from "react";
import { Plane, Hotel, Car, Compass, FileCheck } from "lucide-react";

const TABS = [
  { key: "flights",     label: "Flights",     icon: Plane,      emoji: "✈️" },
  { key: "hotels",      label: "Hotels",      icon: Hotel,      emoji: "🏨" },
  { key: "cars",        label: "Cars",        icon: Car,        emoji: "🚗" },
  { key: "attractions", label: "Attractions", icon: Compass,    emoji: "🗺️" },
  { key: "visa",        label: "Visa",        icon: FileCheck,  emoji: "📋" },
] as const;

type Tab = (typeof TABS)[number]["key"];

const TAB_SUBTITLES: Record<Tab, string> = {
  flights:     "Real-time fares across hundreds of airlines",
  hotels:      "Best stays matched to your vibe and budget",
  cars:        "Self-drive & chauffeur rentals at your destination",
  attractions: "Top sights, experiences and hidden gems",
  visa:        "Instant visa requirement check for your passport",
};

export default function FlightsPage() {
  const [tab, setTab] = useState<Tab>("flights");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />

      <section className="relative pt-32 pb-10 px-4 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-20 h-80 bg-gradient-amber opacity-[0.04] blur-[140px]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-2xl">
          <h1 className="font-display text-5xl sm:text-6xl leading-tight">
            Plan every part<br />
            <span className="italic text-gradient-amber">of your journey</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-sm">{TAB_SUBTITLES[tab]}</p>
        </motion.div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-24">
        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl border border-border bg-secondary/30 p-1 mb-8 overflow-x-auto hide-scrollbar">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                tab === key ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {tab === "flights"     && <FlightSearch />}
          {tab === "hotels"      && <HotelSearch />}
          {tab === "cars"        && <CarSearch />}
          {tab === "attractions" && <AttractionsSearch />}
          {tab === "visa"        && <VisaChecker />}
        </motion.div>
      </div>
    </main>
  );
}
