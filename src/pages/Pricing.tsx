import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your travel needs. Experience the power of AI-driven itineraries.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass p-8 rounded-3xl flex flex-col"
            >
              <h3 className="text-2xl font-medium mb-2">Explorer</h3>
              <div className="text-4xl font-display mb-6">Free</div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>3 AI-generated itineraries per month</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Basic flight and hotel search</span>
                </li>
              </ul>
              <button className="w-full py-3 rounded-full border border-primary/20 hover:bg-primary/5 transition-colors font-medium">
                Get Started
              </button>
            </motion.div>

            {/* Pro Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass p-8 rounded-3xl flex flex-col border-primary/30 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
                POPULAR
              </div>
              <h3 className="text-2xl font-medium mb-2">Globetrotter</h3>
              <div className="text-4xl font-display mb-6">$19<span className="text-lg text-muted-foreground font-sans">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Unlimited AI itineraries</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Real-time agentic booking</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Priority customer support</span>
                </li>
              </ul>
              <button className="w-full py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-glow">
                Upgrade to Pro
              </button>
            </motion.div>

            {/* Enterprise Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass p-8 rounded-3xl flex flex-col"
            >
              <h3 className="text-2xl font-medium mb-2">Elite</h3>
              <div className="text-4xl font-display mb-6">$99<span className="text-lg text-muted-foreground font-sans">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Dedicated travel concierge</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Exclusive luxury hotel perks</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Airport lounge access</span>
                </li>
              </ul>
              <button className="w-full py-3 rounded-full border border-primary/20 hover:bg-primary/5 transition-colors font-medium">
                Contact Sales
              </button>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
