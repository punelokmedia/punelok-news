'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import ExplorerSidebar from './ExplorerSidebar';
import AdsPopup from './AdsPopup';
import { FaWhatsapp } from 'react-icons/fa';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/user');
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const shouldHideLayout = isDashboard || isAuthPage;
  const whatsappChatLink = "https://wa.me/918956776951?text=Hello%20Punelok%20team%2C%20I%20need%20help.";

  return (
    <div className="overflow-x-hidden w-full max-w-full min-w-0">
      {!shouldHideLayout && <Navbar />}
      {!shouldHideLayout && <ExplorerSidebar />}
      <main className={`${!shouldHideLayout ? 'main-with-fixed-nav lg:pl-[136px]' : ''} min-h-[50vh] overflow-x-hidden w-full max-w-full min-w-0 relative`}>
        {children}
        {!shouldHideLayout && pathname === '/' && <AdsPopup />}
      </main>
      {!shouldHideLayout && (
        <>
          <div className="lg:pl-[136px]">
            <Footer />
          </div>
          {pathname === '/' && (
            <a
              href={whatsappChatLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="fixed right-4 bottom-5 z-[5000] w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform duration-200 flex items-center justify-center"
            >
              <FaWhatsapp size={30} />
            </a>
          )}
        </>
      )}
    </div>
  );
}
