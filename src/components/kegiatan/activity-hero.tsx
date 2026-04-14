'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ActivityHeroProps {
  title: string;
  image: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

const textContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const textChild = {
  hidden: { opacity: 0, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease },
  },
};

const imageCard = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease, delay: 0.05 },
  },
};

export default function ActivityHero({ title, image }: ActivityHeroProps) {
  const words = title.split(' ');
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax: image pans vertically inside the card as you scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  // Title drifts left slightly on scroll
  const titleX = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);

  return (
    <section
      ref={sectionRef}
      className="relative flex items-center justify-center min-h-svh overflow-hidden"
    >
      {/* Image card — behind text, container clips the parallax */}
      <motion.div
        variants={imageCard}
        initial="hidden"
        animate="visible"
        className="absolute z-[1] w-[220px] h-[340px] sm:w-[280px] sm:h-[440px] lg:w-[350px] lg:h-[550px] rounded-[24px] sm:rounded-[30px] overflow-hidden"
      >
        <motion.img
          src={image}
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 w-full object-cover brightness-105"
          style={{
            height: '130%',
            top: '-15%',
            y: imgY,
            willChange: 'transform',
          }}
        />
      </motion.div>

      {/* Title — on top of image, drifts left on scroll */}
      <motion.h1
        variants={textContainer}
        initial="hidden"
        animate="visible"
        className="relative z-[2] font-serif font-normal italic text-foreground text-center leading-[0.85] tracking-[-0.04em]"
        style={{ fontSize: 'clamp(110px, 14vw, 16rem)', x: titleX, willChange: 'transform' }}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={textChild}
            className="block"
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>
    </section>
  );
}
