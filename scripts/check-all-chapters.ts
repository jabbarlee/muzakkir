/**
 * Debug script to check ALL chapters in Supabase database
 * Run with: npx tsx scripts/check-all-chapters.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env" });
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAllChapters() {
  console.log("🔍 Fetching ALL documents from Supabase...\n");

  // Get total count
  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true });

  console.log(`📊 Total documents in database: ${count}\n`);

  // Get all unique chapter values (including nulls) - with increased limit
  const { data, error } = await supabase
    .from("documents")
    .select("id, metadata")
    .limit(5000);

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  // Extract all unique metadata->chapter values
  const chapterMap = new Map<string, number>();
  let nullCount = 0;

  for (const row of data || []) {
    const chapter = row.metadata?.chapter;
    if (chapter) {
      chapterMap.set(chapter, (chapterMap.get(chapter) || 0) + 1);
    } else {
      nullCount++;
    }
  }

  console.log(`📚 Found ${chapterMap.size} unique chapters:\n`);

  // Sort by the string value to see the actual order
  const sortedChapters = [...chapterMap.entries()].sort((a, b) => 
    a[0].localeCompare(b[0], "tr")
  );

  sortedChapters.forEach(([chapter, count], index) => {
    console.log(`  ${String(index + 1).padStart(2)}. "${chapter}" (${count} docs)`);
  });

  if (nullCount > 0) {
    console.log(`\n  ⚠️  ${nullCount} documents have no chapter metadata`);
  }

  // Check for chapters containing "33", "Otuz Üçüncü", "Lemaat", "Konferans", "Fihrist"
  console.log("\n\n🔎 Searching for specific patterns:");
  
  const searchPatterns = ["33", "otuz üçüncü", "lemaat", "konferans", "fihrist"];
  
  for (const pattern of searchPatterns) {
    const matches = sortedChapters.filter(([ch]) => 
      ch.toLowerCase().includes(pattern.toLowerCase())
    );
    if (matches.length > 0) {
      console.log(`  ✅ "${pattern}": Found ${matches.length} match(es)`);
      matches.forEach(([ch, count]) => console.log(`      → "${ch}" (${count} docs)`));
    } else {
      console.log(`  ❌ "${pattern}": No matches found`);
    }
  }

  // Show last 10 entries by ID to see the most recently added
  console.log("\n\n📝 Last 10 documents added (by ID):");
  const { data: recent } = await supabase
    .from("documents")
    .select("id, metadata")
    .order("id", { ascending: false })
    .limit(10);

  recent?.forEach((doc) => {
    console.log(`  ID ${doc.id}: chapter = "${doc.metadata?.chapter || "(none)"}"`);
  });
}

checkAllChapters().catch(console.error);

