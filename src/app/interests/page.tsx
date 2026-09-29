import type { Metadata } from "next";
import SiteFrame from "@/site/components/SiteFrame";
import InterestsList from "@/interests/components/InterestsList";
import GamesSection from "@/games/components/GamesSection";

export const metadata: Metadata = {
  title: "Interests | Ty Friedman",
  description: "What Ty is into at the moment.",
};

// Flip to true once there are enough LinkedIn game results worth showing.
// Logging at /interests/log and the /api/games endpoint work regardless.
const SHOW_GAMES = false;

export const dynamic = "force-dynamic";

export default function InterestsPage() {
  return (
    <SiteFrame>
      <header className="mb-4">
        <h1 className="text-3xl font-medium tracking-tight text-neutral-900">
          What I am into right now
        </h1>
        <p className="mt-3 text-neutral-600 leading-relaxed">
          A running list of things that currently have my attention, starting
          with running. I really can&rsquo;t think of a creative way to show
          you what I&rsquo;m into at the moment on this website so this is the
          best you get.
        </p>
      </header>

      <InterestsList />

      {SHOW_GAMES && (
        <div className="mt-16 border-t border-neutral-200">
          <GamesSection />
        </div>
      )}
    </SiteFrame>
  );
}
