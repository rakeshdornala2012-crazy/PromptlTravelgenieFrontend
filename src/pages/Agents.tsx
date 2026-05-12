import { motion } from "framer-motion";
import { Plane, Hotel, Compass, FileCheck, UtensilsCrossed, CloudSun, ArrowRight, Zap, Shield, Clock } from "lucide-react";
import Nav from "@/components/Nav";

const AGENTS = [
  {
    key: "flight",
    icon: Plane,
    name: "Flight Agent",
    tagline: "Finds the best routes & fares",
    description: "Scans 200+ airlines and OTAs in real-time. Compares layovers, cabin classes, and hidden fees to find your perfect flight.",
    capabilities: ["Real-time fare tracking", "Multi-city routing", "Baggage fee analysis", "Seat map optimization"],
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/15 text-blue-400",
    stat: "200+ airlines",
  },
  {
    key: "hotel",
    icon: Hotel,
    name: "Hotel Agent",
    tagline: "Matches stays to your vibe",
    description: "Reads 10,000+ reviews and analyses location, amenities, and value to shortlist hotels that actually match your travel style.",
    capabilities: ["Review sentiment analysis", "Location scoring", "Price history tracking", "Room type matching"],
    color: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/15 text-amber-400",
    stat: "10K+ properties",
  },
  {
    key: "activity",
    icon: Compass,
    name: "Activity Agent",
    tagline: "Curates experiences you'll love",
    description: "Understands your interests and builds a day-by-day activity plan — balancing must-sees with hidden gems locals love.",
    capabilities: ["Interest profiling", "Seasonal availability", "Crowd prediction", "Local insider tips"],
    color: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/15 text-emerald-400",
    stat: "50K+ experiences",
  },
  {
    key: "visa",
    icon: FileCheck,
    name: "Visa Agent",
    tagline: "Handles the paperwork headache",
    description: "Checks visa requirements for your passport, calculates processing times, and tells you exactly what documents you need.",
    capabilities: ["190+ country database", "Processing time estimates", "Document checklist", "Embassy contact info"],
    color: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/15 text-purple-400",
    stat: "190+ countries",
  },
  {
    key: "food",
    icon: UtensilsCrossed,
    name: "Food Agent",
    tagline: "Finds where locals actually eat",
    description: "Goes beyond tourist traps to surface authentic dining experiences — from Michelin stars to the best street food stalls.",
    capabilities: ["Cuisine preference matching", "Dietary restriction filtering", "Neighbourhood mapping", "Reservation timing"],
    color: "from-rose-500/20 to-rose-600/5",
    border: "border-rose-500/20",
    iconBg: "bg-rose-500/15 text-rose-400",
    stat: "1M+ restaurants",
  },
  {
    key: "climate",
    icon: CloudSun,
    name: "Climate Agent",
    tagline: "Picks the perfect time to go",
    description: "Analyses 10 years of weather data to tell you when to go, what to pack, and which days to avoid outdoor activities.",
    capabilities: ["Historical weather patterns", "Packing recommendations", "Event conflict checks", "UV & humidity alerts"],
    color: "from-cyan-500/20 to-cyan-600/5",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/15 text-cyan-400",
    stat: "10yr weather data",
  },
];

const HOW_IT_WORKS = [
  { icon: Zap, title: "You describe your trip", desc: "In plain language — destination, budget, vibe, dates. No forms." },
  { icon: Shield, title: "Agents run in parallel", desc: "All 6 agents spin up simultaneously, each becoming an expert on one part of your trip." },
  { icon: Clock, title: "Results in seconds", desc: "Agents collaborate, cross-check, and surface 3 curated options tailored exactly to you." },
];

const Agents = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 text-center px-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-20 h-96 bg-gradient-amber opacity-[0.06] blur-[140px]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            6 specialist AI agents
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-light leading-tight">
            Meet your
            <br />
            <span className="italic text-primary">travel team.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Every Voya trip is planned by 6 specialist AI agents working in parallel — each an expert in one part of your journey.
          </p>
          <motion.a
            href="/plan"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Let them plan your trip
            <ArrowRight className="h-4 w-4" />
          </motion.a>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="font-display text-lg mb-1">{step.title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent cards */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-light">The specialists</h2>
            <p className="mt-3 text-muted-foreground">Each agent is trained for one job — and does it exceptionally well.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AGENTS.map((agent, i) => (
              <motion.div
                key={agent.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-3xl border ${agent.border} bg-gradient-to-br ${agent.color} p-6 backdrop-blur`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`grid h-11 w-11 place-items-center rounded-2xl ${agent.iconBg}`}>
                    <agent.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground border border-white/10 rounded-full px-2 py-0.5">
                    {agent.stat}
                  </span>
                </div>

                <div className="font-display text-xl mb-0.5">{agent.name}</div>
                <div className="text-xs text-primary mb-3">{agent.tagline}</div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{agent.description}</p>

                {/* Capabilities */}
                <div className="space-y-1.5">
                  {agent.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                      {cap}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-light mb-4">
            Ready to meet <span className="italic text-primary">your team?</span>
          </h2>
          <p className="text-muted-foreground mb-8">Tell Voya where you want to go — your agents will handle everything else.</p>
          <motion.a
            href="/plan"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground"
          >
            Start planning
            <ArrowRight className="h-4 w-4" />
          </motion.a>
        </motion.div>
      </section>
    </main>
  );
};

export default Agents;