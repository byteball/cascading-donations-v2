import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Footer, Header, WelcomeBanner } from './_layout';

import './globals.css';

import { StoreProvider } from '@/store/StoreProvider';
import { GithubSessionProvider } from './_layout/GithubSessionProvider/GithubSessionProvider';
import { CookieBanner } from '@/components/CookieBanner/CookieBanner';
import { WebVitals } from '@/components/WebVitals/WebVitals';
import { GoogleAnalytics } from '@/components/GoogleAnalytics/GoogleAnalytics';

import appConfig from '@/appConfig';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.PUBLIC_URL!),
  title: 'Kivach — cascading donations',
  description: 'Cascading donations to github repositories. Support open-source projects with donations in crypto, and they will automatically forward a part of your donation to other open-source projects that made them possible.',
}

export default function RootLayout({
  children,

}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WebVitals />
        <WelcomeBanner />
        <GithubSessionProvider>
          <StoreProvider>
            <CookieBanner />
            <Header />

            <div className="mx-auto flex max-w-7xl p-6 lg:px-8">
              <div className='w-full'>
                <GoogleAnalytics />

                {children}
              </div>
            </div>

            <Footer />
          </StoreProvider>
        </GithubSessionProvider>
      </body>
    </html>
  )
}
