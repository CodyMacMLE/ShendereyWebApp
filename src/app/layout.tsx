import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/Theme/page";
import { AuthProvider } from "./AuthProvider";

import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | Shenderey Gymnastics',
    default: 'Shenderey Gymnastics | Premier Gymnastics Club in Newmarket, Ontario',
  },
  description: 'Shenderey Gymnastics Centre is a premier gymnastics club in Newmarket, Ontario, offering recreational and competitive programs for all ages since 1984.',
  keywords: ['gymnastics', 'Newmarket', 'Ontario', 'competitive gymnastics', 'recreational gymnastics', 'gymnastics classes', 'gymnastics club', 'Shenderey'],
  openGraph: {
    type: 'website',
    siteName: 'Shenderey Gymnastics',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon.png", type: "image/png" }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <ThemeProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <main>
            {children}
          </main>
          <SpeedInsights />
          </body>
        </html>
      </ThemeProvider>
    </AuthProvider>
  );
}
