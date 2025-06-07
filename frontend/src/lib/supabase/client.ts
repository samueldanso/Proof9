import { env } from "@/env";
import type { Database } from "@/lib/db/schemas";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
    },
  },
);
