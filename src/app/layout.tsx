import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ty Friedman",
  description: "A domain mostly used to host personal projects.",
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
  return (
    <html lang="en" suppressHydrationWarning>
      {process.env.NODE_ENV === "development" && (
        <head>
          {/*
            Dev-only workaround for https://github.com/vercel/next.js/issues/86060:
            React's development performance tracks call performance.measure()
            with a negative timestamp when notFound()/redirect() interrupts a
            server component. Swallow only that specific error. This block is
            not emitted in production builds.
          */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var m=performance.measure.bind(performance);performance.measure=function(){try{return m.apply(this,arguments)}catch(e){if(e&&/negative time stamp|cannot be negative/i.test(String(e.message)))return;throw e}}})();`,
            }}
          />
        </head>
      )}
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
