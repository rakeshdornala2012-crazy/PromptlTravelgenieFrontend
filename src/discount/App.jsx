import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import CartDrawer from "./components/CartDrawer";
import ResultsPage from "./pages/ResultsPage";
import CartPage from "./pages/CartPage";
import { useState } from "react";

/**
 * App.jsx
 * Reference wiring. Replace the inline route switch with your actual router
 * (react-router-dom, TanStack Router, Next.js, etc.) — keep <CartProvider>
 * at the top so every page and the header share the same cart state.
 */
export default function App() {
  // Naive routing for the demo; replace with your router
  const [path, setPath] = useState(window.location.pathname);
  if (typeof window !== "undefined") {
    window.addEventListener("popstate", () => setPath(window.location.pathname));
  }

  const [currency, setCurrency] = useState("INR");

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#070707] font-sans text-white antialiased">
        <Header currency={currency} onCurrencyChange={setCurrency} />

        {path === "/cart" ? (
          <CartPage />
        ) : (
          // Pass URL-derived params here. The defaults match your screenshot.
          <ResultsPage
            destination="Dubai"
            originCode="DEL"
            destCode="DUBAI"
            guests={2}
            checkIn="2026-05-15"
            checkOut="2026-05-18"
            reply="Dubai is a great choice!"
            currency={currency}
          />
        )}

        {/* Drawer is mounted globally so it can open from anywhere */}
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
