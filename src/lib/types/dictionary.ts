/**
 * Dictionary entry from the dictionary table
 */
export interface DictionaryEntry {
  word: string;
  definition: string;
  root_word?: string | null;
}

/**
 * Result of a dictionary lookup operation
 */
export interface DictionaryResult {
  /** Whether a definition was found */
  found: boolean;
  /** The dictionary entry if found */
  entry?: DictionaryEntry;
  /** The method used to find the definition */
  method?: "exact" | "suffix_stripped";
}

