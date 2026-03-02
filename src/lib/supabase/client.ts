import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return document.cookie.split(';').map(cookie => {
              const [name, ...rest] = cookie.trim().split('=');
              return { name, value: rest.join('=') };
            });
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieOptions = [
                `${name}=${value}`,
                `path=${options?.path || '/'}`,
                `max-age=${options?.maxAge || 31536000}`,
                options?.sameSite ? `samesite=${options.sameSite}` : 'samesite=lax',
              ];
              
              if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
                cookieOptions.push('secure');
              }
              
              document.cookie = cookieOptions.join('; ');
            });
          },
        },
      }
    );
  }
  return client;
}
