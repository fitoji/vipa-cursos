// Generate Better Auth's tables (user, session, account, verification) in the DB.
// Run once locally with DATABASE_URL set:
//   pnpm dlx tsx scripts/generate-auth-schema.ts
import { auth } from "../src/lib/auth";

async function main() {
  await auth.api.generateSchema();
  console.log("Better Auth schema ensured.");
}

main();
