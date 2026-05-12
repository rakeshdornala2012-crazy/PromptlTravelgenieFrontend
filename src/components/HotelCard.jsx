import { Star, MapPin, Trophy, Building2 } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import { cartItemBuilders } from "../context/CartContext";
import { formatCurrency } from "../lib/format";

/**
 * HotelCard
 * Two variants: "topPick" (large, gold-tinted) and "standard" (compact grid).
 */
export default function HotelCard({ hotel, nights, destination, variant = "standard" }) {
  const item = cartItemBuilders.hotel({
    id: hotel.id,
    name: hotel.name,
    location: hotel.location,
    image: hotel.image,
    pricePerNight: hotel.pricePerNight,
    nights,
    currency: hotel.currency ?? "INR",
    destination,
    amenities: hotel.amenities,
    rating: hotel.rating,
  });
  const total = hotel.pricePerNight * nights;

  if (variant === "topPick") {
    return (
      <article className="relative overflow-hidden rounded-3xl border border-[#d4a86a]/20 bg-gradient-to-br from-[#3a2a14] via-[#1a1208] to-black p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d4a86a] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-black">
                <Trophy className="h-3 w-3" /> Top Pick
              </span>
              <span className="text-[#d4a86a]">★★★★★</span>
            </div>

            <h3 className="mb-1 font-serif text-3xl text-white lg:text-4xl">{hotel.name}</h3>
            <p className="mb-4 flex items-center gap-1.5 text-sm text-white/60">
              <MapPin className="h-3.5 w-3.5" /> {hotel.location}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {hotel.amenities?.map((a) => (
                <span key={a} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-white/80">
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-3">
            <div className="text-right">
              <p className="font-serif text-4xl text-white">
                {formatCurrency(hotel.pricePerNight, hotel.currency)}
              </p>
              <p className="text-xs text-white/50">per night</p>
              <p className="mt-0.5 text-sm text-[#d4a86a]">
                {formatCurrency(total, hotel.currency)} total
              </p>
            </div>
            <AddToCartButton item={item} variant="primary" />
          </div>
        </div>

        {hotel.rating && (
          <div className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white ring-1 ring-white/10 backdrop-blur">
            <Star className="h-3 w-3 fill-[#d4a86a] text-[#d4a86a]" />
            <span className="font-semibold">{hotel.rating}</span>
            <span className="text-white/50">({hotel.reviews?.toLocaleString() ?? "—"})</span>
          </div>
        )}
      </article>
    );
  }

  // Standard variant
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-white/20">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#2a1f10] to-black">
        <div className="absolute inset-0 grid place-items-center">
          <Building2 className="h-12 w-12 text-white/10" />
        </div>
        {hotel.rating && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] text-white ring-1 ring-white/10 backdrop-blur">
            <Star className="h-3 w-3 fill-[#d4a86a] text-[#d4a86a]" />
            <span className="font-semibold">{hotel.rating}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h4 className="font-serif text-lg leading-tight text-white">{hotel.name}</h4>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
          <MapPin className="h-3 w-3" /> {hotel.location}
        </p>

        <div className="mt-3 flex flex-wrap gap-1">
          {hotel.amenities?.slice(0, 3).map((a) => (
            <span key={a} className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/60">
              {a}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <span className="font-serif text-xl text-white">
                {formatCurrency(hotel.pricePerNight, hotel.currency)}
              </span>
              <span className="ml-1 text-[11px] text-white/40">/night</span>
            </div>
            <span className="text-[11px] text-[#d4a86a]">
              {formatCurrency(total, hotel.currency)} total
            </span>
          </div>
          <AddToCartButton item={item} variant="subtle" className="w-full justify-center" />
        </div>
      </div>
    </article>
  );
}
