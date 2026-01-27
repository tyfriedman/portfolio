import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ER Diagram Creator",
  description: "Create and edit Entity Relationship Diagrams",
};

export default function ErdLayout({
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
