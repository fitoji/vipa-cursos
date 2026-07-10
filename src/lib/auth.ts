import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "email-password"],
    },
  },
  plugins: [nextCookies()], // MUST be last
});
