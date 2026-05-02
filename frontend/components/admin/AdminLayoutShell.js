'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import {
  FaChartLine,
  FaBullhorn,
  FaTachometerAlt,
  FaUsers,
  FaSignOutAlt,
} from 'react-icons/fa';

/** Match dashboard news shortcut buttons to sidebar styling */
export const adminSidebarNewsBtnClass =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-slate-300 transition-all hover:bg-white/10 hover:text-white';

export default function AdminLayoutShell({
  user,
  pageTitle,
  children,
  sidebarExtra = null,
  afterMain = null,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/');
  };

  const navItemClass = (href, paths = []) => {
    const active =
      pathname === href ||
      paths.some((p) => (typeof p === 'string' ? pathname === p : p.test(pathname || '')));
    return [
      'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-all',
      active
        ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-lg shadow-blue-900/40 ring-1 ring-white/20'
        : 'text-slate-300 hover:bg-white/[0.07] hover:text-white',
    ].join(' ');
  };

  const iconWrap = (active) =>
    [
      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
      active ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-400 group-hover:bg-white/10 group-hover:text-white',
    ].join(' ');

  const closeMobile = () => setIsSidebarOpen(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col bg-[#f1f5f9] pt-0"
    >
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-slate-900/60 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 pt-0">
        <aside
          className={`scrollbar-hide fixed z-30 flex h-full w-[272px] flex-col overflow-y-auto border-r border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl shadow-black/40 transition-transform duration-200 ease-out md:relative md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style jsx>{`
            aside::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Brand */}
          <div className="relative border-b border-white/10 px-5 pb-6 pt-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-600/15 to-transparent" />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/90">Punelok</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-white">Admin</h1>
              <p className="mt-0.5 text-xs text-slate-500">Control panel</p>
            </div>
            <button
              type="button"
              onClick={closeMobile}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Close menu"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-5 px-3 py-4">
            <div>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Overview</p>
              <div className="space-y-1">
                <Link
                  href="/admin/dashboard"
                  onClick={closeMobile}
                  className={navItemClass('/admin/dashboard')}
                >
                  <span className={iconWrap(pathname === '/admin/dashboard')}>
                    <FaTachometerAlt className="h-4 w-4" />
                  </span>
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>

            <div>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Users</p>
              <div className="space-y-1">
                <Link
                  href="/admin/users"
                  onClick={closeMobile}
                  className={navItemClass('/admin/users')}
                >
                  <span className={iconWrap(pathname === '/admin/users')}>
                    <FaUsers className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span>Accounts</span>
                    <span className="text-[11px] font-normal text-slate-500 group-hover:text-slate-400">
                      Pending &amp; create
                    </span>
                  </span>
                </Link>
              </div>
            </div>

            {sidebarExtra ? (
              <div>
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">News</p>
                <div className="space-y-1 rounded-xl border border-white/10 bg-white/[0.03] p-2">{sidebarExtra}</div>
              </div>
            ) : null}

            <div>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Site</p>
              <div className="space-y-1">
                <Link
                  href="/admin/market-trends"
                  onClick={closeMobile}
                  className={navItemClass('/admin/market-trends')}
                >
                  <span className={iconWrap(pathname === '/admin/market-trends')}>
                    <FaChartLine className="h-4 w-4" />
                  </span>
                  <span>Market Trends</span>
                </Link>
                <Link href="/admin/ads" onClick={closeMobile} className={navItemClass('/admin/ads')}>
                  <span className={iconWrap(pathname === '/admin/ads')}>
                    <FaBullhorn className="h-4 w-4" />
                  </span>
                  <span>Ads</span>
                </Link>
              </div>
            </div>
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-600/90 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition hover:bg-red-500"
            >
              <FaSignOutAlt className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-8 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 md:hidden"
                aria-label="Open menu"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">{pageTitle}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 sm:inline-flex sm:px-4 sm:py-2 sm:text-sm">
                <span className="text-slate-500">Signed in as</span>
                <span className="ml-1.5 font-semibold text-slate-900">{user?.username}</span>
              </div>
              <div className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-900 sm:hidden">
                {user?.username}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/80 p-4 sm:p-6 md:p-8">{children}</main>
          {afterMain}
        </div>
      </div>
    </motion.div>
  );
}
