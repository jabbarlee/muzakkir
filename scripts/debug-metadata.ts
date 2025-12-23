/**
 * Debug script to check metadata structure
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env" });
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugMetadata() {
  console.log("🔍 Checking metadata structure for recent documents...\n");

  // Get the last 20 documents
  const { data: recent, error } = await supabase
    .from("documents")
    .select("id, metadata, content")
    .order("id", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Last 20 documents:\n");
  recent?.forEach((doc) => {
    console.log(`ID ${doc.id}:`);
    console.log(`  metadata type: ${typeof doc.metadata}`);
    console.log(`  metadata: ${JSON.stringify(doc.metadata, null, 2)}`);
    console.log(`  content preview: ${doc.content?.substring(0, 50)}...`);
    console.log();
  });

  // Also check with a direct query for "36"
  console.log("\n\n🔎 Searching for documents with '36' in chapter...");
  const { data: search36 } = await supabase
    .from("documents")
    .select("id, metadata")
    .ilike("metadata->>chapter", "%36%")
    .limit(5);

  console.log("Found:", search36?.length || 0);
  search36?.forEach((doc) => {
    console.log(`  ID ${doc.id}: ${JSON.stringify(doc.metadata)}`);
  });

  // Search for Fihrist
  console.log("\n\n🔎 Searching for documents with 'Fihrist' in chapter...");
  const { data: searchFihrist } = await supabase
    .from("documents")
    .select("id, metadata")
    .ilike("metadata->>chapter", "%Fihrist%")
    .limit(5);

  console.log("Found:", searchFihrist?.length || 0);
  searchFihrist?.forEach((doc) => {
    console.log(`  ID ${doc.id}: ${JSON.stringify(doc.metadata)}`);
  });
}

debugMetadata().catch(console.error);

