import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Car, Search, Loader2, Users, Fuel, Settings, Star, ArrowRight, MapPin } from "lucide-react";
import { searchCarRentals, DESTINATION_COORDS, type CarRental } from "@/lib/cars";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

const POPULAR_DESTINATIONS = ["Bali", "Dubai", "Goa", "Phuket", "Singapore", "Manali", "Maldives", "Bangkok"];

export default function CarSearch() {
  const [destination, setDestination] = useState("Goa");
  const [pickUpDate, setPickUpDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [dropOffDate, setDropOffDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 37);
    return d.toISOString().split("T")[0];
  });
  const [driverAge, setDriverAge] = useState(28);
  const [cars, setCars] = useState<CarRental[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const days = Math.max(1, Math.round((new Date(dropOffDate).getTime() - new Date(pickUpDate).getTime()) / 86400000));

  const handleSearch = async () => {
    const coords = DESTINATION_COORDS[destination.toLowerCase()];
    if (!coords) return;
    setLoading(true);
    setSearched(true);
    const results = await searchCarRentals({
      latitude: coords.lat,
      longitude: coords.lon,
      pickUpDate,
      dropOffDate,
      driverAge,
      currency: "INR",
    });
    setCars(results);
    setLoading(false);
  };

  return (
    <div className="w-full">
      <div className="glass rounded-3xl p-6 shadow-elegant">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 rounded-xl bg-primary/15 grid place-items-center">
            <Car className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-lg">Car Rentals</span>
        </div>

        <div className="mb-3">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Pick-up Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="City or destination"
              className="w-full rounded-xl border border-white/10 bg-secondary/50 pl-9 pr-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {POPULAR_DESTINATIONS.map((d) => (
            <button key={d} onClick={() => setDestination(d)}
              className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${destination === d ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:border-white/20"}`}>
              {d}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Pick-up Date</label>
            <input type="date" value={pickUpDate} onChange={(e) => setPickUpDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl border border-white/10 bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary/40" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Drop-off Date</label>
            <input type="date" value={dropOffDate} onChange={(e) => setDropOffDate(e.target.value)} min={pickUpDate}
              className="w-full rounded-xl border border-white/10 bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary/40" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Driver Age</label>
            <input type="number" value={driverAge} onChange={(e) => setDriverAge(Number(e.target.value))} min={21} max={75}
              className="w-full rounded-xl border border-white/10 bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary/40" />
          </div>
        </div>

        <button onClick={handleSearch} disabled={loading || !DESTINATION_COORDS[destination.toLowerCase()]}
          className="w-full rounded-xl bg-gradient-amber py-3 font-medium text-sm text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? "Searching cars..." : `Search Cars · ${days} day${days > 1 ? "s" : ""}`}
        </button>

        {destination && !DESTINATION_COORDS[destination.toLowerCase()] && (
          <p className="mt-2 text-center text-[11px] text-amber-400">
            Try one of the popular destinations above — car rental coverage varies by region.
          </p>
        )}
      </div>

      <AnimatePresence>
        {searched && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg">
                {loading ? "Searching..." : `${cars.length} cars in ${destination}`}
              </h3>
              {!loading && <span className="text-xs text-muted-foreground">{days} day{days > 1 ? "s" : ""} rental</span>}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="glass rounded-2xl p-4 animate-pulse space-y-3">
                    <div className="h-28 bg-white/5 rounded-xl" />
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                    <div className="h-3 w-1/2 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cars.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="glass rounded-2xl overflow-hidden hover:border-primary/20 transition-colors group cursor-pointer">
                    <div className="relative h-32 bg-secondary/40">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-16 w-16 text-white/10" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="rounded-full bg-black/50 backdrop-blur px-2.5 py-0.5 text-[10px] text-white uppercase tracking-widest">
                          {c.category}
                        </span>
                      </div>
                      {c.rating > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur px-2 py-0.5 text-xs text-white">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {c.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-display text-base mb-0.5">{c.name}</div>
                      <div className="text-xs text-muted-foreground mb-3">{c.company}</div>

                      <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.seats} seats</span>
                        <span className="flex items-center gap-1"><Settings className="h-3 w-3" />{c.transmission}</span>
                        {c.ac && <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />AC</span>}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {c.features.slice(0, 3).map((f) => (
                          <span key={f} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground">{f}</span>
                        ))}
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <div className="font-display text-lg text-primary">{inr(c.pricePerDay)}<span className="text-xs text-muted-foreground">/day</span></div>
                          <div className="text-[10px] text-muted-foreground">{inr(c.pricePerDay * days)} total · {days} days</div>
                        </div>
                        <button className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Book <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && cars.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <div className="text-3xl mb-2">🚗</div>
                <div className="text-sm">No cars found for {destination}</div>
                <div className="text-xs mt-1">Try a different destination or dates</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
