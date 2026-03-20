import { createSupabaseServerClient } from "./server";

const ALLOWED_BUCKETS = [
  "player-photos",
  "player-documents",
  "rpa-screenshots",
  "rpa-baselines",
] as const;

type AllowedBucket = (typeof ALLOWED_BUCKETS)[number];

/**
 * Prüft ob ein Pfad Traversal-Versuche enthält (inkl. URL-encoded Varianten, Null-Bytes, Control-Chars)
 */
function isPathTraversal(input: string): boolean {
  const decoded = decodeURIComponent(input)
    .replace(/\\/g, '/')
    .replace(/\0/g, '');
  return (
    decoded.includes('..') ||
    decoded.startsWith('/') ||
    /[\x00-\x1f<>"|?*]/.test(decoded)
  );
}

/**
 * Erstellt eine Signed URL für ein File in Supabase Storage
 * @param bucket - Storage Bucket Name (muss in ALLOWED_BUCKETS sein)
 * @param path - Dateipfad innerhalb des Buckets
 * @param expiresIn - Gültigkeit in Sekunden (default: 1 Stunde)
 * @returns Signed URL oder null bei Fehler
 */
export async function getSignedUrl(
  bucket: AllowedBucket,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  if (!ALLOWED_BUCKETS.includes(bucket)) {
    console.error(`Invalid storage bucket: ${bucket}`);
    return null;
  }

  if (isPathTraversal(path)) {
    console.error(`Invalid storage path (traversal attempt): ${path}`);
    return null;
  }

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
export async function listStorageFiles(bucket: AllowedBucket, folder?: string) {
  if (!ALLOWED_BUCKETS.includes(bucket)) {
    console.error(`Invalid storage bucket: ${bucket}`);
    return [];
  }

  if (folder && isPathTraversal(folder)) {
    console.error(`Invalid storage folder (traversal attempt): ${folder}`);
    return [];
  }

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
