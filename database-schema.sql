-- ==========================================
-- PROOF9 DATABASE SCHEMA FOR SUPABASE
-- ==========================================

-- Enable Row Level Security (RLS)
-- This ensures users can only access their own data

-- ==========================================
-- PROFILES TABLE
-- ==========================================
CREATE TABLE profiles (
  address TEXT PRIMARY KEY,
  display_name TEXT,
  bio TEXT CHECK (char_length(bio) <= 160),
  avatar_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = address);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = address);

-- ==========================================
-- TRACKS TABLE (optional - you might keep this in backend)
-- ==========================================
CREATE TABLE tracks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ip_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist_address TEXT NOT NULL,
  duration TEXT NOT NULL,
  plays INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  image_url TEXT,
  audio_url TEXT,
  description TEXT,
  genre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Policies for tracks
CREATE POLICY "Tracks are viewable by everyone" ON tracks
  FOR SELECT USING (true);

CREATE POLICY "Artists can update own tracks" ON tracks
  FOR UPDATE USING (auth.uid()::text = artist_address);

CREATE POLICY "Artists can insert own tracks" ON tracks
  FOR INSERT WITH CHECK (auth.uid()::text = artist_address);

-- ==========================================
-- LIKES TABLE
-- ==========================================
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL,
  track_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_address, track_id)
);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Policies for likes
CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON likes
  FOR ALL USING (auth.uid()::text = user_address);

-- ==========================================
-- COMMENTS TABLE
-- ==========================================
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL,
  track_id TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies for comments
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid()::text = user_address);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid()::text = user_address);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid()::text = user_address);

-- ==========================================
-- FOLLOWS TABLE
-- ==========================================
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_address TEXT NOT NULL,
  following_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_address, following_address),
  CHECK (follower_address != following_address)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policies for follows
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON follows
  FOR ALL USING (auth.uid()::text = follower_address);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Likes indexes
CREATE INDEX idx_likes_track_id ON likes(track_id);
CREATE INDEX idx_likes_user_address ON likes(user_address);

-- Comments indexes
CREATE INDEX idx_comments_track_id ON comments(track_id);
CREATE INDEX idx_comments_user_address ON comments(user_address);

-- Follows indexes
CREATE INDEX idx_follows_follower ON follows(follower_address);
CREATE INDEX idx_follows_following ON follows(following_address);

-- Tracks indexes
CREATE INDEX idx_tracks_artist ON tracks(artist_address);
CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);

-- ==========================================
-- SAMPLE DATA (for testing)
-- ==========================================

-- Sample profiles
INSERT INTO profiles (address, display_name, bio, verified) VALUES
('0xE89fEf221bdEd027C4c9F07D256b9Dc1422A2455', 'Samuel.eth', 'Music producer on Story Protocol', true),
('0xA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0', 'Producer.eth', 'Electronic music creator', false)
ON CONFLICT (address) DO NOTHING;
