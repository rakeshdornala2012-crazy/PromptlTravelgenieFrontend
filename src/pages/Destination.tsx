import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Nav from "@/components/Nav";
import PageTransition from "@/components/PageTransition";
import WeatherForecast from "@/components/WeatherForecast";
import CountryCard from "@/components/CountryCard";
import CurrencyConverter from "@/components/CurrencyConverter";
import Attractions from "@/components/Attractions";
import PhotoGallery from "@/components/PhotoGallery";
import {
  getDestinationData,
  getVisaInfo,
  DestinationData,
} from "@/lib/destination";

const Destination = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const destination = name || "Bali";

  const [data, setData] = useState<DestinationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{
    lat: number;
    lon: number;
    country: string;
    countryCode: string;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    getDestinationData(destination).then((result) => {
      const { meta: m, ...rest } = result;
      setData(rest);
      setMeta(m);
      setLoading(false);
    });
  }, [destination]);

  const displayName =
    destination.charAt(0).toUpperCase() + destination.slice(1).toLowerCase();

  return (
    <PageTransition>
      <main className="min-h-screen bg-background text-foreground">
        <Nav />

        <section className="pt-32 pb-20 px-4">
          <div className="mx-auto max-w-6xl">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </button>

            {/* Hero */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                {meta && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary mb-3">
                    <Sparkles className="h-3 w-3" />
                    {meta.country}
                  </div>
                )}
                <h1 className="font-display text-5xl sm:text-6xl font-light leading-tight">
                  Discover <span className="italic text-primary">{displayName}</span>
                </h1>
                {loading ? (
                  <div className="mt-3 text-sm text-muted-foreground animate-pulse">
                    Loading destination data from 5 APIs...
                  </div>
                ) : (
                  data?.summary && (
                    <p className="mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed">
                      {data.summary.extract}
                      {data.summary.url && (
                        <a
                          href={data.summary.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 ml-1 text-primary hover:underline"
                        >
                          Read more <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </p>
                  )
                )}
              </div>

              <button
                onClick={() => navigate("/plan?q=" + encodeURIComponent("Trip to " + displayName))}
                className="group inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors w-fit shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                Plan a {displayName} trip
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {loading ? (
              // Loading skeleton
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={
                      "rounded-3xl border border-white/10 bg-secondary/30 p-6 animate-pulse " +
                      (i <= 2 ? "lg:col-span-2" : "")
                    }
                  >
                    <div className="h-3 w-24 bg-white/10 rounded mb-3" />
                    <div className="h-6 w-48 bg-white/10 rounded mb-4" />
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-white/5 rounded" />
                      <div className="h-3 w-3/4 bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !meta ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
                <div className="text-4xl mb-3">🗺️</div>
                <div className="font-display text-xl mb-2">
                  Destination not supported yet
                </div>
                <div className="text-sm text-muted-foreground mb-6">
                  We support: Bali, Kyoto, Santorini, Manali, Dubai, Maldives,
                  Lisbon, Coorg, Tokyo
                </div>
                <button
                  onClick={() => navigate("/explore")}
                  className="rounded-2xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Browse destinations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left column (2/3) */}
                <div className="lg:col-span-2 space-y-5">
                  {data && (
                    <>
                      <PhotoGallery
                        photos={data.photos}
                        destination={displayName}
                      />
                      <WeatherForecast
                        current={data.weather.current}
                        forecast={data.weather.forecast}
                      />
                      <Attractions attractions={data.attractions} />
                    </>
                  )}
                </div>

                {/* Right column (1/3) */}
                <div className="space-y-5">
                  {data && meta && (
                    <>
                      <CountryCard
                        country={data.country}
                        visa={getVisaInfo(meta.countryCode)}
                      />
                      {data.country?.currency.code && (
                        <CurrencyConverter
                          localCurrency={data.country.currency.code}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* API attribution footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 text-center text-[10px] text-muted-foreground"
            >
              Data from Open-Meteo · OpenStreetMap · Wikipedia · RestCountries ·
              Frankfurter · Unsplash
            </motion.div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
};

export default Destination;
