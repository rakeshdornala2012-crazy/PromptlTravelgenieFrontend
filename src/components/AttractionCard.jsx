import { Compass, Clock } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import { cartItemBuilders } from "../context/CartContext";
import { formatCurrency } from "../lib/format";

export default function AttractionCard({ attraction, destination }) {
  const item = cartItemBuilders.attraction({
    id: attraction.id,
    name: attraction.name,
    image: attraction.image,
    price: attraction.price,
    currency: attraction.currency ?? "INR",
    destination,
    duration: attraction.duration,
    category: attraction.category,
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-white/20">
      <div className="relative aspect-[16/9] bg-gradient-to-br from-emerald-900/30 to-black">
        <div className="absolute inset-0 grid place-items-center">
          <Compass className="h-10 w-10 text-white/10" />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/80 ring-1 ring-white/10 backdrop-blur">
          {attraction.category}
        </span>
      </div>
      <div className="p-4">
        <h4 className="font-serif text-lg text-white">{attraction.name}</h4>
        <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
          <Clock className="h-3 w-3" /> {attraction.duration}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-serif text-xl text-white">
            {formatCurrency(attraction.price, attraction.currency)}
          </span>
          <AddToCartButton item={item} variant="subtle" />
        </div>
      </div>
    </article>
  );
}
