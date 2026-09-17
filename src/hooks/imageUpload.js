import { supabase, IMAGE_BUCKET } from "../supabaseClient.js";

/**
 * Uploads a File to the public image bucket under the given folder and
 * returns the storage path (not the full URL) to save in the database.
 */
export async function uploadImage(file, folder) {
  if (!file) return null;
  const ext = file.name.split(".").pop();
  const safeExt = ext ? ext.toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${safeExt}`;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) throw error;
  return path;
}

/**
 * Deletes an image from storage by its stored path. Safe to call with null.
 */
export async function deleteImage(path) {
  if (!path) return;
  await supabase.storage.from(IMAGE_BUCKET).remove([path]);
}
