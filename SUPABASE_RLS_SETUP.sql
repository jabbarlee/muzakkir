-- =====================================================
-- Supabase Row Level Security (RLS) Setup
-- =====================================================
-- Run these SQL commands in your Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)
-- =====================================================

-- This script sets up RLS policies to allow public read access
-- to your tables using the publishable/anon key

-- =====================================================
-- 1. BOOKS TABLE
-- =====================================================

-- Enable RLS on books table
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Allow public read access to books
CREATE POLICY "Allow public read access to books"
ON books
FOR SELECT
TO anon
USING (true);

-- =====================================================
-- 2. CHAPTERS TABLE
-- =====================================================

-- Enable RLS on chapters table
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Allow public read access to chapters
CREATE POLICY "Allow public read access to chapters"
ON chapters
FOR SELECT
TO anon
USING (true);

-- =====================================================
-- 3. PARAGRAPHS TABLE
-- =====================================================

-- Enable RLS on paragraphs table
ALTER TABLE paragraphs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to paragraphs
CREATE POLICY "Allow public read access to paragraphs"
ON paragraphs
FOR SELECT
TO anon
USING (true);

-- =====================================================
-- 4. DICTIONARY TABLE
-- =====================================================

-- Enable RLS on dictionary table (if exists)
ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;

-- Allow public read access to dictionary
CREATE POLICY "Allow public read access to dictionary"
ON dictionary
FOR SELECT
TO anon
USING (true);

-- =====================================================
-- 5. DOCUMENTS TABLE (for vector search)
-- =====================================================

-- Enable RLS on documents table (if exists)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow public read access to documents
CREATE POLICY "Allow public read access to documents"
ON documents
FOR SELECT
TO anon
USING (true);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries to verify your policies are set up:

-- Check which tables have RLS enabled:
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('books', 'chapters', 'paragraphs', 'dictionary', 'documents');

-- Check what policies exist:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- What is RLS (Row Level Security)?
-- - It's a security feature that controls which rows users can access
-- - By default, when RLS is enabled, NO rows are accessible
-- - You need to create policies to allow access
--
-- The 'anon' role:
-- - This is the role used by your publishable/anon key
-- - Public users (not authenticated) use this role
-- - Your policies allow this role to read data
--
-- Why USING (true)?
-- - This means "allow access to all rows"
-- - For public read-only data, this is appropriate
-- - For user-specific data, you'd use more restrictive policies
--
-- Security considerations:
-- - These policies allow READ-ONLY access to everyone
-- - Write operations (INSERT, UPDATE, DELETE) are NOT allowed
-- - If you need write access, create separate policies
-- - For authenticated user data, use auth.uid() in policies
-- =====================================================


