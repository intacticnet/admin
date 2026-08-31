'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
  LayoutDashboard,
  Wrench,
  Box,
  Building2,
  FileText,
  PenSquare,
  Users,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <LayoutDashboard className="size-4" /> },
  { label: 'Services', href: '/services', icon: <Wrench className="size-4" /> },
  { label: 'Products', href: '/products', icon: <Box className="size-4" /> },
  { label: 'Industries', href: '/industries', icon: <Building2 className="size-4" /> },
  { label: 'Case Studies', href: '/case-studies', icon: <FileText className="size-4" /> },
  { label: 'Blog Posts', href: '/blog', icon: <PenSquare className="size-4" /> },
  { label: 'Authors', href: '/authors', icon: <Users className="size-4" /> },
  { label: 'Team', href: '/team', icon: <UserCog className="size-4" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="size-4" /> },
];

function getPageTitle(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'Dashboard';
  const item = navItems.find((i) => i.href === pathname);
  if (item) return item.label;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length >= 2) {
    const parentItem = navItems.find((i) => i.href === `/${parts[0]}/${parts[1]}`);
    if (parentItem) {
      const sub = parts.slice(2).join(' ');
      return sub
        ? `${parentItem.label} / ${sub.charAt(0).toUpperCase() + sub.slice(1)}`
        : parentItem.label;
    }
  }
  return 'Admin';
}

const LOGIN_PATH = '/login';

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // B11 FIX: Guard against null supabase client (env vars missing)
  if (!supabase) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 font-medium">Service is not configured.</p>
          <p className="text-sm text-zinc-500 mt-1">Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  const isLoginPage = pathname === LOGIN_PATH;

  const [user, setUser] = useState<{ email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(isLoginPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Adjust authChecked when isLoginPage changes (React recommended pattern)
  const [prevIsLoginPage, setPrevIsLoginPage] = useState(isLoginPage);
  if (prevIsLoginPage !== isLoginPage) {
    setPrevIsLoginPage(isLoginPage);
    if (isLoginPage) {
      setAuthChecked(true);
    }
  }

  // Close sidebar when pathname changes (React recommended pattern)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setSidebarOpen(false);
  }

  // Auth check effect (only sets state in async callbacks)
  useEffect(() => {
    if (isLoginPage) return;

    let cancelled = false;

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        router.push(LOGIN_PATH);
        return;
      }

      setUser({ email: user.email ?? '' });
      setAuthChecked(true);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push(LOGIN_PATH);
      } else if (session.user) {
        setUser({ email: session.user.email ?? '' });
        if (isLoginPage) {
          router.push('/');
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router, supabase.auth, isLoginPage]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(LOGIN_PATH);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '';
    return pathname.startsWith(href);
  };

  // Login page: render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state for authenticated routes
  const loading = !authChecked;
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400 text-sm">Loading...</div>
      </div>
    );
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 text-white flex flex-col
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
          <div>
            <div className="text-base font-bold tracking-tight">Intactic CMS</div>
            <div className="text-[11px] text-zinc-400">Admin Panel</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Admin navigation">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    isActive(item.href)
                      ? 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-white/10 text-white transition-colors duration-150'
                      : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors duration-150'
                  }
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom: User & Logout */}
        <div className="border-t border-white/10 px-3 py-4 shrink-0">
          {user && (
            <div className="px-3 mb-3 truncate">
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider">
                Signed in as
              </div>
              <div className="text-sm text-zinc-300 truncate">{user.email}</div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors duration-150"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-zinc-100 transition-colors mr-3"
            aria-label="Open sidebar"
          >
            <Menu className="size-5 text-zinc-600" />
          </button>
          <h1 className="text-lg font-semibold text-zinc-900">{pageTitle}</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
