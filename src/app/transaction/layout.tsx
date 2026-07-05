import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Add Transaction",
  description: "Quickly add a budget transaction",
  icons: {
    icon: "/icon.png",
  },
};

export default function TransactionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="bg-white text-gray-900">{children}</div>;
}
