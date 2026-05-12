import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { FileText, Clock, Globe } from "lucide-react";

const Visa = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-4">
              Global Visa Processing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI agents simplify your visa application process, ensuring a seamless journey from start to finish.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            <div className="glass p-8 rounded-3xl">
              <FileText className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-2xl font-medium mb-3">Smart Document Check</h3>
              <p className="text-muted-foreground">Our AI instantly verifies your documents against the latest embassy requirements to prevent rejections.</p>
            </div>
            <div className="glass p-8 rounded-3xl">
              <Clock className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-2xl font-medium mb-3">Fast-Track Processing</h3>
              <p className="text-muted-foreground">Skip the long lines. We handle the appointments and expedite processing where available.</p>
            </div>
            <div className="glass p-8 rounded-3xl">
              <Globe className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-2xl font-medium mb-3">150+ Countries</h3>
              <p className="text-muted-foreground">From e-visas to complex tourist visas, our platform supports applications worldwide.</p>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 p-8 glass rounded-3xl inline-block text-left max-w-3xl w-full"
          >
            <h2 className="text-2xl font-medium mb-4">Check Visa Requirements</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input type="text" placeholder="Your Nationality" className="bg-background/50 border border-primary/20 rounded-full px-6 py-3 flex-1 outline-none focus:border-primary/50" />
              <input type="text" placeholder="Destination Country" className="bg-background/50 border border-primary/20 rounded-full px-6 py-3 flex-1 outline-none focus:border-primary/50" />
              <button className="bg-primary text-primary-foreground rounded-full px-8 py-3 font-medium hover:bg-primary/90 transition-colors">Check</button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Visa;
