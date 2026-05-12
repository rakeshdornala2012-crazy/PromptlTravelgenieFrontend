import { motion } from "framer-motion";
import { Wind, Droplets, Thermometer } from "lucide-react";
import { CurrentWeather, DayForecast } from "@/lib/destination";

interface Props {
  current: CurrentWeather | null;
  forecast: DayForecast[];
}

const WeatherForecast = ({ current, forecast }: Props) => {
  if (!current && forecast.length === 0) return null;

  const formatDay = (iso: string, idx: number) => {
    if (idx === 0) return "Today";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-white/10 bg-secondary/30 p-6"
    >
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        Weather forecast
      </div>

      {current && (
        <div className="flex items-center justify-between pb-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{current.icon}</span>
            <div>
              <div className="font-display text-4xl">{current.temp}°C</div>
              <div className="text-sm text-muted-foreground">{current.description}</div>
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
              <Thermometer className="h-3 w-3" />
              Feels {current.feelsLike}°
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
              <Droplets className="h-3 w-3" />
              {current.humidity}% humidity
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
              <Wind className="h-3 w-3" />
              {current.windSpeed} km/h
            </div>
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="grid grid-cols-7 gap-2 pt-5">
          {forecast.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-center rounded-2xl bg-secondary/40 py-3 px-1"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                {formatDay(day.date, i)}
              </div>
              <div className="text-2xl mb-1">{day.icon}</div>
              <div className="text-xs font-medium tabular-nums">
                {day.tempMax}°
              </div>
              <div className="text-[10px] text-muted-foreground tabular-nums">
                {day.tempMin}°
              </div>
              {day.precipitation > 30 && (
                <div className="text-[9px] text-sky-400 mt-1">
                  {day.precipitation}%
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default WeatherForecast;
