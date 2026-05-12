import { getTags } from "@/lib/supabase/sessions";
import type { Tag } from "@/types/database";

let cached: Promise<Tag[]> | null = null;

export function getCachedTags(): Promise<Tag[]> {
  if (!cached) cached = getTags();
  return cached;
}

export function invalidateTagsCache() {
  cached = null;
}
