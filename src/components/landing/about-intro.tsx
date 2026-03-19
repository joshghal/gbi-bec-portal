"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CollageImage {
  top: string;
  left: string;
  width: string;
  aspect: string;
  radius: number;
  rotate?: number;
  src: string;
  alt: string;
  tint?: "navy" | "brown";
  mobileHidden?: boolean;
  mobileClass?: string;
  depth: number;
}

const IMAGES: CollageImage[] = [
  {
    top: "-2%",
    left: "-1%",
    width: "clamp(240px, 26vw, 360px)",
    aspect: "4/3",
    radius: 22,
    rotate: -2,
    src: "/about/worship.webp",
    alt: "Jemaat beribadah",
    tint: "brown",
    mobileClass: "ci-worship",
    depth: 2,
  },
  {
    top: "30%",
    left: "12%",
    width: "clamp(90px, 11vw, 150px)",
    aspect: "1/1",
    radius: 12,
    rotate: 3,
    src: "/about/prayer.webp",
    alt: "Berdoa bersama",
    tint: "navy",
    mobileHidden: true,
    depth: 4,
  },
  {
    top: "46%",
    left: "-1%",
    width: "clamp(150px, 21vw, 290px)",
    aspect: "3/4",
    radius: 20,
    rotate: 1.5,
    src: "/about/youth.webp",
    alt: "Pemuda gereja",
    tint: "brown",
    mobileClass: "ci-youth",
    depth: 3.5,
  },
  {
    top: "74%",
    left: "8%",
    width: "clamp(140px, 19vw, 260px)",
    aspect: "4/3",
    radius: 18,
    rotate: 2.5,
    src: "/about/family.webp",
    alt: "Keluarga jemaat",
    tint: "navy",
    mobileHidden: true,
    depth: 0.7,
  },
  {
    top: "-1%",
    left: "80%",
    width: "clamp(160px, 23vw, 320px)",
    aspect: "3/4",
    radius: 20,
    rotate: 2,
    src: "/about/kids.webp",
    alt: "Anak-anak",
    tint: "navy",
    mobileClass: "ci-kids",
    depth: 1,
  },
  {
    top: "38%",
    left: "77%",
    width: "clamp(170px, 24vw, 330px)",
    aspect: "3/4",
    radius: 22,
    rotate: -2,
    src: "/about/community.webp",
    alt: "Kebersamaan komunitas",
    tint: "brown",
    mobileClass: "ci-community",
    depth: 3,
  },
  {
    top: "71%",
    left: "73%",
    width: "clamp(130px, 18vw, 240px)",
    aspect: "4/3",
    radius: 16,
    rotate: 1.5,
    src: "/about/seniors.webp",
    alt: "Jemaat senior",
    tint: "brown",
    mobileHidden: true,
    depth: 1,
  },
];

const STYLES = `
  /* Declare --sp as a typed CSS number so calc() can multiply it with px lengths.
     GSAP animates --sp on the section (0→1), each image derives its own translateY
     via calc() — 1 style write per frame instead of 7. */
  @property --sp {
    syntax: '<number>';
    inherits: true;
    initial-value: 0;
  }

  /* Mobile: disable per-image CSS-var parallax — the collage wrapper handles it instead */
  @media (max-width: 767px) {
    .ci-item { transform: none !important; will-change: auto !important; }
    .ci-worship   { top: 2%  !important; left: -5% !important; width: 55vw !important; }
    .ci-youth     { top: 55% !important; left: -5% !important; width: 48vw !important; }
    .ci-kids      { top: 2%  !important; left: 55% !important; width: 50vw !important; }
    .ci-community { top: 52% !important; left: 52% !important; width: 52vw !important; }
  }
`;

export default function AboutIntro() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !wrapperRef.current) return;

    const isDesktop = window.matchMedia("(min-width: 768px)").matches;

    const ctx = gsap.context(() => {
      // Section fade in → hold → fade out
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 95%",
            end: "bottom 5%",
            scrub: true,
          },
        })
        .fromTo(
          wrapperRef.current,
          { opacity: 0 },
          { opacity: 1, ease: "none", duration: 0.15 },
        )
        .to(wrapperRef.current, { opacity: 1, ease: "none", duration: 0.7 })
        .to(wrapperRef.current, { opacity: 0, ease: "none", duration: 0.15 });

      if (isDesktop) {
        // Animate a single CSS custom property on the section element (1 style write/frame).
        // Each image div reads var(--sp) in its transform via CSS calc() — the browser
        // computes per-image translateY natively with zero extra JS per frame.
        gsap.fromTo(
          sectionRef.current,
          { "--sp": 0 },
          {
            "--sp": 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      } else {
        // Mobile: no JS-driven transform — static collage, removes per-frame
        // main-thread work during scroll. Opacity fade above is compositor-only.
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="tentang" className="relative h-[200vh]">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          ref={wrapperRef}
          className="relative w-full h-full"
          style={{ opacity: 0 }}
        >
          <div ref={collageRef} className="absolute inset-0">
            {IMAGES.map((image, i) => {
              const range = 70 * image.depth;
              return (
                <div
                  key={i}
                  className={`ci-item absolute overflow-hidden ${image.mobileHidden ? "hidden md:block" : ""} ${image.mobileClass ?? ""}`}
                  style={{
                    top: image.top,
                    left: image.left,
                    width: image.width,
                    aspectRatio: image.aspect,
                    borderRadius: image.radius,
                    rotate: `${image.rotate ?? 0}deg`,
                    boxShadow: "0 8px 24px -6px rgba(0,0,0,0.15)",
                    // translateY derived from --sp (animated by GSAP on the section).
                    // sp=0 → +range (enters from below), sp=1 → -range (exits above).
                    transform: `translateY(calc(${range}px - var(--sp) * ${2 * range}px))`,
                    willChange: "transform",
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="absolute inset-0 w-full h-full object-cover grayscale"
                    loading="lazy"
                  />
                  {image.tint === "navy" && (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: "rgba(20, 38, 72, 0.42)" }}
                    />
                  )}
                  {image.tint === "brown" && (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: "rgba(55, 35, 18, 0.42)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Vignette */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none md:hidden"
            style={{
              background:
                "radial-gradient(ellipse 90% 65% at center, oklch(0.97 0.005 70 / 1) 0%, oklch(0.97 0.005 70 / 0.9) 45%, transparent 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none hidden md:block"
            style={{
              background:
                "radial-gradient(ellipse 55% 55% at center, oklch(0.97 0.005 70 / 0.82) 0%, oklch(0.97 0.005 70 / 0.4) 55%, transparent 100%)",
            }}
          />

          {/* Centered description */}
          <div className="relative z-10 h-full flex items-center justify-center px-6">
            <div className="max-w-2xl text-center">
              <p className="text-sm tracking-[0.2em] text-muted-foreground font-medium uppercase">
                Tentang Kami
              </p>
              <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1]">
                Satu Keluarga dalam Kristus
              </h2>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
                Komunitas yang saling menguatkan melalui ibadah, pelayanan, dan
                kehidupan sehari-hari bersama.
              </p>
              <div className="mt-6 mx-auto w-[80px] h-px bg-primary/40" />
              <p className="mt-5 font-serif italic text-base text-muted-foreground">
                Sebagai bagian dari Gereja Bethel Indonesia
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
