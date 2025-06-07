-- PostgreSQL Functions for Supabase RPC calls
-- These functions ensure atomic operations for counters

-- Increment track plays
CREATE OR REPLACE FUNCTION increment_track_plays(track_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE tracks
  SET plays = plays + 1
  WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

-- Increment track likes count
CREATE OR REPLACE FUNCTION increment_track_likes(track_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE tracks
  SET likes_count = likes_count + 1
  WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement track likes count
CREATE OR REPLACE FUNCTION decrement_track_likes(track_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE tracks
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

-- Increment track comments count
CREATE OR REPLACE FUNCTION increment_track_comments(track_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE tracks
  SET comments_count = comments_count + 1
  WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

-- Increment track licenses sold
CREATE OR REPLACE FUNCTION increment_track_licenses_sold(track_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE tracks
  SET total_licenses_sold = total_licenses_sold + 1
  WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

-- Add revenue to track
CREATE OR REPLACE FUNCTION add_track_revenue(track_id TEXT, amount NUMERIC)
RETURNS void AS $$
BEGIN
  UPDATE tracks
  SET total_revenue_earned = total_revenue_earned + amount
  WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;
