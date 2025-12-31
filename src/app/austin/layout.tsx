import type { Metadata } from "next";
import "./globals.css";

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
        hasHtmlTag: false,
        hasBodyTag: false,
        hasWrapperDiv: true,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <div>
      {children}
    </div>
  );
}
