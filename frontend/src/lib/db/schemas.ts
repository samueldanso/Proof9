// Complete Database schema for type safety

// Creator interface for Story Protocol compliance
export interface Creator {
  name: string;
  address: string;
  contributionPercent: number;
  description?: string;
  socialMedia?: Array<{
    platform: string;
    url: string;
  }>;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          address: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          address: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          verified?: boolean;
        };
        Update: {
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          verified?: boolean;
        };
      };
      tracks: {
        Row: {
          id: string;
          ip_id: string | null;
          transaction_hash: string | null;
          token_id: string | null;
          license_terms_ids: string[] | null;
          title: string;
          description: string | null;
          genre: string | null;
          tags: string[] | null;
          duration: string | null;
          artist_address: string;
          artist_name: string | null;
          creators: Creator[] | null;
          file_name: string | null;
          file_type: string | null;
          file_size: number | null;
          file_hash: string | null;
          ipfs_hash: string | null;
          ipfs_url: string | null;
          metadata_ipfs_hash: string | null;
          metadata_ipfs_url: string | null;
          nft_metadata_ipfs_hash: string | null;
          nft_metadata_ipfs_url: string | null;
          ip_metadata_hash: string | null;
          nft_metadata_hash: string | null;
          image: string | null;
          image_hash: string | null;
          media_url: string | null;
          media_hash: string | null;
          media_type: string | null;
          image_url: string | null;
          yakoa_token_id: string | null;
          yakoa_status: string | null;
          yakoa_confidence: number | null;
          yakoa_infringement_status: string | null;
          yakoa_external_infringements: any | null;
          yakoa_in_network_infringements: any | null;
          verified: boolean;
          license_type: string | null;
          license_price: number | null;
          commercial_rev_share: number | null;
          minting_fee: number | null;
          total_revenue_earned: number;
          total_licenses_sold: number;
          derivative_revenue: number;
          last_revenue_claim: string | null;
          plays: number;
          likes_count: number;
          comments_count: number;
          uploaded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ip_id?: string | null;
          transaction_hash?: string | null;
          token_id?: string | null;
          license_terms_ids?: string[] | null;
          title: string;
          description?: string | null;
          genre?: string | null;
          tags?: string[] | null;
          duration?: string | null;
          artist_address: string;
          artist_name?: string | null;
          creators?: Creator[] | null;
          file_name?: string | null;
          file_type?: string | null;
          file_size?: number | null;
          file_hash?: string | null;
          ipfs_hash?: string | null;
          ipfs_url?: string | null;
          metadata_ipfs_hash?: string | null;
          metadata_ipfs_url?: string | null;
          nft_metadata_ipfs_hash?: string | null;
          nft_metadata_ipfs_url?: string | null;
          ip_metadata_hash?: string | null;
          nft_metadata_hash?: string | null;
          image?: string | null;
          image_hash?: string | null;
          media_url?: string | null;
          media_hash?: string | null;
          media_type?: string | null;
          image_url?: string | null;
          yakoa_token_id?: string | null;
          yakoa_status?: string | null;
          yakoa_confidence?: number | null;
          yakoa_infringement_status?: string | null;
          yakoa_external_infringements?: any | null;
          yakoa_in_network_infringements?: any | null;
          verified?: boolean;
          license_type?: string | null;
          license_price?: number | null;
          commercial_rev_share?: number | null;
          minting_fee?: number | null;
          total_revenue_earned?: number;
          total_licenses_sold?: number;
          derivative_revenue?: number;
          last_revenue_claim?: string | null;
          plays?: number;
          likes_count?: number;
          comments_count?: number;
        };
        Update: {
          ip_id?: string | null;
          transaction_hash?: string | null;
          token_id?: string | null;
          license_terms_ids?: string[] | null;
          title?: string;
          description?: string | null;
          genre?: string | null;
          tags?: string[] | null;
          duration?: string | null;
          artist_name?: string | null;
          creators?: Creator[] | null;
          file_name?: string | null;
          file_type?: string | null;
          file_size?: number | null;
          file_hash?: string | null;
          ipfs_hash?: string | null;
          ipfs_url?: string | null;
          metadata_ipfs_hash?: string | null;
          metadata_ipfs_url?: string | null;
          nft_metadata_ipfs_hash?: string | null;
          nft_metadata_ipfs_url?: string | null;
          ip_metadata_hash?: string | null;
          nft_metadata_hash?: string | null;
          image?: string | null;
          image_hash?: string | null;
          media_url?: string | null;
          media_hash?: string | null;
          media_type?: string | null;
          image_url?: string | null;
          yakoa_token_id?: string | null;
          yakoa_status?: string | null;
          yakoa_confidence?: number | null;
          yakoa_infringement_status?: string | null;
          yakoa_external_infringements?: any | null;
          yakoa_in_network_infringements?: any | null;
          verified?: boolean;
          license_type?: string | null;
          license_price?: number | null;
          commercial_rev_share?: number | null;
          minting_fee?: number | null;
          total_revenue_earned?: number;
          total_licenses_sold?: number;
          derivative_revenue?: number;
          last_revenue_claim?: string | null;
          plays?: number;
          likes_count?: number;
          comments_count?: number;
        };
      };
      license_transactions: {
        Row: {
          id: number;
          track_id: string;
          buyer_address: string;
          license_token_id: number;
          license_terms_id: number;
          transaction_hash: string;
          price_paid: number;
          currency_token: string;
          revenue_share_percent: number | null;
          license_type: string;
          usage_rights: string | null;
          territory: string | null;
          status: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          track_id: string;
          buyer_address: string;
          license_token_id: number;
          license_terms_id: number;
          transaction_hash: string;
          price_paid: number;
          currency_token: string;
          revenue_share_percent?: number | null;
          license_type: string;
          usage_rights?: string | null;
          territory?: string | null;
          status?: string;
          expires_at?: string | null;
        };
        Update: {
          status?: string;
          expires_at?: string | null;
        };
      };
      revenue_claims: {
        Row: {
          id: number;
          creator_address: string;
          track_id: string | null;
          transaction_hash: string;
          amount_claimed: number;
          currency_token: string;
          revenue_source: string;
          claim_period_start: string | null;
          claim_period_end: string | null;
          created_at: string;
        };
        Insert: {
          creator_address: string;
          track_id?: string | null;
          transaction_hash: string;
          amount_claimed: number;
          currency_token: string;
          revenue_source: string;
          claim_period_start?: string | null;
          claim_period_end?: string | null;
        };
        Update: never;
      };
      likes: {
        Row: {
          id: number;
          user_address: string;
          track_id: string;
          created_at: string;
        };
        Insert: {
          user_address: string;
          track_id: string;
        };
        Update: never;
      };
      comments: {
        Row: {
          id: number;
          user_address: string;
          track_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_address: string;
          track_id: string;
          content: string;
        };
        Update: {
          content?: string;
        };
      };
      follows: {
        Row: {
          id: number;
          follower_address: string;
          following_address: string;
          created_at: string;
        };
        Insert: {
          follower_address: string;
          following_address: string;
        };
        Update: never;
      };
    };
  };
}

// Convenience type for table rows
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

// Table-specific types for easier use
export type Profile = Tables<"profiles">;
export type Track = Tables<"tracks">;
export type LicenseTransaction = Tables<"license_transactions">;
export type RevenueClaim = Tables<"revenue_claims">;
export type Like = Tables<"likes">;
export type Comment = Tables<"comments">;
export type Follow = Tables<"follows">;
