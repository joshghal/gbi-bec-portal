import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WaIcon, ArrowIcon } from '@/components/landing/icons';

/* ── Variants ─────────────────────────────────────────────────── */

type Variant =
  | 'primary'       // Solid primary color — main CTA on light bg
  | 'primary-sm'    // Smaller primary — card CTAs
  | 'white'         // Solid white — CTA on dark bg
  | 'glass'         // Semi-transparent white border — on dark bg
  | 'glass-light'   // Solid near-white — secondary on dark bg
  | 'outline'       // Border + card bg — secondary on light bg
  | 'text'          // Text link with underline
  | 'text-arrow'    // Text with arrow, no underline

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'rounded-full bg-primary text-primary-foreground px-7 py-3 text-sm font-medium shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25',
  'primary-sm':
    'rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-xs font-semibold hover:opacity-90',
  white:
    'rounded-full bg-white text-black px-7 py-3.5 text-sm font-semibold hover:opacity-90',
  glass:
    'rounded-full px-5 py-2.5 text-sm font-semibold border hover:opacity-85',
  'glass-light':
    'rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90',
  outline:
    'rounded-full border border-border/60 bg-card px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border',
  text:
    'text-sm font-medium underline decoration-foreground/25 underline-offset-4 hover:decoration-primary hover:underline-offset-6 hover:text-primary',
  'text-arrow':
    'text-sm font-medium text-muted-foreground/40 hover:text-muted-foreground/80',
};

/* Dark-bg variants get inline styles for rgba colors */
const DARK_INLINE: Record<string, React.CSSProperties> = {
  glass: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.25)',
    color: 'rgba(255,255,255,0.90)',
  },
  'glass-light': {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
};

/* ── Props ────────────────────────────────────────────────────── */

interface LandingButtonProps {
  variant?: Variant;
  href: string;
  external?: boolean;
  children: React.ReactNode;
  arrow?: boolean;
  whatsapp?: boolean;
  /** For glass-light variant: pass the dark bg color for text contrast */
  darkTextColor?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

/* ── Component ────────────────────────────────────────────────── */

export function LandingButton({
  variant = 'primary',
  href,
  external,
  children,
  arrow,
  whatsapp,
  darkTextColor,
  className,
  onClick,
}: LandingButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 transition-all';
  const variantCls = VARIANT_CLASSES[variant];
  const inlineStyle: React.CSSProperties = {
    ...(DARK_INLINE[variant] || {}),
    ...(variant === 'glass-light' && darkTextColor ? { color: darkTextColor } : {}),
  };

  const content = (
    <>
      {whatsapp && <WaIcon className="w-4 h-4 shrink-0" />}
      {children}
      {arrow && <ArrowIcon className="transition-transform group-hover:translate-x-0.5" />}
    </>
  );

  const classes = cn(base, variantCls, className);

  if (onClick) {
    return (
      <button type="button" className={cn(classes, 'group')} style={inlineStyle} onClick={onClick}>
        {content}
      </button>
    );
  }

  if (external || href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn(classes, 'group')} style={inlineStyle}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cn(classes, 'group')} style={inlineStyle}>
      {content}
    </Link>
  );
}
