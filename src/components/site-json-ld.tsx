import { siteUrl } from "@/lib/seo";

const data = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VipaBase",
    url: siteUrl,
    logo: `${siteUrl}/favicon.png`,
    description: "Personal app to register and organize your Vipassana meditation courses.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VipaBase",
    url: siteUrl,
    inLanguage: ["es", "en"],
  },
];

export function SiteJsonLd() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
