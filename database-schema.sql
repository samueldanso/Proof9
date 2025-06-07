-- ==========================================
-- PROOF9 DATABASE SCHEMA FOR SUPABASE
-- Schema aligned with Backend API Data Flow + Monetization
-- ==========================================

-- ==========================================
-- PROFILES TABLE (MVP Version)
-- ==========================================
CREATE TABLE profiles (
  address TEXT PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- TRACKS TABLE (Aligned with Backend)
-- ==========================================
CREATE TABLE tracks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  -- Story Protocol Data
  ip_id TEXT UNIQUE,                    -- Story Protocol IP ID
  transaction_hash TEXT,                -- Registration transaction
  token_id TEXT,                        -- NFT token ID
  license_terms_ids BIGINT[],           -- Array of license term IDs (BigInt)

  -- Basic Track Info
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  tags TEXT[],                          -- Array of tags
  duration TEXT,                        -- Duration as string (e.g., "3:24")

  -- Creator Info
  artist_address TEXT NOT NULL,        -- Creator wallet address
  artist_name TEXT,                     -- Display name (from profile)

  -- File Data (from Upload)
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  file_hash TEXT,                       -- SHA256 hash of file
  ipfs_hash TEXT,                       -- IPFS content hash
  ipfs_url TEXT,                        -- Full IPFS URL
  metadata_ipfs_hash TEXT,              -- Metadata IPFS hash
  metadata_ipfs_url TEXT,               -- Metadata IPFS URL
  image_url TEXT,                       -- Cover art URL

  -- Yakoa Verification Data
  yakoa_token_id TEXT,                  -- Yakoa token ID
  yakoa_status TEXT,                    -- verified, pending, failed
  yakoa_confidence DECIMAL(5,4),        -- Confidence score (0.0 to 1.0)
  yakoa_infringement_status TEXT,       -- clean, flagged, etc.
  yakoa_external_infringements JSONB,   -- External copyright issues
  yakoa_in_network_infringements JSONB, -- In-network matches
  verified BOOLEAN DEFAULT false,       -- Quick verification flag

  -- License Data
  license_type TEXT,                    -- commercial, non-commercial, etc.
  license_price DECIMAL(18,8),          -- Price in ETH/tokens
  commercial_rev_share INTEGER,         -- Revenue share percentage (0-100)
  minting_fee DECIMAL(18,8),            -- License minting fee

  -- Monetization/Royalty Data
  total_revenue_earned DECIMAL(18,8) DEFAULT 0,    -- Total revenue from this track
  total_licenses_sold INTEGER DEFAULT 0,           -- Number of licenses sold
  derivative_revenue DECIMAL(18,8) DEFAULT 0,      -- Revenue from derivatives
  last_revenue_claim TIMESTAMP WITH TIME ZONE,     -- Last time creator claimed revenue

  -- Social Stats (computed from other tables)
  plays INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- LICENSE_TRANSACTIONS TABLE (Monetization)
-- ==========================================
CREATE TABLE license_transactions (
  id BIGSERIAL PRIMARY KEY,
  track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  buyer_address TEXT NOT NULL,           -- Buyer wallet address
  license_token_id BIGINT NOT NULL,      -- Story Protocol license token ID
  license_terms_id BIGINT NOT NULL,      -- License terms used
  transaction_hash TEXT NOT NULL,        -- Blockchain transaction hash

  -- Financial Data
  price_paid DECIMAL(18,8) NOT NULL,     -- Amount paid for license
  currency_token TEXT NOT NULL,          -- Token used (WIP, ETH, etc.)
  revenue_share_percent INTEGER,         -- Revenue share for this license

  -- License Details
  license_type TEXT NOT NULL,            -- Type of license purchased
  usage_rights TEXT,                     -- What buyer can do
  territory TEXT,                        -- Geographic limitations

  -- Status
  status TEXT DEFAULT 'active',          -- active, expired, revoked
  expires_at TIMESTAMP WITH TIME ZONE,   -- License expiration (if any)

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- REVENUE_CLAIMS TABLE (Creator Earnings)
-- ==========================================
CREATE TABLE revenue_claims (
  id BIGSERIAL PRIMARY KEY,
  creator_address TEXT NOT NULL,         -- Creator claiming revenue
  track_id TEXT REFERENCES tracks(id) ON DELETE CASCADE,
  transaction_hash TEXT NOT NULL,        -- Claim transaction hash

  -- Financial Data
  amount_claimed DECIMAL(18,8) NOT NULL, -- Amount claimed
  currency_token TEXT NOT NULL,          -- Token claimed (WIP, ETH, etc.)
  revenue_source TEXT NOT NULL,          -- 'license_sales', 'derivative', 'royalty'

  -- Claim Details
  claim_period_start TIMESTAMP WITH TIME ZONE,
  claim_period_end TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- LIKES TABLE
-- ==========================================
CREATE TABLE likes (
  id BIGSERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_address, track_id)
);

-- ==========================================
-- COMMENTS TABLE
-- ==========================================
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- FOLLOWS TABLE
-- ==========================================
CREATE TABLE follows (
  id BIGSERIAL PRIMARY KEY,
  follower_address TEXT NOT NULL,
  following_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_address, following_address),
  CHECK (follower_address != following_address)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_tracks_artist_address ON tracks(artist_address);
CREATE INDEX idx_tracks_verified ON tracks(verified);
CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);
CREATE INDEX idx_tracks_plays ON tracks(plays DESC);
CREATE INDEX idx_tracks_ip_id ON tracks(ip_id);
CREATE INDEX idx_tracks_revenue ON tracks(total_revenue_earned DESC);

CREATE INDEX idx_license_transactions_track_id ON license_transactions(track_id);
CREATE INDEX idx_license_transactions_buyer ON license_transactions(buyer_address);
CREATE INDEX idx_license_transactions_created_at ON license_transactions(created_at DESC);

CREATE INDEX idx_revenue_claims_creator ON revenue_claims(creator_address);
CREATE INDEX idx_revenue_claims_track_id ON revenue_claims(track_id);
CREATE INDEX idx_revenue_claims_created_at ON revenue_claims(created_at DESC);

CREATE INDEX idx_likes_user_address ON likes(user_address);
CREATE INDEX idx_likes_track_id ON likes(track_id);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

CREATE INDEX idx_comments_track_id ON comments(track_id);
CREATE INDEX idx_comments_user_address ON comments(user_address);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX idx_follows_follower ON follows(follower_address);
CREATE INDEX idx_follows_following ON follows(following_address);

-- ==========================================
-- TRIGGERS FOR AUTO-UPDATE
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
    BEFORE UPDATE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SAMPLE DATA FOR TESTING
-- ==========================================
INSERT INTO profiles (address, display_name, verified) VALUES
('0xE89fEf221bdEd027C4c9F07D256b9Dc1422A2455', 'MusicMaker', true),
('0xA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0', 'BeatCreator', false);

INSERT INTO tracks (
  id, ip_id, title, description, genre, artist_address, artist_name,
  duration, verified, yakoa_status, plays, total_revenue_earned, total_licenses_sold,
  license_terms_ids
) VALUES
(
  'track-1',
  '0xfB53131F98a66d0565737A9b55f89b9a4f77d7B9',
  'Summer Vibes',
  'A chill summer track perfect for relaxing by the beach.',
  'Electronic',
  '0xE89fEf221bdEd027C4c9F07D256b9Dc1422A2455',
  'MusicMaker',
  '3:24',
  true,
  'verified',
  1250,
  5.25,
  12,
  '{1605}'
),
(
  'track-2',
  '0x2345678901234567890123456789012345678901',
  'Midnight Dreams',
  'Atmospheric electronic soundscape.',
  'Ambient',
  '0xA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
  'BeatCreator',
  '4:12',
  true,
  'verified',
  892,
  2.80,
  7,
  '{1606}'
);
