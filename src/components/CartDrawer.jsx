import { X, Trash2, Plus, Minus, Building2, Plane, Compass, ShoppingBag } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../lib/format";

const KIND_META = {
  hotel: { icon: Building2, label: "Hotel", color: "text-[#d4a86a]" },
  flight: { icon: Plane, label: "Flight", color: "text-sky-300" },
  attraction: { icon: Compass, label: "Activity", color: "text-emerald-300" },
};

/**
 * CartDrawer
 * - Hidden by default; auto-opens when an item is added (handled in CartContext reducer)
 * - Auto-closes when the last item is removed
 * - Renders nothing in the DOM when fully closed AND empty (no layout impact)
 * - Uses inline styles for critical positioning so it works regardless of Tailwind config
 */
export default function CartDrawer() {
  const cart = useCart();
  const prevCount = useRef(cart.itemCount);

  // Auto-close when last item is removed
  useEffect(() => {
    if (prevCount.current > 0 && cart.itemCount === 0 && cart.isOpen) {
      // Brief delay so user sees "removed" state before drawer closes
      const t = setTimeout(() => cart.close(), 400);
      return () => clearTimeout(t);
    }
    prevCount.current = cart.itemCount;
  }, [cart.itemCount, cart.isOpen, cart.close]);

  // Close on Escape
  useEffect(() => {
    if (!cart.isOpen) return;
    const onKey = (e) => e.key === "Escape" && cart.close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cart.isOpen, cart.close]);

  // Lock body scroll while open
  useEffect(() => {
    if (cart.isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [cart.isOpen]);

  // CRITICAL: render nothing when closed AND empty.
  // This prevents any chance of the drawer adding to layout flow.
  if (!cart.isOpen && cart.items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Backdrop — only visible when open */}
      <div
        onClick={cart.close}
        aria-hidden={!cart.isOpen}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: cart.isOpen ? 1 : 0,
          pointerEvents: cart.isOpen ? "auto" : "none",
          transition: "opacity 300ms ease-out",
        }}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Cart"
        aria-hidden={!cart.isOpen}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "28rem",
          zIndex: 9999,
          background: "#0b0b0b",
          color: "white",
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "-20px 0 40px rgba(0, 0, 0, 0.5)",
          transform: cart.isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "9999px",
                background: "rgba(212, 168, 106, 0.15)",
                color: "#d4a86a",
              }}
            >
              <ShoppingBag style={{ width: "1rem", height: "1rem" }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "serif", fontSize: "1.25rem", margin: 0 }}>Your Trip</h2>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            onClick={cart.close}
            aria-label="Close cart"
            style={{
              display: "grid",
              placeItems: "center",
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "9999px",
              background: "transparent",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X style={{ width: "1rem", height: "1rem" }} />
          </button>
        </header>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
          {cart.items.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {Object.entries(cart.byDestination).map(([dest, items]) => (
                <section key={dest}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <h3 style={{ fontFamily: "serif", fontSize: "1.125rem", margin: 0 }}>{dest}</h3>
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <footer
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(0,0,0,0.4)",
              padding: "1.25rem 1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Subtotal
              </span>
              <span style={{ fontFamily: "serif", fontSize: "1.5rem" }}>
                {formatCurrency(cart.subtotal, cart.currency)}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <button
                onClick={cart.clear}
                style={{
                  borderRadius: "9999px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  padding: "0.75rem 1rem",
                  fontSize: "0.875rem",
                  color: "rgba(255,255,255,0.8)",
                  cursor: "pointer",
                }}
              >
                Clear all
              </button>
              <a
                href="/cart"
                style={{
                  borderRadius: "9999px",
                  background: "#d4a86a",
                  color: "black",
                  padding: "0.75rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textAlign: "center",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                Checkout →
              </a>
            </div>
            <p
              style={{
                marginTop: "0.75rem",
                textAlign: "center",
                fontSize: "0.6875rem",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Bundle discount applied at checkout when 2+ kinds are mixed.
            </p>
          </footer>
        )}
      </aside>
    </>
  );
}

function CartItem({ item }) {
  const cart = useCart();
  const meta = KIND_META[item.kind] ?? KIND_META.attraction;
  const Icon = meta.icon;
  const qty = item.meta?.quantity ?? 1;

  return (
    <li
      style={{
        borderRadius: "1rem",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.02)",
        padding: "1rem",
      }}
    >
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: "3rem",
            height: "3rem",
            flexShrink: 0,
            borderRadius: "0.75rem",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <Icon
            className={meta.color}
            style={{ width: "1.25rem", height: "1.25rem" }}
          />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: "0.625rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "rgba(255,255,255,0.4)",
                  margin: 0,
                }}
              >
                {meta.label}
              </p>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.title}
              </h4>
              {item.subtitle && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.5)",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.subtitle}
                </p>
              )}
            </div>
            <button
              onClick={() => cart.remove(item.id)}
              aria-label="Remove item"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
            </button>
          </div>

          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "0.125rem",
              }}
            >
              <button
                onClick={() => cart.updateQty(item.id, qty - 1)}
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "1.5rem",
                  height: "1.5rem",
                  borderRadius: "9999px",
                  background: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Minus style={{ width: "0.75rem", height: "0.75rem" }} />
              </button>
              <span style={{ width: "1.25rem", textAlign: "center", fontSize: "0.75rem" }}>{qty}</span>
              <button
                onClick={() => cart.updateQty(item.id, qty + 1)}
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "1.5rem",
                  height: "1.5rem",
                  borderRadius: "9999px",
                  background: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Plus style={{ width: "0.75rem", height: "0.75rem" }} />
              </button>
            </div>
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              {formatCurrency(item.price * qty, item.currency)}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        textAlign: "center",
        padding: "4rem 0",
      }}
    >
      <div
        style={{
          marginBottom: "1.25rem",
          display: "grid",
          placeItems: "center",
          width: "4rem",
          height: "4rem",
          borderRadius: "9999px",
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <ShoppingBag style={{ width: "1.5rem", height: "1.5rem", color: "rgba(255,255,255,0.4)" }} />
      </div>
      <h3 style={{ fontFamily: "serif", fontSize: "1.25rem", margin: 0 }}>Your trip is empty</h3>
      <p style={{ marginTop: "0.5rem", maxWidth: "20rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>
        Add flights, hotels, and activities — bundle them for a single checkout and unlock trip-wide savings.
      </p>
    </div>
  );
}
