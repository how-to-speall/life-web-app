-- Life Web App Database Schema
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (optional - only if you want to start fresh)
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

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

-- Create the people table
CREATE TABLE people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  "howIKnowThem" TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  birthday DATE,
  "giftIdeas" TEXT,
  "lastHangoutDate" DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (recommended for production)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (for demo purposes)
-- In production, you might want to restrict this based on user authentication
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on people" ON people FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_people_name ON people(name);
CREATE INDEX idx_people_tags ON people USING GIN(tags);
CREATE INDEX idx_people_birthday ON people(birthday);
CREATE INDEX idx_people_last_hangout ON people("lastHangoutDate");

-- Optional: Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_people_updated_at 
    BEFORE UPDATE ON people 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO tasks (title, description, deadline, completed) VALUES
('Complete project proposal', 'Write up the initial project proposal document', NOW() + INTERVAL '3 days', false),
('Buy groceries', 'Milk, bread, eggs, and vegetables', NOW() + INTERVAL '1 day', false),
('Call dentist', 'Schedule annual checkup', NOW() + INTERVAL '1 week', false),
('Read new book', 'Start reading the new programming book', NOW() + INTERVAL '2 weeks', false);

-- Insert sample people data
INSERT INTO people (name, "howIKnowThem", tags, description, birthday, "giftIdeas", "lastHangoutDate") VALUES
('Sarah Johnson', 'Met in freshman biology class', ARRAY['college', 'biology'], 'Really smart and loves coffee', '1995-03-15', 'Coffee gift cards, science books, plants', '2024-01-15'),
('Mike Chen', 'Work colleague from previous job', ARRAY['work', 'tech'], 'Great developer, loves board games', '1988-07-22', 'Board games, tech gadgets, craft beer', '2024-02-01'),
('Emma Davis', 'Neighbor from apartment building', ARRAY['neighbor', 'yoga'], 'Yoga instructor, very friendly', '1992-11-08', 'Yoga mats, wellness books, tea', '2024-01-28');
