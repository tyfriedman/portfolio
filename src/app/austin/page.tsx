import { ApartmentsPageClient } from "@/austin/components/ApartmentsPageClient";
import { listApartments } from "@/austin/lib/db/apartments";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const apartments = await listApartments();

  return <ApartmentsPageClient apartments={apartments} />;
}
