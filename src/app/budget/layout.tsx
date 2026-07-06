import Script from "next/script";
import type { Metadata } from "next";
import { THEME_INIT_SCRIPT } from "@/budget/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budget",
  description: "Personal budget tracker",
  icons: {
    icon: "/icon.png",
  },
};

export default function BudgetLayout({
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
