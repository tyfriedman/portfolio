import Script from "next/script";
import type { Metadata } from "next";
import { THEME_INIT_SCRIPT } from "@/budget/components/ThemeToggle";
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
  return (
    <>
      <Script
        id="budget-theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
      />
      {children}
    </>
  );
}
