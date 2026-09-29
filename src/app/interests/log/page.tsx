import type { Metadata } from "next";
import SiteFrame from "@/site/components/SiteFrame";
import LogClient from "@/games/components/LogClient";

export const metadata: Metadata = {
  title: "Log games | Ty Friedman",
  robots: { index: false, follow: false },
};

export default function LogPage() {
  return (
    <SiteFrame>
      <h1 className="text-2xl font-medium tracking-tight text-neutral-900">
        Log game results
      </h1>
      <p className="mt-3 mb-10 text-sm text-neutral-600 leading-relaxed">
        Paste the text from LinkedIn&rsquo;s share button. Several games at once
        is fine; anything that does not look like a result is ignored.
      </p>
      <LogClient />
    </SiteFrame>
  );
}
