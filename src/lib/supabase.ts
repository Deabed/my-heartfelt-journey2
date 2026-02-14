import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars are missing. Check .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).");
}

export const supabase = createClient(url ?? "", key ?? "");
