import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Austin Apartments",
  description: "Housing options in Austin, TX",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // #region agent log
  const isServer = typeof window === 'undefined';
  const geistSansVar = geistSans.variable;
  const geistMonoVar = geistMono.variable;
  const wrapperClassName = `${geistSansVar} ${geistMonoVar}`;
  fetch('http://127.0.0.1:7245/ingest/18a31cd8-5366-4906-b5f7-0f4b58a08ff9', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'post-fix',
      hypothesisId: 'H1',
      location: 'app/austin/layout.tsx:RootLayout',
      message: 'Austin layout rendering (fixed)',
      data: {
        isServer,
        geistSansVar,
        geistMonoVar,
        wrapperClassName,
        hasHtmlTag: false,
        hasBodyTag: false,
        hasWrapperDiv: true,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <div className={wrapperClassName}>
      {children}
    </div>
  );
}
