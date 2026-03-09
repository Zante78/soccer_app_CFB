import { createSupabaseServerClient } from "./server";

/**
 * Erstellt eine Signed URL für ein File in Supabase Storage
 * @param bucket - Storage Bucket Name (z.B. "rpa-screenshots")
 * @param path - Dateipfad innerhalb des Buckets
 * @param expiresIn - Gültigkeit in Sekunden (default: 1 Stunde)
 * @returns Signed URL oder null bei Fehler
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error(`Error creating signed URL for ${bucket}/${path}:`, error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Listet alle Files in einem Storage Bucket Ordner
 */
export async function listStorageFiles(bucket: string, folder?: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    console.error(`Error listing files in ${bucket}/${folder}:`, error);
    return [];
  }

  return data;
}
