import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spend Tracker",
  description: "Track your spending and transactions",
  icons: {
    icon: "/icon.png",
  },
};

export default function SpendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
    </div>
  );
}

