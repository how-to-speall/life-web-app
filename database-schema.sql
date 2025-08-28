-- Life Web App Database Schema
-- Run this in your Supabase SQL Editor

-- Create the tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (recommended for production)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for demo purposes)
-- In production, you might want to restrict this based on user authentication
CREATE POLICY "Allow all operations" ON tasks FOR ALL USING (true);

-- Create an index on created_at for better performance when ordering
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Create an index on completed for filtering completed tasks
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Optional: Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO tasks (title, description, deadline, completed) VALUES
('Complete project proposal', 'Write up the initial project proposal document', NOW() + INTERVAL '3 days', false),
('Buy groceries', 'Milk, bread, eggs, and vegetables', NOW() + INTERVAL '1 day', false),
('Call dentist', 'Schedule annual checkup', NOW() + INTERVAL '1 week', false),
('Read new book', 'Start reading the new programming book', NOW() + INTERVAL '2 weeks', false);
