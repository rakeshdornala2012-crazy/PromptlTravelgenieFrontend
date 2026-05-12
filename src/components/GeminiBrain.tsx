import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, Loader2, Plane, Hotel, Car, Compass, FileCheck,
  RotateCcw, ChevronRight, MapPin, Bot, User
} from "lucide-react";
import { chat, shouldTriggerAPI, getAPITargets, type GeminiMessage, type GeminiResponse, type TripIntent } from "@/lib/gemini";
import { searchFlights, AIRPORT_MAP, getLiveFlights } from "@/lib/flights";
import { searchHotels } from "@/lib/hotels";
import { getAttractions } from "@/lib/attractions";
import { getWeather } from "@/lib/weather";

// ── Markdown-lite renderer (bold, emoji, newlines) ────────────
function Markdown({ text }: { text: string }) {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ── Intent badge ──────────────────────────────────────────────
const INTENT_META: Record<string, { icon: any; label: string; color: string }> = {
  flights:      { icon: Plane,      label: "Searching Flights",     color: "text-sky-400 bg-sky-500/15" },
  hotels:       { icon: Hotel,      label: "Searching Hotels",      color: "text-amber-400 bg-amber-500/15" },
  cars:         { icon: Car,        label: "Searching Cars",        color: "text-emerald-400 bg-emerald-500/15" },
  attractions:  { icon: Compass,    label: "Finding Attractions",   color: "text-purple-400 bg-purple-500/15" },
  visa:         { icon: FileCheck,  label: "Checking Visa",         color: "text-rose-400 bg-rose-500/15" },
  full_trip:    { icon: MapPin,     label: "Planning Full Trip",    color: "text-primary bg-primary/15" },
  weather:      { icon: Sparkles,   label: "Checking Weather",      color: "text-cyan-400 bg-cyan-500/15" },
};

// ── Result Cards ──────────────────────────────────────────────
function FlightCards({ flights }: { flights: any[] }) {
  if (!flights.length) return null;
  const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
  const fmt = (iso: string) => { try { return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }); } catch { return iso; } };
  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">✈️ Live Flights</p>
      {flights.slice(0, 3).map((f, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-secondary/40 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {f.logo ? <img src={f.logo} className="h-6 w-6 rounded object-contain" alt="" /> : <Plane className="h-4 w-4 text-primary" />}
            <div>
              <div className="text-xs font-medium">{f.airline}</div>
              <div className="text-[10px] text-muted-foreground">{f.flightNumber} · {f.stops}</div>
            </div>
          </div>
          <div className="text-center text-xs">
            <span className="font-medium">{fmt(f.departure.scheduled)}</span>
            <span className="text-muted-foreground mx-1">→</span>
            <span className="font-medium">{fmt(f.arrival.scheduled)}</span>
            <div className="text-[10px] text-muted-foreground">{f.duration}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-display text-primary">{f.price ? inr(f.price) : "—"}</div>
            <div className="text-[10px] text-muted-foreground">per person</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HotelCards({ hotels }: { hotels: any[] }) {
  if (!hotels.length) return null;
  const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">🏨 Top Hotels</p>
      {hotels.slice(0, 3).map((h, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-secondary/40 p-3 flex items-center gap-3">
          {h.image ? (
            <img src={h.image} className="h-14 w-20 rounded-lg object-cover shrink-0" alt={h.name} />
          ) : (
            <div className="h-14 w-20 rounded-lg bg-white/5 grid place-items-center shrink-0"><Hotel className="h-5 w-5 text-white/20" /></div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{h.name}</div>
            <div className="text-[10px] text-muted-foreground">{"★".repeat(h.stars)} · {h.rating.toFixed(1)} ({h.reviewCount} reviews)</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {h.amenities.slice(0, 2).map((a: string) => <span key={a} className="text-[9px] rounded-full bg-white/5 px-1.5 py-0.5 text-muted-foreground">{a}</span>)}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-display text-primary">{inr(h.pricePerNight)}</div>
            <div className="text-[10px] text-muted-foreground">/night</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AttractionCards({ attractions }: { attractions: any[] }) {
  if (!attractions.length) return null;
  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">🗺️ Top Attractions</p>
      {attractions.slice(0, 3).map((a, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-secondary/40 p-3 flex items-center gap-3">
          {a.image ? (
            <img src={a.image} className="h-12 w-16 rounded-lg object-cover shrink-0" alt={a.name} />
          ) : (
            <div className="h-12 w-16 rounded-lg bg-white/5 grid place-items-center shrink-0"><Compass className="h-4 w-4 text-white/20" /></div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{a.name}</div>
            <div className="text-[10px] text-muted-foreground">{a.category} · {a.duration ?? "2-3 hrs"}</div>
            {a.description && <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{a.description}</div>}
          </div>
          <div className="text-right shrink-0">
            <div className={`text-xs font-medium ${a.price === "Free" ? "text-emerald-400" : "text-primary"}`}>{a.price ?? "Free"}</div>
            {a.rating > 0 && <div className="text-[10px] text-muted-foreground">⭐ {a.rating.toFixed(1)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  intent?: TripIntent;
  loading?: boolean;
  apiData?: {
    flights?: any[];
    hotels?: any[];
    attractions?: any[];
    weather?: any;
  };
  followUps?: string[];
}

// ── Main Component ────────────────────────────────────────────
export default function GeminiBrain() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hey there! ✈️ I'm your Trip Genie — powered by Gemini AI.\n\nTell me where you want to go, and I'll find the best **flights, hotels, and experiences** for you. I only search live APIs when you're ready — no wasted credits!\n\nWhere are we heading? 🌍",
      followUps: ["Find flights Delhi to Bali in May", "Best hotels in Maldives next month", "Plan a 5-day Dubai trip for 2"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useRef<GeminiMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text };
    const thinkingId = (Date.now() + 1).toString();
    const thinkingMsg: ChatMessage = { id: thinkingId, role: "assistant", text: "", loading: true };

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setLoading(true);

    try {
      // 1. Ask Gemini to classify intent + generate reply
      const geminiRes: GeminiResponse = await chat(text, history.current);

      // Update history
      history.current = [
        ...history.current,
        { role: "user", content: text },
        { role: "assistant", content: geminiRes.reply },
      ].slice(-12); // keep last 6 exchanges

      // 2. Decide if we need to call APIs
      const apiData: ChatMessage["apiData"] = {};
      const targets = getAPITargets(geminiRes.intent);

      if (shouldTriggerAPI(geminiRes.intent) && targets.length > 0) {
        const dest = geminiRes.intent.destination ?? "";
        const checkIn = geminiRes.intent.checkIn ?? (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split("T")[0]; })();
        const checkOut = geminiRes.intent.checkOut ?? (() => { const d = new Date(); d.setDate(d.getDate() + 37); return d.toISOString().split("T")[0]; })();
        const adults = geminiRes.intent.adults ?? 1;

        await Promise.allSettled([
          // Flights
          (targets.includes("flights") || targets.includes("full_trip")) && dest
            ? getLiveFlights(geminiRes.intent.origin ?? "DEL", dest.toUpperCase().slice(0, 3)).then((r) => { apiData.flights = r; })
            : Promise.resolve(),

          // Hotels
          (targets.includes("hotels") || targets.includes("full_trip")) && dest
            ? searchHotels({ destination: dest, checkIn, checkOut, adults }).then((r) => { apiData.hotels = r; })
            : Promise.resolve(),

          // Attractions
          (targets.includes("attractions") || targets.includes("full_trip")) && dest
            ? getAttractions(dest).then((r) => { apiData.attractions = r; })
            : Promise.resolve(),

          // Weather
          targets.includes("weather") && dest
            ? getWeather(dest).then((r) => { apiData.weather = r; })
            : Promise.resolve(),
        ]);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? { ...m, loading: false, text: geminiRes.reply, intent: geminiRes.intent, apiData, followUps: geminiRes.suggestedFollowUps }
            : m
        )
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? { ...m, loading: false, text: "Hmm, something went wrong on my end. Try again? 🙏" }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const reset = () => {
    history.current = [];
    setMessages([{
      id: "welcome",
      role: "assistant",
      text: "Fresh start! ✨ Where would you like to go?",
      followUps: ["Find flights Delhi to Bali in May", "Hotels in Maldives for 2 adults", "Plan a 5-day Dubai trip"],
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[820px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-amber grid place-items-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-sm">Trip Genie AI</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Powered by Qwen 2.5 · Local AI
            </div>
          </div>
        </div>
        <button onClick={reset} className="h-8 w-8 rounded-xl border border-white/10 grid place-items-center hover:bg-white/5 transition-colors">
          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div className={`h-7 w-7 rounded-xl shrink-0 grid place-items-center ${msg.role === "assistant" ? "bg-gradient-amber" : "bg-secondary"}`}>
                {msg.role === "assistant" ? <Sparkles className="h-3.5 w-3.5 text-primary-foreground" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>

              <div className={`flex-1 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                {/* Bubble */}
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary/20 text-foreground rounded-tr-sm" : "glass rounded-tl-sm"}`}>
                  {msg.loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs">Thinking...</span>
                    </div>
                  ) : (
                    <Markdown text={msg.text} />
                  )}
                </div>

                {/* Intent badge */}
                {msg.intent && msg.intent.type !== "conversational" && shouldTriggerAPI(msg.intent) && (() => {
                  const meta = INTENT_META[msg.intent.type];
                  if (!meta) return null;
                  const Icon = meta.icon;
                  return (
                    <div className={`mt-1.5 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-widest w-fit ${meta.color}`}>
                      <Icon className="h-3 w-3" />
                      {meta.label}
                      {msg.intent.destination && ` · ${msg.intent.destination}`}
                    </div>
                  );
                })()}

                {/* API Results */}
                {msg.apiData && (
                  <div className="mt-2 w-full">
                    {msg.apiData.flights && msg.apiData.flights.length > 0 && <FlightCards flights={msg.apiData.flights} />}
                    {msg.apiData.hotels && msg.apiData.hotels.length > 0 && <HotelCards hotels={msg.apiData.hotels} />}
                    {msg.apiData.attractions && msg.apiData.attractions.length > 0 && <AttractionCards attractions={msg.apiData.attractions} />}
                  </div>
                )}

                {/* Follow-up chips */}
                {msg.followUps && msg.followUps.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.followUps.map((fu) => (
                      <button key={fu} onClick={() => sendMessage(fu)}
                        className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors flex items-center gap-1">
                        <ChevronRight className="h-2.5 w-2.5" />{fu}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-end gap-2 glass rounded-2xl p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything — 'Find me flights to Bali in May'..."
            rows={1}
            className="flex-1 bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground px-2 py-1.5 max-h-28"
            style={{ minHeight: "36px" }}
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
            className="h-9 w-9 rounded-xl bg-gradient-amber grid place-items-center shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40">
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" /> : <Send className="h-4 w-4 text-primary-foreground" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-1.5">Qwen AI · Live APIs triggered only when needed</p>
      </div>
    </div>
  );
}
