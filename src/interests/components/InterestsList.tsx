import { INTERESTS } from "@/interests/data/interests";

export default function InterestsList() {
  return (
    <section className="pt-10">
      <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-8">
        At the moment
      </h2>

      <ol className="space-y-4">
        {INTERESTS.map((item, i) => (
          <li key={item} className="flex gap-5 items-baseline">
            <span className="text-sm text-neutral-300 tabular-nums w-5 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-lg text-neutral-900">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
