'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import ExplorerSidebar from './ExplorerSidebar';
import AdsPopup from './AdsPopup';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/user');
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const shouldHideLayout = isDashboard || isAuthPage;

  return (
    <div className="overflow-x-hidden w-full max-w-full min-w-0">
      {!shouldHideLayout && <Navbar />}
      {!shouldHideLayout && <ExplorerSidebar />}
      <main className={`${!shouldHideLayout ? 'main-with-fixed-nav lg:pl-[136px]' : ''} min-h-[50vh] overflow-x-hidden w-full max-w-full min-w-0 relative`}>
        {children}
        {!shouldHideLayout && pathname === '/' && <AdsPopup />}
      </main>
      {!shouldHideLayout && <Footer />}
    </div>
  );
}
