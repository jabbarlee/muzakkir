import OpenAI from "openai";
import { QueryUnderstanding } from "@/lib/types/chat";

// Lazy-initialized OpenAI client to avoid build-time errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Turkish ordinal numbers mapping
 */
const TURKISH_ORDINALS: Record<string, number> = {
  birinci: 1,
  ikinci: 2,
  üçüncü: 3,
  ucuncu: 3,
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
  "on dördüncü": 14,
  "on beşinci": 15,
  "on altıncı": 16,
  "on yedinci": 17,
  "on sekizinci": 18,
  "on dokuzuncu": 19,
  yirminci: 20,
  "yirmi birinci": 21,
  "yirmi ikinci": 22,
  "yirmi üçüncü": 23,
  "yirmi dördüncü": 24,
  "yirmi beşinci": 25,
  "yirmi altıncı": 26,
  "yirmi yedinci": 27,
  "yirmi sekizinci": 28,
  "yirmi dokuzuncu": 29,
  otuzuncu: 30,
  "otuz birinci": 31,
  "otuz ikinci": 32,
  "otuz üçüncü": 33,
};

/**
 * Chapter type keywords in Turkish
 */
const CHAPTER_TYPE_KEYWORDS: Record<string, string[]> = {
  sözler: ["söz", "soz", "word", "words", "sözler"],
  mektubat: ["mektup", "mektub", "letter", "letters", "mektubat"],
  lemalar: ["lem'a", "lema", "lemalar", "flash", "flashes"],
  şualar: ["şua", "sua", "sualar", "ray", "rays"],
  mesnevî: ["mesnevi", "mesnevî"],
};

/**
 * System prompt for query understanding
 */
const QUERY_UNDERSTANDING_PROMPT = `You are a query analyzer for the Risale-i Nur collection. Analyze the user's question and extract structured information.

The Risale-i Nur consists of books like:
- Sözler (Words) - chapters called "Söz" (e.g., Birinci Söz = 1st Word, Dördüncü Söz = 4th Word)
- Mektubat (Letters) - chapters called "Mektup"
- Lem'alar (Flashes) - chapters called "Lem'a"
- Şualar (Rays) - chapters called "Şua"

Turkish ordinal numbers: Birinci (1st), İkinci (2nd), Üçüncü (3rd), Dördüncü (4th), Beşinci (5th), etc.

Analyze the question and return ONLY a valid JSON object with these fields:
{
  "referencesSpecificChapter": boolean,
  "chapterNumber": number | null,
  "chapterType": "söz" | "mektup" | "lem'a" | "şua" | null,
  "relatedToCurrentContext": boolean,
  "searchQuery": "the core semantic query to search for"
}

Rules:
- referencesSpecificChapter: true if the user explicitly mentions a chapter number/name
- chapterNumber: the chapter number if mentioned (e.g., "4th chapter" = 4, "dördüncü söz" = 4)
- chapterType: the type of chapter if identifiable
- relatedToCurrentContext: true if the question uses phrases like "this chapter", "this passage", "what I'm reading", "bu bölüm", "burada"
- searchQuery: extract the core topic/question for semantic search (remove chapter references)

Examples:
Q: "Dördüncü söz ne anlatıyor?" → {"referencesSpecificChapter":true,"chapterNumber":4,"chapterType":"söz","relatedToCurrentContext":false,"searchQuery":"ana tema ve içerik"}
Q: "What is the 4th Word about?" → {"referencesSpecificChapter":true,"chapterNumber":4,"chapterType":"söz","relatedToCurrentContext":false,"searchQuery":"main theme and content"}
Q: "Bu bölümde namazdan bahsediyor mu?" → {"referencesSpecificChapter":false,"chapterNumber":null,"chapterType":null,"relatedToCurrentContext":true,"searchQuery":"namaz prayer"}
Q: "İman nedir?" → {"referencesSpecificChapter":false,"chapterNumber":null,"chapterType":null,"relatedToCurrentContext":false,"searchQuery":"iman faith belief definition"}`;

/**
 * Analyzes a user question to understand intent and extract chapter references
 */
