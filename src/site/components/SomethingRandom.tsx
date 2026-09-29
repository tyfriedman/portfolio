import Link from "next/link";
import SiteFrame from "./SiteFrame";
import CookieReward from "./CookieReward";

export default function SomethingRandom() {
  return (
    <SiteFrame>
      <CookieReward
        prompt={
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-900 leading-snug">
            Congrats! You found something (random)! Here&rsquo;s a cookie as a
            reward <span aria-hidden="true">&rarr;</span>
          </h1>
        }
      />

      <p className="mt-16 text-sm text-neutral-500">
        <Link
          href="/"
          className="text-neutral-700 border-b border-neutral-300 hover:border-neutral-900 transition-colors"
        >
          Back to the start
        </Link>
      </p>
    </SiteFrame>
  );
}
