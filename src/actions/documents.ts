"use server";

import { supabase } from "@/lib/supabase";

export interface DocumentChunk {
  id: number;
  content: string;
  metadata: {
    chapter?: string;
    [key: string]: unknown;
  };
}

/**
 * Turkish ordinal number mapping for sorting
 */
const turkishOrdinals: Record<string, number> = {
  birinci: 1,
  ikinci: 2,
  üçüncü: 3,
  ucuncu: 3, // alternative spelling
  dördüncü: 4,
  dorduncu: 4,
  beşinci: 5,
  besinci: 5,
  altıncı: 6,
  altinci: 6,
  yedinci: 7,
  sekizinci: 8,
  dokuzuncu: 9,
  onuncu: 10,
  "on birinci": 11,
  "on ikinci": 12,
  "on üçüncü": 13,
  "on ucuncu": 13,
  "on dördüncü": 14,
  "on dorduncu": 14,
  "on beşinci": 15,
  "on besinci": 15,
  "on altıncı": 16,
  "on altinci": 16,
  "on yedinci": 17,
  "on sekizinci": 18,
  "on dokuzuncu": 19,
  yirminci: 20,
  "yirmi birinci": 21,
  "yirmi ikinci": 22,
  "yirmi üçüncü": 23,
  "yirmi ucuncu": 23,
  "yirmi dördüncü": 24,
  "yirmi dorduncu": 24,
  "yirmi beşinci": 25,
  "yirmi besinci": 25,
  "yirmi altıncı": 26,
  "yirmi altinci": 26,
  "yirmi yedinci": 27,
  "yirmi sekizinci": 28,
  "yirmi dokuzuncu": 29,
  otuzuncu: 30,
  "otuz birinci": 31,
  "otuz ikinci": 32,
  "otuz üçüncü": 33,
  "otuz ucuncu": 33,
};

/**
 * Special chapters that come after the numbered Words
 */
const specialChapters: Record<string, number> = {
  "lemaat": 34,
  "konferans": 35,
  "fihrist": 36,
};

/**
 * English ordinal number mapping for sorting
 */
const englishOrdinals: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
  eleventh: 11,
  twelfth: 12,
  thirteenth: 13,
  fourteenth: 14,
  fifteenth: 15,
  sixteenth: 16,
  seventeenth: 17,
  eighteenth: 18,
  nineteenth: 19,
  twentieth: 20,
  "twenty-first": 21,
  "twenty-second": 22,
  "twenty-third": 23,
  "twenty-fourth": 24,
  "twenty-fifth": 25,
  "twenty-sixth": 26,
  "twenty-seventh": 27,
  "twenty-eighth": 28,
  "twenty-ninth": 29,
  thirtieth: 30,
  "thirty-first": 31,
  "thirty-second": 32,
  "thirty-third": 33,
};

/**
 * Extract the ordinal number from a chapter name
 */
function getChapterOrder(chapter: string): number {
  const lowerChapter = chapter.toLowerCase().trim();

  // Check for numeric prefix (e.g., "01 Birinci Söz", "02 İkinci Söz")
  // This handles formats like "00 SÖZLER", "01 Birinci Söz", etc.
  const numericMatch = lowerChapter.match(/^(\d+)/);
  if (numericMatch) {
    return parseInt(numericMatch[1], 10);
  }

  // Check special chapters (Lemaat, Konferans, Fihrist) - these come after numbered chapters
  for (const [name, num] of Object.entries(specialChapters)) {
    if (lowerChapter.includes(name)) {
      return num;
    }
  }

  // Check Turkish ordinals (check longer phrases first to avoid partial matches)
  const sortedTurkishOrdinals = Object.entries(turkishOrdinals).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [ordinal, num] of sortedTurkishOrdinals) {
    if (lowerChapter.includes(ordinal)) {
      return num;
    }
  }

  // Check English ordinals
  const sortedEnglishOrdinals = Object.entries(englishOrdinals).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [ordinal, num] of sortedEnglishOrdinals) {
    if (lowerChapter.includes(ordinal)) {
      return num;
    }
  }

  // If no ordinal found, return a high number to sort at the end
  return 999;
}

/**
 * Sort chapters by their ordinal number
 */
function sortChapters(chapters: string[]): string[] {
  return chapters.sort((a, b) => {
    const orderA = getChapterOrder(a);
    const orderB = getChapterOrder(b);
    return orderA - orderB;
  });
}

/**
 * Fetch all distinct chapter names from the documents table
 * Uses pagination to handle Supabase's 1000 row limit
 */
export async function getChapters(): Promise<string[]> {
  const allChapters: string[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  // Paginate through all documents to get all chapters
  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("documents")
      .select("metadata->chapter")
      .not("metadata->chapter", "is", null)
      .range(from, to);

    if (error) {
      console.error("Error fetching chapters:", error);
      throw new Error("Failed to fetch chapters");
    }

    if (data && data.length > 0) {
      const chapters = data
        .map((row) => row.chapter as string)
        .filter((chapter): chapter is string => !!chapter);
      allChapters.push(...chapters);
    }

    // Check if we got less than pageSize, meaning we've reached the end
    hasMore = data?.length === pageSize;
    page++;
  }

  // Get unique chapters
  const uniqueChapters = [...new Set(allChapters)];

  // Sort chapters by ordinal number
  return sortChapters(uniqueChapters);
}

/**
 * Fetch all document chunks for a specific chapter, sorted by id
 */
export async function getChapterContent(chapter: string): Promise<string> {
  const { data, error } = await supabase
    .from("documents")
    .select("id, content, metadata")
    .eq("metadata->>chapter", chapter)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching chapter content:", error);
    throw new Error("Failed to fetch chapter content");
  }

  if (!data || data.length === 0) {
    return "";
  }

  // Join all content chunks into a single markdown string
  const content = data.map((chunk) => chunk.content).join("\n\n");

  return content;
}
