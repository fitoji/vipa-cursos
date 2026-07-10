/**
 * Email sending for Better Auth email flows.
 *
 * Currently: console.log placeholder for local dev.
 * Production: replace with Cloudflare Email Service or any SMTP provider.
 * See skill: cloudflare-email-service
 */

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log("\n📧 Email enviado (dev):");
    console.log(`   Para: ${to}`);
    console.log(`   Asunto: ${subject}`);
    console.log(`   Texto: ${text}\n`);
    return;
  }
  // TODO: integrate Cloudflare Email Service in production
  // See: cloudflare-email-service skill
  console.warn(`[sendEmail] Production email not configured. To: ${to}, Subject: ${subject}`);
}
