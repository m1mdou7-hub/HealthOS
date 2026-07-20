import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types_db';

// Define a function to create a Supabase client for client-side operations
export const createClient = () => {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (url.endsWith('/rest/v1/')) {
    url = url.slice(0, -9);
  } else if (url.endsWith('/rest/v1')) {
    url = url.slice(0, -8);
  }

  return createBrowserClient<Database>(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
