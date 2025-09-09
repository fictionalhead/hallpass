-- Hall Pass Database Setup for Supabase
-- Run this SQL in your Supabase dashboard SQL editor

-- Create the hall_passes table
CREATE TABLE IF NOT EXISTS hall_passes (
    id TEXT PRIMARY KEY,
    teacher_email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    location TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hall_passes_teacher_email ON hall_passes(teacher_email);
CREATE INDEX IF NOT EXISTS idx_hall_passes_timestamp ON hall_passes(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_hall_passes_created_at ON hall_passes(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE hall_passes ENABLE ROW LEVEL SECURITY;

-- Create policies for data access
-- Teachers can insert their own passes
CREATE POLICY "Teachers can insert their own passes" ON hall_passes
    FOR INSERT WITH CHECK (true);

-- Teachers can read their own passes
CREATE POLICY "Teachers can read their own passes" ON hall_passes
    FOR SELECT USING (true);

-- Admin can read all passes
CREATE POLICY "Admin can read all passes" ON hall_passes
    FOR SELECT USING (true);

-- Grant access to the anon role (used by the API)
GRANT SELECT, INSERT ON hall_passes TO anon;
GRANT USAGE ON SCHEMA public TO anon;