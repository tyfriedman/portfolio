import Link from "next/link";

export default function SiteFrame({
  children,
  showHomeLink = true,
}: {
  children: React.ReactNode;
  showHomeLink?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHomeLink && (
        <header className="max-w-2xl w-full mx-auto px-6 py-6 flex justify-between items-center">
          <Link
            href="/"
            className="text-sm text-neutral-900 hover:text-neutral-600 transition-colors"
          >
            Ty Friedman
          </Link>
          <nav className="flex gap-5 text-sm">
            <Link
              href="/interests"
              className="text-neutral-400 hover:text-neutral-800 transition-colors"
            >
              Interests
            </Link>
            <Link
              href="/resume"
              className="text-neutral-400 hover:text-neutral-800 transition-colors"
            >
              Resume
            </Link>
          </nav>
        </header>
      )}
      <main
        className={`max-w-2xl w-full mx-auto px-6 pb-24 flex-1 ${
          showHomeLink ? "pt-16" : "pt-24"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
