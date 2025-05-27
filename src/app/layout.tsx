import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import ClientLayout from './client-layout';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://brandwisp.com'),
  title: {
    default: "BrandWisp - AI-Powered E-commerce Management",
    template: "%s | BrandWisp"
  },
  description: "Connect and manage all your e-commerce stores with AI-powered tools. Boost sales, automate content, and scale your business with BrandWisp.",
  keywords: [
    "BrandWisp",
    "e-commerce management",
    "AI tools",
    "product automation",
    "content generation",
    "SEO optimization",
    "analytics",
    "Shopify",
    "Amazon",
    "Etsy"
  ],
  authors: [{ name: "BrandWisp" }],
  creator: "BrandWisp",
  publisher: "BrandWisp",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://brandwisp.com',
    siteName: 'BrandWisp',
    title: 'BrandWisp - AI-Powered E-commerce Management',
    description: 'Connect and manage all your e-commerce stores with AI-powered tools. Boost sales, automate content, and scale your business.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BrandWisp - AI-Powered E-commerce Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BrandWisp - AI-Powered E-commerce Management',
    description: 'Connect and manage all your e-commerce stores with AI-powered tools. Boost sales, automate content, and scale your business.',
    images: ['/images/twitter-image.png'],
    creator: '@brandwisp',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: 'your-google-site-verification',
  },
  alternates: {
    canonical: 'https://brandwisp.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
