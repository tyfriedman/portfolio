import type { Metadata } from "next";
import Link from "next/link";
import SiteFrame from "@/site/components/SiteFrame";

export const metadata: Metadata = {
  title: "404 | Ty Friedman",
};

export default function NotFound() {
  return (
    <SiteFrame>
      <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-4">
        404
      </p>
      <h1 className="text-3xl font-medium tracking-tight text-neutral-900">
        Swing and a miss!
      </h1>
      <p className="mt-4 text-neutral-600 leading-relaxed">
        Which, to be fair, you were warned about. Either this project moved,
        never existed, or you spelled it in a way I did not anticipate.
      </p>
      <p className="mt-3 text-neutral-600 leading-relaxed">
        Feel free to keep guessing. The odds are not great, but they are not
        zero.
      </p>
      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
        <Link
          href="/"
          className="text-neutral-900 border-b border-neutral-300 hover:border-neutral-900 transition-colors pb-0.5"
        >
          Back to the start
        </Link>
        <Link
          href="/interests"
          className="text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Interests
        </Link>
        <Link
          href="/resume"
          className="text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Resume
        </Link>
      </div>
    </SiteFrame>
  );
}
