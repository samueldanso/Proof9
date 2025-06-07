import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema for type safety
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          address: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          address: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          verified?: boolean;
        };
        Update: {
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          verified?: boolean;
        };
      };
      likes: {
        Row: {
          id: string;
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
          id: string;
          user_address: string;
          track_id: string;
          content: string;
          created_at: string;
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
    };
  };
}

// Convenience type
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
