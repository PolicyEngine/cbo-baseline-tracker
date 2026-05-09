import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

const SITE_URL = 'https://cbo-baseline-tracker.vercel.app';
const TITLE = 'CBO Baseline Tracker | PolicyEngine';
const DESCRIPTION =
  'Track and compare Congressional Budget Office (CBO) baseline projections across years. Explore revenue, spending, income, and CPI parameter changes with interactive charts and heatmaps.';
const OG_DESCRIPTION =
  'Track and compare Congressional Budget Office (CBO) baseline projections across years. Explore revenue, spending, income, and CPI parameter changes with interactive charts.';
const TWITTER_DESCRIPTION =
  'Track and compare CBO baseline projections across years. Interactive charts for revenue, spending, income, and CPI parameters.';
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const GA_MEASUREMENT_ID = 'G-2YHG89FY0N';
const TOOL_NAME = 'cbo-baseline-tracker';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'CBO',
    'Congressional Budget Office',
    'baseline projections',
    'budget tracker',
    'federal revenue',
    'federal spending',
    'CPI',
    'PolicyEngine',
    'fiscal policy',
  ],
  authors: [{ name: 'PolicyEngine' }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: OG_DESCRIPTION,
    url: SITE_URL,
    siteName: 'PolicyEngine',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'CBO Baseline Tracker by PolicyEngine - Compare CBO budget projections',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: TWITTER_DESCRIPTION,
    site: '@ThePolicyEngine',
    images: [
      {
        url: OG_IMAGE,
        alt: 'CBO Baseline Tracker by PolicyEngine',
      },
    ],
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#2C6496',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CBO Baseline Tracker',
  description: DESCRIPTION,
  url: SITE_URL,
  applicationCategory: 'GovernmentApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  author: {
    '@type': 'Organization',
    name: 'PolicyEngine',
    url: 'https://policyengine.org',
  },
  provider: {
    '@type': 'Organization',
    name: 'PolicyEngine',
    url: 'https://policyengine.org',
  },
  isAccessibleForFree: true,
  about: {
    '@type': 'GovernmentOrganization',
    name: 'Congressional Budget Office',
    url: 'https://www.cbo.gov',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          // The structured-data payload is a static JSON object built above.
          // dangerouslySetInnerHTML is the standard React pattern for inline
          // JSON-LD blocks; the input is not user-controlled.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { tool_name: '${TOOL_NAME}' });
          `}
        </Script>
        <Script id="ga-engagement" strategy="afterInteractive">
          {`
            (function() {
              var TOOL_NAME = '${TOOL_NAME}';
              if (typeof window === 'undefined' || !window.gtag) return;

              var scrollFired = {};
              window.addEventListener('scroll', function() {
                var docHeight = document.documentElement.scrollHeight - window.innerHeight;
                if (docHeight <= 0) return;
                var pct = Math.floor((window.scrollY / docHeight) * 100);
                [25, 50, 75, 100].forEach(function(m) {
                  if (pct >= m && !scrollFired[m]) {
                    scrollFired[m] = true;
                    window.gtag('event', 'scroll_depth', { percent: m, tool_name: TOOL_NAME });
                  }
                });
              }, { passive: true });

              [30, 60, 120, 300].forEach(function(sec) {
                setTimeout(function() {
                  if (document.visibilityState !== 'hidden') {
                    window.gtag('event', 'time_on_tool', { seconds: sec, tool_name: TOOL_NAME });
                  }
                }, sec * 1000);
              });

              document.addEventListener('click', function(e) {
                var link = e.target && e.target.closest ? e.target.closest('a') : null;
                if (!link || !link.href) return;
                try {
                  var url = new URL(link.href, window.location.origin);
                  if (url.hostname && url.hostname !== window.location.hostname) {
                    window.gtag('event', 'outbound_click', {
                      url: link.href,
                      target_hostname: url.hostname,
                      tool_name: TOOL_NAME
                    });
                  }
                } catch (err) {}
              });
            })();
          `}
        </Script>
        {children}
        <noscript>
          <h1>CBO Baseline Tracker | PolicyEngine</h1>
          <p>
            This application requires JavaScript to run. Please enable
            JavaScript in your browser to use the CBO Baseline Tracker, which
            compares Congressional Budget Office baseline projections across
            years for revenue, spending, income, and CPI parameters.
          </p>
          <p>
            Visit <a href="https://policyengine.org">PolicyEngine</a> for more
            information.
          </p>
        </noscript>
      </body>
    </html>
  );
}
