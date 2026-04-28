-- INSTRUCTIONS: Run this entire script in your Supabase SQL Editor
-- This will secure your database against unauthorized access and potential data leaks.

-- 1. Enable Row Level Security (RLS) on all tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for 'invoices' table
-- This ensures users can ONLY see and manage their own invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view their own invoices" 
ON invoices FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own invoices" ON invoices;
CREATE POLICY "Users can insert their own invoices" 
ON invoices FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
CREATE POLICY "Users can update their own invoices" 
ON invoices FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;
CREATE POLICY "Users can delete their own invoices" 
ON invoices FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 3. Create Policies for 'clients' table
DROP POLICY IF EXISTS "Users can manage their own clients" ON clients;
CREATE POLICY "Users can manage their own clients" 
ON clients FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- 4. Create Policies for 'businesses' table
DROP POLICY IF EXISTS "Users can manage their own business profile" ON businesses;
CREATE POLICY "Users can manage their own business profile" 
ON businesses FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- 5. Force all requests through the authenticated role
-- This prevents anonymous access to your data
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
