import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

/**
 * CartContext
 * -----------
 * Multi-item cart that bundles flights, hotels, and attractions for one checkout.
 *
 * Item shape (normalized across kinds):
 *   {
 *     id: string,            // unique per item (kind + sourceId + dates)
 *     kind: "hotel" | "flight" | "attraction",
 *     title: string,
 *     subtitle?: string,
 *     image?: string,
 *     price: number,         // in minor unit-agnostic; UI formats with currency
 *     currency: string,      // "INR", "USD", ...
 *     meta: object,          // kind-specific (nights, dates, pax, etc.)
 *     destination?: string,  // "Dubai" — useful for grouping
 *   }
 */

const CartContext = createContext(null);
const STORAGE_KEY = "voya.cart.v1";

const initialState = {
  items: [],
  isOpen: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.items ?? [] };

    case "ADD": {
      // Idempotent: if same id already exists, bump quantity in meta or no-op.
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.item.id
              ? { ...i, meta: { ...i.meta, quantity: (i.meta?.quantity ?? 1) + 1 } }
              : i
          ),
          isOpen: true,
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, meta: { quantity: 1, ...action.item.meta } }],
        isOpen: true,
      };
    }

    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.id === action.id
              ? { ...i, meta: { ...i.meta, quantity: Math.max(0, action.quantity) } }
              : i
          )
          .filter((i) => (i.meta?.quantity ?? 0) > 0),
      };

    case "CLEAR":
      return { ...state, items: [] };

    case "OPEN":
      return { ...state, isOpen: true };

    case "CLOSE":
      return { ...state, isOpen: false };

    case "TOGGLE":
      return { ...state, isOpen: !state.isOpen };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", items: JSON.parse(raw) });
    } catch (e) {
      console.warn("[cart] hydrate failed", e);
    }
  }, []);

  // Persist on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {
      console.warn("[cart] persist failed", e);
    }
  }, [state.items]);

  const value = useMemo(() => {
    const itemCount = state.items.reduce((acc, i) => acc + (i.meta?.quantity ?? 1), 0);
    const subtotal = state.items.reduce(
      (acc, i) => acc + i.price * (i.meta?.quantity ?? 1),
      0
    );
    const currency = state.items[0]?.currency ?? "INR";

    // Group by destination for the bundle UI
    const byDestination = state.items.reduce((acc, i) => {
      const k = i.destination ?? "Other";
      if (!acc[k]) acc[k] = [];
      acc[k].push(i);
      return acc;
    }, {});

    return {
      items: state.items,
      isOpen: state.isOpen,
      itemCount,
      subtotal,
      currency,
      byDestination,
      add: (item) => dispatch({ type: "ADD", item }),
      remove: (id) => dispatch({ type: "REMOVE", id }),
      updateQty: (id, quantity) => dispatch({ type: "UPDATE_QTY", id, quantity }),
      clear: () => dispatch({ type: "CLEAR" }),
      open: () => dispatch({ type: "OPEN" }),
      close: () => dispatch({ type: "CLOSE" }),
      toggle: () => dispatch({ type: "TOGGLE" }),
      has: (id) => state.items.some((i) => i.id === id),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}

// Helpers to build cart items from your existing data shapes.
// Adapt the field names to whatever your API returns.
export const cartItemBuilders = {
  hotel: ({ id, name, location, image, pricePerNight, nights, currency = "INR", destination, amenities, rating }) => ({
    id: `hotel:${id}:${nights}`,
    kind: "hotel",
    title: name,
    subtitle: location,
    image,
    price: pricePerNight * nights,
    currency,
    destination,
    meta: { nights, pricePerNight, amenities, rating },
  }),
  flight: ({ id, from, to, depart, arrive, airline, price, currency = "INR", destination, pax = 1 }) => ({
    id: `flight:${id}`,
    kind: "flight",
    title: `${from} → ${to}`,
    subtitle: airline,
    price: price * pax,
    currency,
    destination,
    meta: { from, to, depart, arrive, airline, pax },
  }),
  attraction: ({ id, name, image, price, currency = "INR", destination, duration, category }) => ({
    id: `attraction:${id}`,
    kind: "attraction",
    title: name,
    subtitle: category,
    image,
    price,
    currency,
    destination,
    meta: { duration, category },
  }),
};
