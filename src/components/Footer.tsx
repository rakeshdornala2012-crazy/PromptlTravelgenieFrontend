import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border">
      <section className="relative py-32">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display text-5xl font-light leading-[1.05] tracking-tight sm:text-7xl md:text-8xl"
          >
            Your next trip is<br />
            <span className="italic text-gradient-amber">one sentence away.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mx-auto mt-6 max-w-md text-muted-foreground"
          >
            Join the waitlist. We're onboarding 200 travelers a week.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            onSubmit={(e) => e.preventDefault()}
            className="glass mx-auto mt-10 flex max-w-md items-center gap-1 rounded-full p-1.5"
          >
            <input
              type="email"
              required
              placeholder="you@somewhere.com"
              className="flex-1 bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-amber px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
            >
              Join
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.form>
        </div>
      </section>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} Voya · AI travel concierge</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-gradient-amber opacity-10 blur-[120px]" />
    </footer>
  );
};

export default Footer;
