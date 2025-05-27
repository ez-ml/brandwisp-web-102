import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BrandWisp",
  description: "AI-powered Shopify app for product idea generation, blog automation, and analytics.",
  keywords: [
    "BrandWisp",
    "Shopify",
    "AI",
    "product idea generation",
    "blog automation",
    "analytics",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F6F0FF] text-[#1E293B]`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
