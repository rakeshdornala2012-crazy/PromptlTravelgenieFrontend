import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import SettingsToggle from "./SettingsToggle";

const Nav = () => {
  const location = useLocation();
  const links = [
    { label: "Explore", path: "/explore" },
    { label: "AI Concierge", path: "/ai" },
    { label: "Flights", path: "/flights" },
    { label: "Agents", path: "/agents" },
    { label: "Trips", path: "/trips" },
    { label: "Visa", path: "/visa" },
    { label: "Pricing", path: "/pricing" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <div className="glass flex items-center justify-between rounded-full px-4 py-2.5 sm:px-6">
          {/* ─ Logo ─ */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-amber shadow-glow">
              <span className="text-sm font-bold text-primary-foreground leading-none">P</span>
            </div>
            <span className="font-display text-xl tracking-tight">
              Promptly{" "}
              <span className="text-gradient-amber">Travel</span>
            </span>
          </Link>

          {/* ─ Nav links ─ */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const isActive = location.pathname === l.path;
              return (
                <Link
                  key={l.label}
                  to={l.path}
                  className={
                    "px-3 py-1.5 text-sm rounded-full transition-colors " +
                    (isActive
                      ? "text-foreground bg-secondary/60"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* ─ Right side ─ */}
          <div className="flex items-center gap-2">
            <SettingsToggle />
            <Link
              to="/plan"
              className="hidden sm:inline-flex group items-center gap-1.5 rounded-full bg-gradient-amber px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-glow transition-all duration-200"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Plan a trip
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Nav;
