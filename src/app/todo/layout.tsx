import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo Calendar",
  description: "Calendar-style todo list",
  icons: {
    icon: "/icon.png",
  },
};

export default function TodoLayout({
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

