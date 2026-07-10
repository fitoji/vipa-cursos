import { execSync } from "node:child_process";

// Creates Better Auth's tables (user, session, account, verification) in the
// database configured in src/lib/auth.ts.
//
// Run ONCE locally with DATABASE_URL set:
//   pnpm dlx tsx scripts/generate-auth-schema.ts
//
// This invokes the Better Auth CLI: `better-auth migrate` (generates + applies).
// To only emit SQL without applying, use `generate` instead of `migrate`.
execSync("pnpm dlx @better-auth/cli@latest migrate --config ./src/lib/auth.ts", {
  stdio: "inherit",
});
console.log("Better Auth schema ensured.");
