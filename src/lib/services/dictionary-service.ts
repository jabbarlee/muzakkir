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
 * Query dictionary entries that start with a prefix (for phrase detection)
 * Uses LIKE pattern which can leverage index with 'prefix%'
 */
async function queryDictionaryPrefix(prefix: string): Promise<DictionaryEntry[]> {
  const { data, error } = await supabase
    .from("dictionary")
    .select("word, definition, root_word")
    .like("word", `${prefix}%`)
    .limit(50); // Reasonable limit for phrase matching

  if (error) {
    console.error("Error querying dictionary prefix:", error);
    return [];
  }

  return data || [];
}

/**
 * Query dictionary by root_word column
 */
async function queryByRootWord(rootWord: string): Promise<DictionaryEntry | null> {
  const { data, error } = await supabase
    .from("dictionary")
    .select("word, definition, root_word")
    .eq("root_word", rootWord)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned - root word not found
      return null;
    }
    console.error("Error querying dictionary by root word:", error);
    return null;
  }

  return data;
}

/**
 * Detect if a phrase exists in the dictionary
 * Tries both prefix matching and exact phrase matching
 */
async function detectPhrase(
  clickedWord: string,
  context: string
): Promise<DictionaryEntry | null> {
  const normalizedWord = normalizeWord(clickedWord);
  const contextTrimmed = context.trim();

  if (!normalizedWord || normalizedWord.length < 2 || !contextTrimmed) {
    return null;
  }

  // Construct potential phrases with different separators
  // Handle hyphenated phrases like "âb-ı adâlet"
  // First, normalize the full phrase variations
  const phraseVariations = [
    `${clickedWord}-${contextTrimmed}`, // With hyphen: "âb-ı adâlet"
    `${clickedWord} ${contextTrimmed}`, // With space: "âb ı adâlet"
    `${clickedWord}${contextTrimmed}`, // No separator: "âbı adâlet"
  ];

  // Step 1: Try exact phrase match (normalize each variation before querying)
  for (const phrase of phraseVariations) {
    const normalizedPhrase = normalizeWord(phrase);
    const exactPhrase = await queryDictionary(normalizedPhrase);
    if (exactPhrase) {
      return exactPhrase;
    }
  }

  // Step 2: Try prefix matching
  // Get all dictionary entries starting with the clicked word
  const prefixMatches = await queryDictionaryPrefix(normalizedWord);

  if (prefixMatches.length === 0) {
    return null;
  }

  // Normalize context for comparison (lowercase, remove punctuation)
  const normalizedContext = normalizeWord(contextTrimmed);
  const contextWords = normalizedContext.split(/\s+/).filter((w) => w.length > 0);

  for (const entry of prefixMatches) {
    const entryWord = entry.word.toLowerCase();
    
    // Get the part of the entry after the clicked word
    // Example: clickedWord="âb", entry="âb-ı adâlet" -> entryAfterPrefix="-ı adâlet"
    if (!entryWord.startsWith(normalizedWord)) {
      continue;
    }

    const entryAfterPrefix = entryWord.slice(normalizedWord.length).trim();
    
    // Remove separators for comparison
    const entryNormalized = entryAfterPrefix.replace(/[- ]/g, "");
    const contextNormalized = normalizedContext.replace(/[- ]/g, "");

    // Check multiple matching strategies:
    // 1. Exact match after normalization
    if (entryNormalized === contextNormalized) {
      return entry;
    }

    // 2. Check if entry continuation contains context words
    // Example: entry="âb-ı adâlet", context="ı adâlet" -> match
    const entryWords = entryAfterPrefix.split(/[- ]+/).filter((w) => w.length > 0);
    if (entryWords.length > 0) {
      // Check if all context words appear in entry continuation
      const allWordsMatch = contextWords.every((ctxWord) =>
        entryWords.some((entryWord) => entryWord === ctxWord || entryWord.includes(ctxWord))
      );
      if (allWordsMatch) {
        return entry;
      }
    }

    // 3. Check if normalized strings are similar (fuzzy match for punctuation differences)
    if (
      entryNormalized.includes(contextNormalized) ||
      contextNormalized.includes(entryNormalized)
    ) {
      return entry;
    }
  }

  return null;
}

/**
 * Look up a word in the dictionary (database only, no AI)
 *
 * Enhanced with 4-step priority waterfall:
 * Step 1: Exact match after normalization (uses idx_dictionary_word index)
 * Step 2: Phrase detection (prefix match + exact phrase)
 * Step 3: Suffix stripping candidates
 * Step 4: Root word fallback
 *
 * @param rawInput - The word or term to look up
 * @param context - Optional context window (next 2 words) for phrase detection
 */
export async function lookupWord(
  rawInput: string,
  context?: string
): Promise<DictionaryResult> {
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

  // Step 2: Phrase detection (if context is provided)
  if (context && context.trim().length > 0) {
    const phraseMatch = await detectPhrase(rawInput, context);
    if (phraseMatch) {
      return {
        found: true,
        entry: phraseMatch,
        method: "phrase_match",
      };
    }
  }

  // Step 3: Suffix stripping
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

  // Step 4: Root word fallback
  const rootWordMatch = await queryByRootWord(normalized);
  if (rootWordMatch) {
    return {
      found: true,
      entry: rootWordMatch,
      method: "root_word",
    };
  }

  return { found: false };
}
