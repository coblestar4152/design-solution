import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // This only warns in the browser console — it will not crash the build.
  // It means .env (or Netlify env vars) are missing.
  console.warn(
    "Supabase env vars are missing. Copy .env.example to .env and fill in your project URL and anon key."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const IMAGE_BUCKET = "site-images";

export function publicImageUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}
