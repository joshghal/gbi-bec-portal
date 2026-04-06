"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Tentang", href: "#tentang" },
  { label: "Kegiatan", href: "#kegiatan" },
  { label: "Jadwal", href: "#jadwal" },
  { label: "Kontak", href: "#kontak" },
] as const;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Overlay is not mounted at all until first open — no fixed full-screen
  // layer in the DOM during page load / hero animation.
  const [overlayMounted, setOverlayMounted] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  // Ref guard: avoids calling into React scheduler on every scroll event.
  // setScrolled only fires when the value actually flips.
  const scrolledRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onScroll = () => {
      const isPast = window.scrollY > 80;
      if (isPast === scrolledRef.current) return;
      scrolledRef.current = isPast;
      setScrolled(isPast);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openMenu = useCallback(() => {
    clearTimeout(closeTimer.current);
    setOverlayMounted(true);
    setMobileOpen(true);
    // Double-rAF: let overlay mount with opacity:0, then trigger transition
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setOverlayVisible(true))
    );
    document.body.style.overflow = 'hidden';
  }, []);

  const closeMenu = useCallback(() => {
    setOverlayVisible(false);
    setMobileOpen(false);
    document.body.style.overflow = '';
    // Unmount overlay after CSS transition finishes
    closeTimer.current = setTimeout(() => setOverlayMounted(false), 300);
  }, []);

  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    document.body.style.overflow = '';
  }, []);

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        style={{ pointerEvents: "none", willChange: "transform" }}
      >
        <nav
          className="flex items-center w-full pointer-events-auto px-4 sm:px-6 lg:px-12"
          style={{
            paddingTop: scrolled ? 8 : 0,
            transition: 'padding-top 500ms cubic-bezier(0.25,0.1,0.25,1)',
          }}
        >
          <div
            className="flex items-center justify-between w-full h-14 max-w-6xl mx-auto px-4 sm:px-6"
            style={{
              backgroundColor: scrolled ? "oklch(0.965 0.010 70 / 0.96)" : "oklch(0.965 0.010 70 / 0)",
              borderRadius: scrolled ? 20 : 0,
              boxShadow: scrolled
                ? "0 2px 20px -4px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.04)"
                : "none",
              transition: 'background-color 500ms, border-radius 500ms, box-shadow 500ms',
            }}
          >
            {/* Brand — plain img avoids Next/Image IntersectionObserver + layout watcher init */}
            <Link href="/" className="shrink-0 flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="GBI Sukawarna" width={100} height={28} style={{ width: "100px", height: "28px" }} />
            </Link>

            {/* Desktop links */}
            <ul className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="px-3 py-1.5 text-[13px] font-medium text-foreground/50 rounded-full transition-colors duration-200 hover:text-foreground hover:bg-foreground/[0.04]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Right */}
            <div className="flex items-center gap-3">
              <Link
                href="/helpdesk"
                className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-1.5 text-[13px] font-semibold text-background transition-opacity duration-200 hover:opacity-85"
              >
                Tanya AI Kami
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="opacity-50">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <button
                type="button"
                aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
                aria-expanded={mobileOpen}
                className="md:hidden relative w-6 h-5 flex flex-col justify-between mr-2"
                onClick={() => mobileOpen ? closeMenu() : openMenu()}
              >
                <span className="block h-[1.5px] w-6 rounded-full bg-foreground origin-center transition-transform duration-[250ms]"
                  style={{ transform: mobileOpen ? 'rotate(45deg) translateY(9px)' : 'none' }} />
                <span className="block h-[1.5px] w-6 rounded-full bg-foreground transition-opacity duration-150"
                  style={{ opacity: mobileOpen ? 0 : 1 }} />
                <span className="block h-[1.5px] w-6 rounded-full bg-foreground origin-center transition-transform duration-[250ms]"
                  style={{ transform: mobileOpen ? 'rotate(-45deg) translateY(-9px)' : 'none' }} />
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile overlay — only mounted after first open, unmounted after close animation */}
      {overlayMounted && (
        <div
          className="fixed inset-0 z-40 md:hidden flex flex-col"
          style={{
            opacity: overlayVisible ? 1 : 0,
            transition: 'opacity 250ms',
            backgroundColor: 'oklch(0.965 0.010 70 / 0.97)',
            pointerEvents: overlayVisible ? 'auto' : 'none',
          }}
        >
          <nav className="flex flex-col justify-center items-start flex-1 px-8">
            {NAV_LINKS.map(({ label, href }, i) => (
              <a
                key={href}
                href={href}
                className="block py-3 font-serif text-3xl sm:text-4xl font-bold text-foreground/80 transition-[opacity,transform] hover:text-foreground"
                style={{
                  transitionDuration: '350ms',
                  transitionDelay: overlayVisible ? `${i * 60}ms` : '0ms',
                  opacity: overlayVisible ? 1 : 0,
                  transform: overlayVisible ? 'none' : 'translateX(-20px)',
                }}
                onClick={closeMenu}
              >
                {label}
              </a>
            ))}

            <div
              className="mt-8 transition-[opacity,transform]"
              style={{
                transitionDuration: '350ms',
                transitionDelay: overlayVisible ? '240ms' : '0ms',
                opacity: overlayVisible ? 1 : 0,
                transform: overlayVisible ? 'none' : 'translateY(12px)',
              }}
            >
              <Link
                href="/helpdesk"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-base font-semibold text-background transition-opacity hover:opacity-85"
                onClick={closeMenu}
              >
                Tanya AI Kami
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="opacity-50">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <p
              className="absolute bottom-8 left-8 text-xs text-muted-foreground/50 transition-opacity duration-300"
              style={{
                transitionDelay: overlayVisible ? '320ms' : '0ms',
                opacity: overlayVisible ? 1 : 0,
              }}
            >
              GBI Baranangsiang Evening Church
            </p>
          </nav>
        </div>
      )}
    </>
  );
}
