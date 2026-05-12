import { motion } from "framer-motion";
import { Plane, Hotel, Compass, FileCheck, UtensilsCrossed, CloudSun } from "lucide-react";

const AGENTS = [
  { icon: Plane, name: "Flight", desc: "Routes, fares, layovers — optimized.", delay: 0 },
  { icon: Hotel, name: "Hotel", desc: "Stays matched to your vibe and budget.", delay: 0.05 },
  { icon: Compass, name: "Activities", desc: "Curated experiences, not tourist traps.", delay: 0.1 },
  { icon: FileCheck, name: "Visa", desc: "Requirements, docs, processing time.", delay: 0.15 },
  { icon: UtensilsCrossed, name: "Food", desc: "Where locals actually eat.", delay: 0.2 },
  { icon: CloudSun, name: "Climate", desc: "Best windows by weather and season.", delay: 0.25 },
];

const Agents = () => {
  return (
    <section id="agents" className="relative py-32">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <div className="text-xs uppercase tracking-widest text-primary">The system</div>
          <h2 className="mt-3 font-display text-4xl font-light leading-tight sm:text-6xl">
            Six agents.<br />
            <span className="italic text-muted-foreground">One itinerary.</span>
          </h2>
          <p className="mt-5 max-w-lg text-muted-foreground">
            Behind every trip, a swarm of specialized AI agents works in parallel —
            negotiating trade-offs so you don't have to.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((a) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: a.delay, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-gradient-card p-6 shadow-card transition-all hover:border-primary/30 hover:shadow-glow"
            >
              <div className="mb-12 flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary group-hover:bg-gradient-amber transition-all">
                  <a.icon className="h-5 w-5 text-foreground group-hover:text-primary-foreground" />
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Agent
                </div>
              </div>
              <h3 className="font-display text-2xl">{a.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{a.desc}</p>
              <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Agents;
