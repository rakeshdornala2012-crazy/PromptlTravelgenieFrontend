import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Hotel, Search, Star, Wifi, Loader2, MapPin, ArrowRight } from "lucide-react";
import { searchHotels, type Hotel as HotelType } from "@/lib/hotels";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

const POPULAR_DESTINATIONS = ["Bali", "Maldives", "Dubai", "Goa", "Singapore", "Phuket", "Manali", "Kyoto"];

export default function HotelSearch() {
  const [destination, setDestination] = useState("Bali");
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 37);
    return d.toISOString().split("T")[0];
  });
  const [adults, setAdults] = useState(2);
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    const results = await searchHotels({ destination, checkIn, checkOut, adults, currency: "INR" });
    setHotels(results);
    setLoading(false);
  };

  return (
    <div className="w-full">
      <div className="glass rounded-3xl p-6 shadow-elegant">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 rounded-xl bg-primary/15 grid place-items-center">
            <Hotel className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-lg">Search Hotels</span>
        </div>

        <div className="mb-3">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Destination</label>
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
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Check-in</label>
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl border border-white/10 bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary/40" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Check-out</label>
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn}
              className="w-full rounded-xl border border-white/10 bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary/40" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Guests</label>
            <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-secondary/50 px-4 py-3 text-sm outline-none appearance-none">
              {[1,2,3,4].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}
            </select>
          </div>
        </div>

        <button onClick={handleSearch} disabled={loading}
          className="w-full rounded-xl bg-gradient-amber py-3 font-medium text-sm text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? "Searching hotels..." : `Search Hotels · ${nights} night${nights > 1 ? "s" : ""}`}
        </button>
      </div>

      <AnimatePresence>
        {searched && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg">
                {loading ? "Searching..." : `${hotels.length} hotels in ${destination}`}
              </h3>
              {!loading && <span className="text-xs text-muted-foreground">{nights} nights · {adults} guest{adults > 1 ? "s" : ""}</span>}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-36 bg-white/5" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-3/4 bg-white/10 rounded" />
                      <div className="h-3 w-1/2 bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hotels.map((h, i) => (
                  <motion.div key={h.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="glass rounded-2xl overflow-hidden hover:border-primary/20 transition-colors group cursor-pointer">
                    <div className="relative h-36 bg-secondary/50">
                      {h.image ? (
                        <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-900/30 to-amber-600/10 flex items-center justify-center">
                          <Hotel className="h-12 w-12 text-white/10" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="rounded-full bg-black/50 backdrop-blur px-2 py-0.5 text-[10px] text-white flex items-center gap-1">
                          {"★".repeat(h.stars)}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur px-2 py-0.5 text-xs text-white">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {h.rating.toFixed(1)}
                        {h.reviewCount > 0 && <span className="text-white/60">({h.reviewCount})</span>}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="font-display text-base mb-0.5">{h.name}</div>
                      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{h.address || destination}
                      </div>
                      {h.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {h.amenities.slice(0, 3).map((a) => (
                            <span key={a} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground flex items-center gap-1">
                              <Wifi className="h-2.5 w-2.5" />{a}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="font-display text-lg text-primary">{inr(h.pricePerNight)}</div>
                          <div className="text-[10px] text-muted-foreground">per night · {inr(h.pricePerNight * nights)} total</div>
                        </div>
                        <button className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && hotels.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <div className="text-3xl mb-2">🏨</div>
                <div className="text-sm">No hotels found for {destination}</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
