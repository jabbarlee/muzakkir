"use server";

import { supabase } from "@/lib/supabase";
import { DictionaryEntry, DictionaryResult } from "@/lib/types/dictionary";

/**
 * Common Turkish suffixes to strip for root finding
 * Ordered from longest to shortest for greedy matching
 */
const TURKISH_SUFFIXES = [
  // Possessive + case combinations (longest first)
  "ümüzle",
  "imizle",
  "ınızla",
  "unuzla",
  "ümüzü",
  "imizi",
  "ınızı",
  "unuzu",
  "ümüze",
  "imize",
  "ınıza",
  "unuza",
  "ümüzden",
  "imizden",
  "ınızdan",
  "unuzdan",
  // Possessive suffixes
  "ümüz",
  "imiz",
  "ınız",
  "unuz",
  "ünüz",
  "iniz",
  // Plural + case
  "lerden",
  "lardan",
  "lerde",
  "larda",
  "lere",
  "lara",
  "leri",
  "ları",
  // Case suffixes
  "den",
  "dan",
  "de",
  "da",
  "le",
  "la",
  "in",
  "ın",
  "un",
  "ün",
  // Plural suffixes
  "ler",
  "lar",
  // Simple vowel suffixes
  "e",
  "a",
  "i",
  "ı",
  "u",
  "ü",
];

/**
 * Normalize a word for dictionary lookup
 * - Convert to lowercase
 * - Remove punctuation
 * - Trim whitespace
 */
function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[.,;!?'"()[\]{}:]/g, "")
    .trim();
}

/**
 * Generate possible root forms by stripping Turkish suffixes
 * Returns an array of candidates ordered by likelihood
 */
function stripTurkishSuffixes(word: string): string[] {
  const candidates: string[] = [];
  const lowerWord = word.toLowerCase();

  for (const suffix of TURKISH_SUFFIXES) {
    if (lowerWord.endsWith(suffix) && lowerWord.length > suffix.length + 1) {
      const stripped = lowerWord.slice(0, -suffix.length);
      // Only add if the stripped word is at least 2 characters
      if (stripped.length >= 2 && !candidates.includes(stripped)) {
        candidates.push(stripped);
      }
    }
  }

  return candidates;
}

/**
 * Query the dictionary table for a word (uses idx_dictionary_word index)
 */
async function queryDictionary(word: string): Promise<DictionaryEntry | null> {
  const { data, error } = await supabase
    .from("dictionary")
    .select("word, definition, root_word")
    .eq("word", word)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned - word not found
      return null;
    }
    console.error("Error querying dictionary:", error);
    return null;
  }

  return data;
}

/**
 * Look up a word in the dictionary (database only, no AI)
 *
 * Step 1: Try exact match after normalization (uses idx_dictionary_word index)
 * Step 2: Try suffix stripping candidates
 */
export async function lookupWord(rawInput: string): Promise<DictionaryResult> {
  const normalized = normalizeWord(rawInput);

  if (!normalized || normalized.length < 2) {
    return { found: false };
  }

  // Step 1: Exact match (uses index for instant lookup)
  const exactMatch = await queryDictionary(normalized);
  if (exactMatch) {
    return {
      found: true,
      entry: exactMatch,
      method: "exact",
    };
  }

  // Step 2: Suffix stripping
  const strippedCandidates = stripTurkishSuffixes(normalized);

  for (const candidate of strippedCandidates) {
    const strippedMatch = await queryDictionary(candidate);
    if (strippedMatch) {
      return {
        found: true,
        entry: strippedMatch,
        method: "suffix_stripped",
      };
    }
  }

  return { found: false };
}
