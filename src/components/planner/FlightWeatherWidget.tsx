import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plane, Wind, Droplets, Thermometer } from "lucide-react";
import { getLiveFlights, Flight } from "@/lib/flights";
import { getWeather, WeatherData } from "@/lib/weather";

interface Props {
  destination: string;
  arrIata: string;
}

const FlightWeatherWidget = ({ destination, arrIata }: Props) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getLiveFlights("DEL", arrIata),
      getWeather(destination),
    ]).then(([f, w]) => {
      setFlights(f);
      setWeather(w);
      setLoading(false);
    });
  }, [destination, arrIata]);

  if (loading) {
    return (
      <div className="mt-4 rounded-2xl border border-white/10 bg-secondary/30 p-4 animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-3" />
        <div className="h-3 w-full bg-white/5 rounded mb-2" />
        <div className="h-3 w-3/4 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-3"
    >
      {/* Weather */}
      {weather && (
        <div className="rounded-2xl border border-white/10 bg-secondary/30 p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Current weather in {destination}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{weather.icon}</span>
              <div>
                <div className="font-display text-2xl">{weather.temp}°C</div>
                <div className="text-xs text-muted-foreground">{weather.description}</div>
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Thermometer className="h-3 w-3" />
                Feels {weather.feelsLike}°C
              </div>
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Droplets className="h-3 w-3" />
                {weather.humidity}% humidity
              </div>
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Wind className="h-3 w-3" />
                {weather.windSpeed} km/h
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flights */}
      {flights.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-secondary/30 p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
            Flights DEL → {arrIata}
          </div>
          <div className="space-y-2">
            {flights.slice(0, 3).map((f, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Plane className="h-3.5 w-3.5 text-primary -rotate-45" />
                  <span className="text-xs">{f.airline}</span>
                  <span className="text-[10px] text-muted-foreground">{f.flightNumber}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {f.departure.scheduled?.slice(11, 16) || "—"} → {f.arrival.scheduled?.slice(11, 16) || "—"}
                </div>
                <div className={`text-[10px] rounded-full px-2 py-0.5 ${
                  f.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                  f.status === "landed" ? "bg-blue-500/20 text-blue-400" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {f.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FlightWeatherWidget;