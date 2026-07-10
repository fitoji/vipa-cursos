import { createAuthClient } from "better-auth/react";

// On the server (SSR/prerender) a relative base URL is invalid, so fall back to
// an absolute URL. In the browser we use the same-origin relative path.
const baseURL =
  typeof window !== "undefined"
    ? "/api/auth"
    : (process.env.BETTER_AUTH_URL ?? "http://localhost:3000");

export const authClient = createAuthClient({ baseURL });
