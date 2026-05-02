import { Geist, Geist_Mono, Mukta, Newsreader, Noto_Sans_Devanagari } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import { LanguageProvider } from "@/context/LanguageContext";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Body / headlines for Marathi & Hindi — readable Devanagari news typography */
const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-mukta",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-deva",
  adjustFontFallback: true,
});

/** English UI & article text — editorial serif suited to news */
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata = {
  title: "Punelok - News App",
  description: "Latest news and updates",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mr" className="overflow-x-hidden" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${mukta.variable} ${notoDevanagari.variable} ${newsreader.variable} overflow-x-hidden max-w-full w-full antialiased`}>
        <NextTopLoader color="#C40B0B" showSpinner={false} height={3} shadow="0 0 10px #C40B0B,0 0 5px #C40B0B" />
        <LanguageProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
