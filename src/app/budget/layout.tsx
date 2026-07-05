import type { Metadata } from "next";
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
  return <div>{children}</div>;
}
