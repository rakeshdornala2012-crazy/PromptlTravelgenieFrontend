import { motion } from "framer-motion";
import worldMap from "@/assets/world-map.jpg";

const PINS = [
  { x: 22, y: 48, label: "Mexico City", price: "₹38K" },
  { x: 47, y: 38, label: "Lisbon", price: "₹42K" },
  { x: 53, y: 36, label: "Rome", price: "₹46K" },
  { x: 62, y: 52, label: "Dubai", price: "₹28K" },
  { x: 68, y: 56, label: "Maldives", price: "₹48K" },
  { x: 75, y: 54, label: "Bali", price: "₹54K" },
  { x: 82, y: 42, label: "Tokyo", price: "₹71K" },
  { x: 30, y: 62, label: "Lima", price: "₹89K" },
];

const Map = () => {
  return (
    <section id="explore" className="relative py-32">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <div className="text-xs uppercase tracking-widest text-primary">Explore mode</div>
          <h2 className="mt-3 font-display text-4xl font-light leading-tight sm:text-6xl">
            Don't know<br />
            <span className="italic text-muted-foreground">where to go?</span>
          </h2>
          <p className="mt-5 max-w-lg text-muted-foreground">
            Set a budget. Watch the world light up with what's possible.
            Hover anywhere to see live fares and the best month to fly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="relative mt-12 overflow-hidden rounded-3xl border border-border bg-gradient-card shadow-elegant"
        >
          <div className="relative aspect-[16/9] w-full">
            <img
              src={worldMap}
              alt="Stylized world map with destination price markers"
              loading="lazy"
              width={1920}
              height={1080}
              className="h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/80" />

            {PINS.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.07 }}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-8 w-8 animate-ping rounded-full bg-primary/30" />
                  <div className="relative h-3 w-3 rounded-full bg-gradient-amber shadow-glow" />
                </div>
                <div className="pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2 whitespace-nowrap rounded-full glass px-2.5 py-1 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-foreground">{p.label}</span>
                  <span className="ml-1.5 text-primary">{p.price}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* legend */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 sm:bottom-6 sm:left-6 sm:right-6">
            <div className="glass rounded-2xl px-4 py-2.5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Budget
              </div>
              <div className="font-display text-lg">Under ₹60,000</div>
            </div>
            <div className="glass flex items-center gap-3 rounded-2xl px-4 py-2.5">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-gradient-amber" />
                <span className="text-muted-foreground">Live fare</span>
              </div>
              <div className="text-xs text-muted-foreground">8 destinations match</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Map;
