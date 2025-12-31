import { supabase } from "@/austin/lib/supabaseClient";

export type ApartmentStatus =
  | "prospect"
  | "toured"
  | "applied"
  | "approved"
  | "rejected";

export interface Apartment {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  monthly_rent: number | null;
  notes: string | null;
  distance_km_to_office: number | null;
  drive_miles_to_office: number | null;
  drive_minutes_to_office: number | null;
  is_favorite: boolean;
  status: ApartmentStatus;
}

export interface ApartmentPhoto {
  id: string;
  apartment_id: string;
  public_url: string;
  caption: string | null;
  sort_order: number;
}

export interface ApartmentWithPhotos extends Apartment {
  photos: ApartmentPhoto[];
}

export async function listApartments(): Promise<ApartmentWithPhotos[]> {
  const { data, error } = await supabase
    .from("apartments")
    .select(
      `
      id,
      title,
      address,
      lat,
      lng,
      monthly_rent,
      notes,
      distance_km_to_office,
      drive_miles_to_office,
      drive_minutes_to_office,
      is_favorite,
      status,
      apartment_photos (
        id,
        apartment_id,
        public_url,
        caption,
        sort_order
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading apartments", error);
    return [];
  }

  return (
    data?.map((row: any) => ({
      id: row.id,
      title: row.title,
      address: row.address,
      lat: row.lat,
      lng: row.lng,
      monthly_rent: row.monthly_rent,
      notes: row.notes,
      distance_km_to_office: row.distance_km_to_office,
      drive_miles_to_office: row.drive_miles_to_office,
      drive_minutes_to_office: row.drive_minutes_to_office,
      is_favorite: row.is_favorite,
      status: row.status,
      photos:
        row.apartment_photos?.map((p: any) => ({
          id: p.id,
          apartment_id: p.apartment_id,
          public_url: p.public_url,
          caption: p.caption,
          sort_order: p.sort_order,
        })) ?? [],
    })) ?? []
  );
}

export interface CreateApartmentInput {
  title: string;
  address: string;
  lat: number;
  lng: number;
  monthly_rent?: number | null;
  notes?: string | null;
  status?: ApartmentStatus;
  distance_km_to_office?: number | null;
   drive_miles_to_office?: number | null;
   drive_minutes_to_office?: number | null;
  photos?: { public_url: string; caption?: string | null }[];
}

export async function createApartmentWithPhotos(input: CreateApartmentInput) {
  const {
    title,
    address,
    lat,
    lng,
    monthly_rent = null,
    notes = null,
    status = "prospect",
    distance_km_to_office = null,
    drive_miles_to_office = null,
    drive_minutes_to_office = null,
    photos = [],
  } = input;

  const { data, error } = await supabase
    .from("apartments")
    .insert([
      {
        title,
        address,
        lat,
        lng,
        monthly_rent,
        notes,
        status,
        distance_km_to_office,
        drive_miles_to_office,
        drive_minutes_to_office,
      },
    ])
    .select("id")
    .single();

  if (error || !data) {
    throw error || new Error("Failed to insert apartment");
  }

  const apartmentId = data.id as string;

  if (photos.length > 0) {
    const photoRows = photos.map((p, index) => ({
      apartment_id: apartmentId,
      public_url: p.public_url,
      caption: p.caption ?? null,
      sort_order: index,
    }));

    const { error: photosError } = await supabase
      .from("apartment_photos")
      .insert(photoRows);

    if (photosError) {
      console.error("Failed to insert apartment photos", photosError);
    }
  }

  return apartmentId;
}

export interface UpdateApartmentInput {
  monthly_rent?: number | null;
  notes?: string | null;
  status?: ApartmentStatus;
  drive_miles_to_office?: number | null;
  drive_minutes_to_office?: number | null;
}

export async function updateApartment(
  id: string,
  input: UpdateApartmentInput
): Promise<void> {
  const { error } = await supabase
    .from("apartments")
    .update(input)
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteApartment(id: string): Promise<void> {
  // Delete photos first (due to foreign key constraint)
  const { error: photosError } = await supabase
    .from("apartment_photos")
    .delete()
    .eq("apartment_id", id);

  if (photosError) {
    console.error("Error deleting apartment photos", photosError);
  }

  // Delete the apartment
  const { error } = await supabase
    .from("apartments")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}



