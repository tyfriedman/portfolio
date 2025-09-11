import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ty Friedman - Portfolio",
  description: "Personal portfolio showcasing academic history, experience, projects, and contact information",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
