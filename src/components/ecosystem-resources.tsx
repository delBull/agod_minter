import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { EvervaultCard, Icon } from "./ui/evervault-card";
import { Footer } from "./Footer";

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
      className="relative flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-zinc-400" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-zinc-400" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-zinc-400" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-zinc-400" />

      <article className="flex flex-col gap-4">
        <div className="h-[200px] md:h-[250px] lg:h-[300px]">
          <EvervaultCard text={title} />
        </div>
        <p className="text-sm text-zinc-400">{description}</p>
      </article>
    </motion.a>
  );
}

export function EcosystemResources(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  return (
    <div className="relative pb-16" ref={containerRef}>
      {/* Botón en la parte superior con fondo semi-transparente */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm py-4">
        <motion.button
          onClick={handleClick}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-transparent text-sm text-white font-mono hover:opacity-90 transition-opacity relative group mx-auto"
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
              <ChevronUp className="w-4 h-4 text-white" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white" />
            )}
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="px-4 py-8 overflow-y-auto"
          >
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              <ArticleCard
                title="Pandora's Foundation"
                href="https://pandoras.foundation"
                description="Innovamos con la tokenización de activos reales (RWA), conectando ideas visionarias con inversores globales. Pandora's Foundation hace tangible el futuro de las inversiones."
              />
              <ArticleCard
                title="AGOD Ecosystem"
                href="https://agodecosystem.com"
                description="Donde blockchain y AI convergen para transformar la economía digital. AGOD Ecosystem te conecta con un mundo descentralizado lleno de oportunidades."
              />
              <ArticleCard
                title="Harmony Ark Foundation"
                href="https://harmonyearth.me"
                description="Impulsamos el impacto social con tecnología Help to Earn. En HAF, cada acción cuenta para construir un mundo más solidario."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`w-full ${isVisible ? 'mt-8' : 'mt-16'}`}>
        <Footer />
      </div>
    </div>
  );
}
