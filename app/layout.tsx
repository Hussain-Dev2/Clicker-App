import type { Metadata } from 'next';
import Header from '@/components/Header';
import { Providers } from './providers';
import './globals.css';
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'RECKON - Earn Rewards',
  description: 'Transform your clicks into rewards with RECKON earning platform',
  icons: {
    icon: [
      { url: '/RECKON.jpg', sizes: 'any' },
      { url: '/RECKON.jpg', sizes: '16x16', type: 'image/jpeg' },
      { url: '/RECKON.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/RECKON.jpg', sizes: '192x192', type: 'image/jpeg' },
      { url: '/RECKON.jpg', sizes: '512x512', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/RECKON.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Theme Script - Runs before page renders to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const isDark = theme === 'dark' || 
                    (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4681103183883079"
          crossOrigin="anonymous"
        />
        {/* Google AdSense Auto Ads - Automatically places ads throughout the site */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: "ca-pub-4681103183883079",
                enable_page_level_ads: true,
                overlays: {bottom: true}
              });
            `,
          }}
        />
      </head>
      <body className="bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:from-gray-900 dark:via-cyan-900 dark:to-orange-950 text-gray-900 dark:text-gray-50 transition-all duration-500 ease-in-out">
        <Providers>
          <Header />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}