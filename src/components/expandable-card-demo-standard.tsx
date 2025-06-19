"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { TokenMint } from "./token-mint";
import { InvestPool } from "./invest-pool";
import { ThirdwebContract } from "thirdweb";

interface ExpandableCardDemoProps {
  contract: ThirdwebContract;
}

export default function ExpandableCardDemo({ contract }: ExpandableCardDemoProps) {
  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
    null
  );

  const cards = [
    {
      description: "Invierte capital semilla y obtén rendimientos en USDC.",
      title: "Pandora’s Family & Friends Pool",
      src: "/pandoras/pkey.png",
      ctaText: "Invertir",
      ctaLink: "#",
      content: () => {
        return <InvestPool />;
      },
    },
    {
      description: "El utility y governance token de AGOD Ecosystem.",
      title: "AGOD Token",
      src: "/icon.png",
      ctaText: "Comprar",
      ctaLink: "#",
      content: () => {
        return (
          <TokenMint
            contract={contract}
            displayName="AGOD Token"
            description="El utility y governance token de AGOD Ecosystem, respaldado por activos reales, te permite participar en decisiones, obtener rendimientos y desbloquear servicios exclusivos."
            contractImage="/icon.png"
            pricePerToken={0.007}
            currencySymbol="USDC"
          />
        );
      },
    },
  ];
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="hidden absolute top-2 right-2 items-center justify-center bg-white rounded-full h-6 w-6 z-50"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
            >
              {typeof active.content === "function"
                ? active.content()
                : active.content}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-2xl mx-auto w-full gap-4">
        {cards.map((card, index) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={`card-${card.title}-${id}`}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col md:flex-row justify-center items-center hover:bg-black/10 dark:hover:bg-neutral-800/50 rounded-xl cursor-pointer backdrop-blur-sm"
          >
            <div className="flex gap-4 flex-col md:flex-row items-center p-4 bg-gradient-to-r from-gray-900 to-black backdrop:md font-mono rounded-lg shadow-lg border-0">
              <motion.div layoutId={`image-${card.title}-${id}`}>
                <img
                  width={60}
                  height={60}
                  src={card.src}
                  alt={card.title}
                  className="h-14 w-14 rounded-lg object-contain"
                />
              </motion.div>
              <div className="text-left">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-medium text-neutral-100 dark:text-gray-100"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  className="text-sm text-neutral-500 dark:text-neutral-400"
                >
                  {card.description}
                </motion.p>
              </div>
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
