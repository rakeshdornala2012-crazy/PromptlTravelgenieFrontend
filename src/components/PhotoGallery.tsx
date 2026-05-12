import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Camera } from "lucide-react";
import { UnsplashPhoto } from "@/lib/destination";

interface Props {
  photos: UnsplashPhoto[];
  destination: string;
}

const PhotoGallery = ({ photos, destination }: Props) => {
  const [selected, setSelected] = useState<UnsplashPhoto | null>(null);

  if (photos.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-white/10 p-8 text-center">
        <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          Photos unavailable — add VITE_UNSPLASH_KEY to your .env
        </div>
      </section>
    );
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-white/10 bg-secondary/30 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Photo gallery
            </div>
            <div className="font-display text-xl mt-0.5">
              {destination} through the lens
            </div>
          </div>
          <a
            href="https://unsplash.com/?utm_source=voya&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            via Unsplash
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {photos.map((p, i) => (
            <motion.button
              key={p.id}
              onClick={() => setSelected(p)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              whileHover={{ scale: 1.02 }}
              className="group relative aspect-square overflow-hidden rounded-xl bg-secondary"
            >
              <img
                src={p.thumb}
                alt={p.description}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/80 truncate">
                  {p.photographer}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-h-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selected.url}
                alt={selected.description}
                className="max-h-[85vh] w-auto rounded-2xl"
              />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 backdrop-blur hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
              <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                <div>{selected.description}</div>
                <a
                  href={selected.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  📷 {selected.photographer}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PhotoGallery;
