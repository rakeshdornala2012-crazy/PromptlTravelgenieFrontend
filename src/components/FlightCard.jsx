import { Plane, Clock } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import { cartItemBuilders } from "../context/CartContext";
import { formatCurrency } from "../lib/format";

export default function FlightCard({ flight, destination, pax = 1 }) {
  const item = cartItemBuilders.flight({
    id: flight.id,
    from: flight.from,
    to: flight.to,
    depart: flight.depart,
    arrive: flight.arrive,
    airline: flight.airline,
    price: flight.price,
    currency: flight.currency ?? "INR",
    destination,
    pax,
  });

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-400/10 text-sky-300">
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <p className="font-serif text-xl text-white">
              {flight.from} → {flight.to}
            </p>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-white/50">
              <span>{flight.airline}</span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {flight.duration}
              </span>
              {flight.stops != null && (
                <>
                  <span className="opacity-40">•</span>
                  <span>{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="text-right">
            <p className="font-serif text-2xl text-white">{formatCurrency(flight.price, flight.currency)}</p>
            <p className="text-[11px] text-white/40">per person</p>
          </div>
          <AddToCartButton item={item} variant="primary" />
        </div>
      </div>
    </article>
  );
}
