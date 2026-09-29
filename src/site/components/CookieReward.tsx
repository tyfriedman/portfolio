"use client";

import { useEffect, useState } from "react";
import CookieIcon from "./CookieIcon";

type Choice = "necessary" | "dessert" | null;

export default function CookieReward({ prompt }: { prompt?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<Choice>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const extraCookies = choice === "dessert" ? 6 : 0;

  const cookieButton = (size: number, key: number, rotate?: number) => (
    <button
      key={key}
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Take the cookie"
      title="Take the cookie"
      className="rounded-full p-1 transition-transform hover:-translate-y-1 hover:rotate-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
      style={rotate === undefined ? undefined : { transform: `rotate(${rotate}deg)` }}
    >
      <CookieIcon size={size} />
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        {prompt}
        {cookieButton(96, 0)}
      </div>

      {extraCookies > 0 && (
        <div className="mt-6 flex flex-wrap items-end gap-2">
          {Array.from({ length: extraCookies }).map((_, i) =>
            cookieButton(56, i + 1, (((i + 1) * 37) % 30) - 15)
          )}
        </div>
      )}

      {choice === "necessary" && (
        <p className="mt-4 text-sm text-neutral-500">
          A sensible choice. One cookie, no tracking, no regrets.
        </p>
      )}
      {choice === "dessert" && (
        <p className="mt-4 text-sm text-neutral-500">
          Consent recorded. Dessert has been served. These ones are also
          clickable, in case you want to read the policy again.
        </p>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-dialog-title"
        >
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-neutral-200">
            <div className="flex items-start gap-4">
              <CookieIcon size={40} className="shrink-0 mt-0.5" />
              <div>
                <h3
                  id="cookie-dialog-title"
                  className="text-base font-medium text-neutral-900"
                >
                  This website uses cookies
                </h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                  Well, one cookie. It is the one you just clicked on. Before
                  you take it, would you like to allow only the necessary
                  cookies, or also the additional cookies used for dessert?
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setChoice("necessary");
                  setOpen(false);
                }}
                className="rounded-md px-3 py-2 text-sm text-neutral-700 border border-neutral-300 hover:bg-neutral-100 transition-colors"
              >
                Only necessary
              </button>
              <button
                type="button"
                onClick={() => {
                  setChoice("dessert");
                  setOpen(false);
                }}
                className="rounded-md px-3 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-700 transition-colors"
              >
                Additional cookies for dessert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
