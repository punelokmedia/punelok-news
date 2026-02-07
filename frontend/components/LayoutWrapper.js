'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  // Check if the current path is part of the admin or user dashboard, or auth pages
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/user');
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  
  const shouldHideLayout = isDashboard || isAuthPage;

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      <main style={!shouldHideLayout ? { minHeight: '80vh' } : {}}>
        {children}
      </main>
      {!shouldHideLayout && <Footer />}
    </>
  );
}
