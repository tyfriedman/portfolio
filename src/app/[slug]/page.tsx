import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SomethingRandom from "@/site/components/SomethingRandom";

const RANDOM_SLUGS = new Set([
  "somethingrandom",
  "something",
  "random",
  "anything",
  "anythingrandom",
  "somethinganything",
]);

function normalize(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // leave as-is if malformed
  }
  return decoded.toLowerCase().replace(/[^a-z]/g, "");
}

function isSomethingRandom(slug: string): boolean {
  return RANDOM_SLUGS.has(normalize(slug));
}

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (isSomethingRandom(slug)) {
    return { title: "Something random | Ty Friedman" };
  }
  return { title: "404 | Ty Friedman" };
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  if (!isSomethingRandom(slug)) {
    notFound();
  }
  return <SomethingRandom />;
}
