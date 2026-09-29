import Link from "next/link";
import Image from "next/image";
import SiteFrame from "@/site/components/SiteFrame";
import ContactLinks from "@/site/components/ContactLinks";

export default function Home() {
  return (
    <SiteFrame showHomeLink={false}>
      <header className="mb-10 flex items-center gap-6">
        <Image
          src="/photos/headshot.jpg"
          alt="Ty Friedman"
          width={680}
          height={800}
          priority
          className="h-32 w-[6.8rem] shrink-0 rounded-[24px] object-cover border border-neutral-200"
        />
        <h1 className="text-3xl font-medium tracking-tight text-neutral-900">
          Ty Friedman
        </h1>
      </header>

      <section className="space-y-4 text-neutral-600 leading-relaxed">
        <p>
          Hey! Welcome to my website. I honestly mostly just use the domain to
          host my ever-evolving personal projects, so if you are interested in
          seeing those, feel free to try and type something random into the url
          and see if you can land on something I use. Maybe you&rsquo;ll get
          lucky!
        </p>
        <p>
          If instead you would like to learn what I&rsquo;m up to recently or
          learn about my academic and professional experiences, feel free to
          check out the links below
        </p>
      </section>

      <nav className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
        <Link
          href="/interests"
          className="group text-neutral-900 border-b border-neutral-300 hover:border-neutral-900 transition-colors pb-0.5"
        >
          What I am into right now
          <span className="text-neutral-400 group-hover:text-neutral-900 transition-colors ml-1">
            &rarr;
          </span>
        </Link>
        <Link
          href="/resume"
          className="group text-neutral-900 border-b border-neutral-300 hover:border-neutral-900 transition-colors pb-0.5"
        >
          The serious version of me
          <span className="text-neutral-400 group-hover:text-neutral-900 transition-colors ml-1">
            &rarr;
          </span>
        </Link>
      </nav>

      <section className="mt-20 pt-10 border-t border-neutral-200">
        <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-6">
          Get in touch
        </h2>
        <ContactLinks />
      </section>
    </SiteFrame>
  );
}
