'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  BarChart3,
  Activity,
  Settings,
  GraduationCap,
  Droplets,
  Baby,
  HandHeart,
  BookOpen,
  ArrowLeft,
  LogOut,
  Loader2,
  Menu,
  Users,
  Image,
  MessageCircleQuestion,
  Newspaper,
  ScrollText,
  Search,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Konten',
    items: [
      { href: '/admin', label: 'Basis Pengetahuan', icon: FileText, permission: 'page:knowledge-base' },
      { href: '/admin/posters', label: 'Poster', icon: Image, permission: 'page:posters' },
      { href: '/admin/kabar', label: 'Kabar Terbaru', icon: Newspaper, permission: 'page:kabar' },
    ],
  },
  {
    label: 'Formulir',
    items: [
      { href: '/admin/forms/kom', label: 'KOM', icon: GraduationCap, permission: 'page:forms/kom' },
      { href: '/admin/forms/baptism', label: 'Baptisan', icon: Droplets, permission: 'page:forms/baptism' },
      { href: '/admin/forms/child-dedication', label: 'Penyerahan Anak', icon: Baby, permission: 'page:forms/child-dedication' },
      { href: '/admin/forms/prayer', label: 'Pokok Doa', icon: HandHeart, permission: 'page:forms/prayer' },
      { href: '/admin/forms/mclass', label: 'M-Class', icon: BookOpen, permission: 'page:forms/mclass' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { href: '/admin/settings', label: 'Pengaturan Formulir', icon: Settings, permission: 'page:settings' },
      { href: '/admin/analytics', label: 'Analitik', icon: BarChart3, permission: 'page:analytics' },
      { href: '/admin/monitor', label: 'Monitor', icon: Activity, permission: 'page:monitor' },
      { href: '/admin/chat-misses', label: 'Tak Terjawab', icon: MessageCircleQuestion, permission: 'page:chat-misses' },
      { href: '/admin/users', label: 'Kelola Admin', icon: Users, permission: 'page:admin-users' },
      { href: '/admin/log', label: 'Log Aktivitas', icon: ScrollText, permission: 'page:log' },
    ],
  },
];

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function SidebarContent({
  pathname,
  signOut,
  email,
  hasPermission,
}: {
  pathname: string;
  signOut: () => void;
  email: string | null;
  hasPermission: (perm: string) => boolean;
}) {
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter to accessible items, then apply search
  const accessibleGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item =>
      hasPermission(item.permission) || hasPermission(item.permission + ':read')
    ),
  })).filter(group => group.items.length > 0);

  const query = search.trim().toLowerCase();
  const isSearching = query.length > 0;

  const searchResults = isSearching
    ? accessibleGroups.flatMap(g => g.items).filter(item =>
        item.label.toLowerCase().includes(query)
      )
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-5 border-b">
        <p className="font-semibold text-sm">GBI BEC Admin</p>
        {email && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{email}</p>
        )}
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setSearch('')}
            placeholder="Cari menu..."
            className="w-full pl-8 pr-7 py-1.5 text-sm rounded-md border bg-muted/40 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); searchRef.current?.focus(); }}
              className="absolute right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        {isSearching ? (
          searchResults.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground text-center">Tidak ditemukan</p>
          ) : (
            <div className="space-y-0.5">
              {searchResults.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSearch('')}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                      active
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          <div className="space-y-4 pt-1">
            {accessibleGroups.map(group => (
              <div key={group.label}>
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                          active
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t space-y-1">
        <Link
          href="/chat"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Chat
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, isAdmin, adminChecking, adminError, hasPermission, signInWithGoogle, signOut } = useAuth();
  const pathname = usePathname();
  const [signingIn, setSigningIn] = useState(false);
  const [localError, setLocalError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Verifying admin status after sign-in
  if (user && adminChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memverifikasi akses admin...</p>
      </div>
    );
  }

  // Login screen (not signed in, or signed in but not admin)
  if (!user || !isAdmin) {
    const handleGoogleSignIn = async () => {
      setLocalError('');
      setSigningIn(true);
      try {
        await signInWithGoogle();
      } catch {
        setLocalError('Gagal masuk dengan Google.');
      } finally {
        setSigningIn(false);
      }
    };

    const errorMsg = adminError || localError;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">
              GBI BEC Portal
            </p>
          </div>
          {errorMsg && (
            <p className="text-sm text-destructive">{errorMsg}</p>
          )}
          <Button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            variant="outline"
            className="w-full p-[20px]"
          >
            {signingIn ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <GoogleIcon />
            )}
            Masuk dengan Google
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated layout
  return (
    <div className="h-dvh bg-background flex overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] border-r bg-card flex-col shrink-0">
        <SidebarContent
          pathname={pathname}
          signOut={signOut}
          email={user.email}
          hasPermission={hasPermission}
        />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden border-b bg-card px-4 py-3 flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted hover:text-foreground transition-all">
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0" showCloseButton={false}>
              <div onClick={() => setMobileOpen(false)}>
                <SidebarContent
                  pathname={pathname}
                  signOut={signOut}
                  email={user.email}
                  hasPermission={hasPermission}
                />
              </div>
            </SheetContent>
          </Sheet>
          <p className="font-semibold text-sm">GBI BEC Admin</p>
        </div>

        {/* Page content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
