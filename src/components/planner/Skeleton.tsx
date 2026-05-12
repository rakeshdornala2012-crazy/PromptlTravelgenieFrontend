import { motion } from "framer-motion";

export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={`relative overflow-hidden rounded-md bg-secondary/60 ${className}`}
  >
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent"
    />
  </div>
);

export default Skeleton;
