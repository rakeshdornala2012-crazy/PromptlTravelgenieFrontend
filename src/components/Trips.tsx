import { motion } from "framer-motion";
import { ArrowUpRight, Plane, Hotel, Compass, Star } from "lucide-react";
import beach from "@/assets/trip-beach.jpg";
import mountains from "@/assets/trip-mountains.jpg";
import city from "@/assets/trip-city.jpg";

const TRIPS = [
  {
    img: beach,
    tier: "Budget",
    title: "Maldives, slow and sunlit",
    nights: "5 nights",
    price: "₹48,200",
    highlights: ["Direct flight", "Beach villa", "2 excursions"],
    rating: 4.7,
  },
  {
    img: mountains,
    tier: "Balanced",
    title: "Swiss Alps, snow and silence",
    nights: "7 nights",
    price: "₹1,12,500",
    highlights: ["1 stop", "Mountain chalet", "Ski + spa"],
    rating: 4.9,
    featured: true,
  },
  {
    img: city,
    tier: "Premium",
    title: "Tokyo, neon and ceremony",
    nights: "8 nights",
    price: "₹2,38,000",
    highlights: ["Business class", "Ginza suite", "Private guide"],
    rating: 4.95,
  },
];

const Trips = () => {
  return (
    <section id="trips" className="relative py-32">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">Decision UI</div>
            <h2 className="mt-3 font-display text-4xl font-light leading-tight sm:text-6xl">
              Three lives,<br />
              <span className="italic text-muted-foreground">one tap apart.</span>
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground">
            Voya never gives you ten options. It gives you the right three —
            tuned to your budget and mood.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {TRIPS.map((t, i) => (
            <motion.article
              key={t.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className={`group relative overflow-hidden rounded-3xl border bg-gradient-card shadow-card transition-all ${
                t.featured ? "border-primary/40 shadow-glow lg:scale-[1.02]" : "border-border hover:border-primary/30"
              }`}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={t.img}
                  alt={t.title}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="h-full w-full object-cover transition-transform duration-[1.6s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest ${
                    t.featured ? "bg-gradient-amber text-primary-foreground" : "glass text-foreground"
                  }`}>
                    {t.tier}
                  </span>
                  {t.featured && (
                    <span className="glass rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest text-foreground">
                      Voya pick
                    </span>
                  )}
                </div>
                <div className="absolute top-4 right-4 glass flex items-center gap-1 rounded-full px-2.5 py-1 text-xs">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  {t.rating}
                </div>
              </div>

              <div className="relative -mt-20 p-6 pt-0">
                <h3 className="font-display text-2xl leading-tight">{t.title}</h3>
                <div className="mt-1 text-sm text-muted-foreground">{t.nights}</div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {t.highlights.map((h, idx) => {
                    const Icons = [Plane, Hotel, Compass];
                    const Ic = Icons[idx % 3];
                    return (
                      <span key={h} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                        <Ic className="h-3 w-3" /> {h}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      All-in
                    </div>
                    <div className="font-display text-3xl">{t.price}</div>
                  </div>
                  <button className="group/btn inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors">
                    Book trip
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Trips;
