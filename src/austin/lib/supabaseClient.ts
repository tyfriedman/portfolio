import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // This will surface clearly in both server and client logs during development.
  console.warn(
    "Supabase environment variables are not set. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