export async function analyzeQuery(
  question: string,
  currentChapter?: string
): Promise<QueryUnderstanding> {
  // First, try quick pattern matching for common cases
  const quickResult = quickPatternMatch(question);
  if (quickResult) {
    return quickResult;
  }

  // Fall back to GPT for complex queries
  try {
    const openai = getOpenAIClient();
    
    const userMessage = currentChapter
      ? `Current chapter being read: "${currentChapter}"\n\nUser question: ${question}`
      : `User question: ${question}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: QUERY_UNDERSTANDING_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return createDefaultResult(question);
    }

    const parsed = JSON.parse(content);
    
    return {
      referencesSpecificChapter: parsed.referencesSpecificChapter ?? false,
      chapterNumber: parsed.chapterNumber ?? null,
      chapterType: parsed.chapterType ?? null,
      relatedToCurrentContext: parsed.relatedToCurrentContext ?? false,
      searchQuery: parsed.searchQuery || question,
    };
  } catch (error) {
    console.error("Error analyzing query:", error);
    return createDefaultResult(question);
  }
}

/**
 * Quick pattern matching for common chapter reference patterns
 * Returns null if no pattern is matched (falls back to GPT)
 */
function quickPatternMatch(question: string): QueryUnderstanding | null {
  const lowerQuestion = question.toLowerCase().trim();
  
  // Pattern: "X. söz" or "Xinci söz" or "X söz"
  // Also handles "X. word", "Xth word", etc.
  
  // Check for Turkish ordinal patterns
  for (const [ordinal, number] of Object.entries(TURKISH_ORDINALS)) {
    const patterns = [
      new RegExp(`${ordinal}\\s+(söz|soz|mektup|lem'a|lema|şua|sua)`, "i"),
      new RegExp(`${ordinal}\\s+bölüm`, "i"),
    ];
    
    for (const pattern of patterns) {
      const match = lowerQuestion.match(pattern);
      if (match) {
        const chapterType = detectChapterType(match[1] || "");
        return {
          referencesSpecificChapter: true,
          chapterNumber: number,
          chapterType,
          relatedToCurrentContext: false,
          searchQuery: question.replace(pattern, "").trim() || "ana tema içerik",
        };
      }
    }
  }
  
  // Pattern: "4th word", "4. söz", "chapter 4"
  const numericPatterns = [
    /(\d+)(?:st|nd|rd|th)?\s*(?:\.?\s*)?(söz|soz|word|mektup|letter|lem'a|lema|şua|sua|chapter|bölüm)/i,
    /(?:söz|soz|word|mektup|letter|lem'a|lema|şua|sua|chapter|bölüm)\s*(?:#|no\.?|number)?\s*(\d+)/i,
  ];
  
  for (const pattern of numericPatterns) {
    const match = lowerQuestion.match(pattern);
    if (match) {
      const number = parseInt(match[1] || match[2], 10);
      const typeWord = match[2] || match[1];
      if (!isNaN(number)) {
        return {
          referencesSpecificChapter: true,
          chapterNumber: number,
          chapterType: detectChapterType(typeWord),
          relatedToCurrentContext: false,
          searchQuery: question.replace(pattern, "").trim() || "main theme content",
        };
      }
    }
  }
  
  // Pattern: "this chapter", "bu bölüm", "what I'm reading"
  const contextPatterns = [
    /\b(this chapter|this section|this passage|what i'?m reading)\b/i,
    /\b(bu bölüm|bu kısım|bu pasaj|okuduğum|burada)\b/i,
  ];
  
  for (const pattern of contextPatterns) {
    if (pattern.test(lowerQuestion)) {
      return {
        referencesSpecificChapter: false,
        chapterNumber: null,
        chapterType: null,
        relatedToCurrentContext: true,
        searchQuery: question.replace(pattern, "").trim() || question,
      };
    }
  }
  
  return null;
}

/**
 * Detect chapter type from a keyword
 */
function detectChapterType(word: string): "söz" | "mektup" | "lem'a" | "şua" | null {
  const lower = word.toLowerCase();
  
  if (CHAPTER_TYPE_KEYWORDS.sözler.some(k => lower.includes(k))) return "söz";
  if (CHAPTER_TYPE_KEYWORDS.mektubat.some(k => lower.includes(k))) return "mektup";
  if (CHAPTER_TYPE_KEYWORDS.lemalar.some(k => lower.includes(k))) return "lem'a";
  if (CHAPTER_TYPE_KEYWORDS.şualar.some(k => lower.includes(k))) return "şua";
  
  // Default to "söz" for generic "chapter" or "bölüm" references
  if (lower.includes("chapter") || lower.includes("bölüm")) {
    return "söz";
  }
  
  return null;
}

/**
 * Create a default result when analysis fails
 */
function createDefaultResult(question: string): QueryUnderstanding {
  return {
    referencesSpecificChapter: false,
    chapterNumber: null,
    chapterType: null,
    relatedToCurrentContext: false,
    searchQuery: question,
  };
}

