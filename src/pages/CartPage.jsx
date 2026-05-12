import { Building2, Plane, Compass, Plus, Minus, Trash2, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../lib/format";

const KIND_META = {
  hotel: { icon: Building2, label: "Hotel" },
  flight: { icon: Plane, label: "Flight" },
  attraction: { icon: Compass, label: "Activity" },
};

export default function CartPage() {
  const cart = useCart();

  // Bundle discount: 5% if 2 different kinds, 10% if all 3
  const kinds = new Set(cart.items.map((i) => i.kind));
  const bundleRate = kinds.size === 3 ? 0.1 : kinds.size === 2 ? 0.05 : 0;
  const discount = Math.round(cart.subtotal * bundleRate);
  const taxes = Math.round((cart.subtotal - discount) * 0.05);
  const total = cart.subtotal - discount + taxes;

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="mb-3 font-serif text-5xl text-white">Your trip is empty</h1>
        <p className="mx-auto mb-8 max-w-md text-white/60">
          Browse destinations and add flights, hotels, and activities. Bundle them here for a single checkout.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#d4a86a] px-6 py-3 text-sm font-semibold text-black hover:bg-[#e5b97a]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to explore
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
      <a href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Continue exploring
      </a>

      <h1 className="mb-2 font-serif text-5xl text-white lg:text-6xl">Your Trip</h1>
      <p className="mb-10 text-white/60">
        {cart.itemCount} items across {Object.keys(cart.byDestination).length} {Object.keys(cart.byDestination).length === 1 ? "destination" : "destinations"}
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-10">
          {Object.entries(cart.byDestination).map(([dest, items]) => (
            <section key={dest}>
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="font-serif text-3xl text-white">{dest}</h2>
                <span className="text-sm text-white/40">{items.length} items</span>
              </div>
              <ul className="space-y-3">
                {items.map((item) => (
                  <CheckoutLineItem key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <h3 className="font-serif text-2xl text-white">Summary</h3>

            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between text-white/70">
                <dt>Subtotal</dt>
                <dd>{formatCurrency(cart.subtotal, cart.currency)}</dd>
              </div>
              {bundleRate > 0 && (
                <div className="flex justify-between text-emerald-300">
                  <dt className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Bundle discount ({Math.round(bundleRate * 100)}%)
                  </dt>
                  <dd>−{formatCurrency(discount, cart.currency)}</dd>
                </div>
              )}
              <div className="flex justify-between text-white/70">
                <dt>Taxes & fees</dt>
                <dd>{formatCurrency(taxes, cart.currency)}</dd>
              </div>
            </dl>

            <div className="my-5 h-px bg-white/10" />

            <div className="flex items-baseline justify-between">
              <span className="text-sm uppercase tracking-wider text-white/50">Total</span>
              <span className="font-serif text-3xl text-white">{formatCurrency(total, cart.currency)}</span>
            </div>

            <button
              onClick={() => alert("Wire this to your payment provider")}
              className="mt-5 w-full rounded-full bg-[#d4a86a] py-3.5 text-sm font-semibold text-black hover:bg-[#e5b97a]"
            >
              Confirm & Pay
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
              <ShieldCheck className="h-3 w-3" /> Secure checkout · cancel within 24h
            </p>

            {bundleRate === 0 && cart.items.length > 0 && (
              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-xs text-emerald-200/90">
                <Sparkles className="mr-1 inline h-3 w-3" />
                Add a flight or activity to unlock 5% bundle savings.
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function CheckoutLineItem({ item }) {
  const cart = useCart();
  const meta = KIND_META[item.kind] ?? KIND_META.attraction;
  const Icon = meta.icon;
  const qty = item.meta?.quantity ?? 1;

  return (
    <li className="flex items-stretch gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-white/5 to-transparent">
        <Icon className="h-7 w-7 text-white/40" />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#d4a86a]">{meta.label}</p>
            <h3 className="font-serif text-xl text-white">{item.title}</h3>
            {item.subtitle && <p className="text-xs text-white/50">{item.subtitle}</p>}
          </div>
          <button
            onClick={() => cart.remove(item.id)}
            className="text-white/40 hover:text-red-400"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* kind-specific meta */}
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/50">
          {item.kind === "hotel" && (
            <>
              <Pill>{item.meta.nights} nights</Pill>
              <Pill>{formatCurrency(item.meta.pricePerNight, item.currency)}/night</Pill>
            </>
          )}
          {item.kind === "flight" && (
            <>
              <Pill>{item.meta.airline}</Pill>
              <Pill>{item.meta.pax} pax</Pill>
            </>
          )}
          {item.kind === "attraction" && (
            <>
              <Pill>{item.meta.category}</Pill>
              <Pill>{item.meta.duration}</Pill>
            </>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex items-center gap-1 rounded-full border border-white/10 p-0.5">
            <button
              onClick={() => cart.updateQty(item.id, qty - 1)}
              className="grid h-7 w-7 place-items-center rounded-full text-white/70 hover:bg-white/10"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-xs">{qty}</span>
            <button
              onClick={() => cart.updateQty(item.id, qty + 1)}
              className="grid h-7 w-7 place-items-center rounded-full text-white/70 hover:bg-white/10"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <span className="font-serif text-xl text-white">
            {formatCurrency(item.price * qty, item.currency)}
          </span>
        </div>
      </div>
    </li>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5">{children}</span>
  );
}
