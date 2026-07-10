import { createAuthClient } from "better-auth/react";

// Omitting baseURL — Better Auth defaults to same-origin, which is always correct
// when client and server share a domain (browser → Next.js same-origin).
export const authClient = createAuthClient({});
