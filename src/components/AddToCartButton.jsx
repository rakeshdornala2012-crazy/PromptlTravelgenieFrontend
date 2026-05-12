import { Check, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";

/**
 * AddToCartButton
 * Drop-in replacement for "Book Now". Pass a fully-built cart item.
 *
 * Variants:
 *  - "primary": gold pill (matches the screenshot's main CTA)
 *  - "subtle": ghost button for secondary cards
 */
export default function AddToCartButton({ item, variant = "primary", className = "" }) {
  const cart = useCart();
  const isAdded = cart.has(item.id);

  const base =
    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? isAdded
        ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40 hover:bg-emerald-500/25"
        : "bg-[#d4a86a] text-black hover:bg-[#e5b97a]"
      : isAdded
        ? "border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"
        : "border border-white/15 text-white/90 hover:bg-white/5";

  return (
    <button
      onClick={() => (isAdded ? cart.open() : cart.add(item))}
      className={`${base} ${styles} ${className}`}
      aria-label={isAdded ? "View in cart" : "Add to cart"}
    >
      {isAdded ? (
        <>
          <Check className="h-4 w-4" /> Added — View Cart
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" /> Add to Cart
        </>
      )}
    </button>
  );
}
