/**
 * Debug script to check chapters in Supabase database
 * Run with: npx tsx scripts/check-chapters.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env or .env.local
config({ path: ".env" });
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing environment variables!");
  console.error(
    "Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set"
  );
  console.error("\nYou can run this with:");
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL=your-url NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key npx tsx scripts/check-chapters.ts"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkChapters() {
  console.log("🔍 Checking chapters in Supabase database...\n");

  // Get all unique chapters
  const { data, error } = await supabase
    .from("documents")
    .select("metadata->chapter")
    .not("metadata->chapter", "is", null);

  if (error) {
    console.error("❌ Error fetching chapters:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("⚠️ No documents found in the database!");
    return;
  }

  // Extract unique chapter names
  const chapters = data
    .map((row) => row.chapter as string)
    .filter((chapter): chapter is string => !!chapter);

  const uniqueChapters = [...new Set(chapters)];

  console.log(`📚 Found ${uniqueChapters.length} unique chapters:\n`);

  // Sort and display
  uniqueChapters.sort().forEach((chapter, index) => {
    console.log(`  ${index + 1}. "${chapter}"`);
  });

  // Check for specific chapters
  console.log("\n\n🔎 Checking for specific chapters:");

  const expectedChapters = [
    "Otuz Üçüncü Söz",
    "Lemaat (Sözler)",
    "Konferans (Sözler)",
    "Fihrist (Sözler)",
  ];

  for (const expected of expectedChapters) {
    const found = uniqueChapters.some(
      (ch) =>
        ch.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(ch.toLowerCase())
    );
    console.log(`  ${found ? "✅" : "❌"} ${expected}`);
  }

  // Count documents per chapter
  console.log("\n\n📊 Document count per chapter:");

  const chapterCounts: Record<string, number> = {};
  for (const chapter of chapters) {
    chapterCounts[chapter] = (chapterCounts[chapter] || 0) + 1;
  }

  Object.entries(chapterCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([chapter, count]) => {
      console.log(`  ${chapter}: ${count} document(s)`);
    });
}

checkChapters().catch(console.error);
