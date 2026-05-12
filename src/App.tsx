import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { CurrencyProvider } from "@/lib/currency";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Index from "./pages/Index.tsx";
import Plan from "./pages/Plan.tsx";
import Agents from "./pages/Agents.tsx";
import Explore from "./pages/Explore.tsx";
import Itinerary from "./pages/Itinerary.tsx";
import Checkout from "./pages/Checkout.tsx";
import Trips from "./pages/Trips.tsx";
import Destination from "./pages/Destination.tsx";
import NotFound from "./pages/NotFound.tsx";
import FlightsPage from "./pages/Flights.tsx";
import AIPage from "./pages/AI.tsx";
import ResultsPage from "./pages/Results.tsx";
import CartPage from "./pages/CartPage";
import Pricing from "./pages/Pricing.tsx";
import Visa from "./pages/Visa.tsx";
import TripMapView from "./components/TripMapView";
import LoggerOverlay from "./components/LoggerOverlay";

const queryClient = new QueryClient();

/**
 * ScrollToTop — resets scroll position on every route change.
 * Fixes the "page starts from middle" bug.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/destination/:name" element={<Destination />} />
          <Route path="/flights" element={<FlightsPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/concierge" element={<AIPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/visa" element={<Visa />} />
          <Route path="/trips/:id/map" element={<TripMapView />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <LoggerOverlay />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CurrencyProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
              <CartDrawer />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
