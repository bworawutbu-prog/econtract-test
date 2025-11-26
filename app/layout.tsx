import type { Metadata } from "next";
import {
  Sarabun,
  Kanit,
  Noto_Sans_Thai,
  IBM_Plex_Sans_Thai,
} from "next/font/google";

import { LayoutProvider } from "@/components/layout/layoutProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { ClientErrorBoundary } from "@/components/utils/ClientErrorBoundary";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

import "./globals.css";
import "../store/libs/antd-patch";

// Optimize font loading - load only essential weights and use font-display: swap
const sarabun = Sarabun({
  weight: ["400", "500", "700"], // Remove 300 weight to reduce bundle size
  subsets: ["latin"],
  variable: "--font-sarabun",
  display: "swap",
  preload: true, // Preload for better performance
});

const kanit = Kanit({
  weight: ["400", "500", "700"], // Only essential weights
  subsets: ["latin", "thai"],
  variable: "--font-kanit",
  display: "swap",
  preload: false, // Don't preload all fonts to reduce initial load
});

const notoSansThai = Noto_Sans_Thai({
  weight: ["400", "500", "700"], // Only essential weights
  subsets: ["latin", "thai"],
  variable: "--font-noto-sans-thai",
  display: "swap",
  preload: false,
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ["400", "500", "700"], // Only essential weights
  subsets: ["latin", "thai"],
  variable: "--font-ibm-plex-sans-thai",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Digitract",
  description: "ระบบธุรกรรมสัญญาอิเล็กทรอนิกส์",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body
        suppressHydrationWarning
        className={`${sarabun.variable} ${kanit.variable} ${notoSansThai.variable} ${ibmPlexSansThai.variable} antialiased`}
      >
        {/* <ClientErrorBoundary> */}
          <LocaleProvider locale={locale} dictionary={dictionary}>
            <LayoutProvider>{children}</LayoutProvider>
          </LocaleProvider>
        {/* </ClientErrorBoundary> */}
      </body>
    </html>
  );
}
