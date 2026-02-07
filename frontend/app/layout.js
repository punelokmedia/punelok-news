import { Geist, Geist_Mono } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Punelok - News App",
  description: "Latest news and updates",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LanguageProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
