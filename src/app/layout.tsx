import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ty Friedman - Portfolio",
  description: "Personal portfolio showcasing academic history, experience, projects, and contact information",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // #region agent log
  const isServer = typeof window === 'undefined';
  const bodyClassName = 'antialiased';
  fetch('http://127.0.0.1:7245/ingest/18a31cd8-5366-4906-b5f7-0f4b58a08ff9', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H1',
      location: 'app/layout.tsx:RootLayout',
      message: 'Root layout rendering',
      data: {
        isServer,
        bodyClassName,
        hasHtmlTag: true,
        hasBodyTag: true,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <html lang="en">
      <body className={bodyClassName}>
        {children}
      </body>
    </html>
  );
}
