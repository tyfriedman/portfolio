import type { ReactNode } from "react";
import "../globals.css";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AmongUsLayout({ children }: { children: ReactNode }) {
  return children;
}

