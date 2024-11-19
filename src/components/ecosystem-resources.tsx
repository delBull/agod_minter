import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ArticleCardProps {
  title: string;
  href: string;
  description: string;
}

function ArticleCard({ title, href, description }: ArticleCardProps): JSX.Element {
  return (
    <motion.a
      href={`${href}?utm_source=next-template`}
      target="_blank"
      className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <article>
        <h2 className="text-lg font-semibold mb-2 text-zinc-100">{title}</h2>
        <p className="text-sm text-zinc-400">{description}</p>
      </article>
    </motion.a>
  );
}

export function EcosystemResources(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      {/* Resources Grid */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid gap-4 lg:grid-cols-3 justify-center mb-24"
          >
            <ArticleCard
              title="Pandora's Foundation"
              href="https://pandoras.foundation"
              description="Un mundo nuevo, tokenización de RWA"
            />
            <ArticleCard
              title="AGOD Ecosystem"
              href="https://agodecosystem.com"
              description="La descripción"
            />
            <ArticleCard
              title="Harmony Ark Foundation"
              href="https://harmonyearth.me"
              description="La descripción."
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-5 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent h-20">
        <motion.button
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-transparent text-sm text-white font-mono hover:opacity-90 transition-opacity relative group"
          style={{
            border: '0.5px solid transparent',
            borderRadius: '0.5rem',
            backgroundImage: 'linear-gradient(#000, #000), linear-gradient(to right, #9333ea, #db2777)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          }}
        >
          <span>Explora el Ecosistema</span>
          <motion.div
            initial={false}
            animate={{ y: 0 }}
            whileHover={{ y: 3 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 10,
              mass: 0.75
            }}
            className="group-hover:animate-bounce"
          >
            {isVisible ? (
              <ChevronDown className="w-4 h-4 text-white" />
            ) : (
              <ChevronUp className="w-4 h-4 text-white" />
            )}
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}
