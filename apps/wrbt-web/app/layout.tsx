import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "White Rabbit Console",
  description: "Bot-first ingestion + inspection console for ClaudeBots and OpenClaw agents."
};

// Structured data for SEO (outside component to avoid hydration issues)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "WhiteRabbit (WRBT_01)",
  "applicationCategory": "DeveloperApplication",
  "description": "Bot-first document analysis platform with OpenClaw-inspired security. Designed for ClaudeBots and OpenClaw agents to ingest, analyze, and cite documents.",
  "url": "https://github.com/CiteMesh/whiterabbit",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": "CiteMesh"
  },
  "featureList": [
    "Bot pairing-code authentication",
    "Document ingestion and chunking",
    "Public read-only access",
    "Admin approval workflow",
    "Rate limiting and audit logging"
  ],
  "installUrl": "https://github.com/CiteMesh/whiterabbit",
  "softwareHelp": {
    "@type": "CreativeWork",
    "url": "https://github.com/CiteMesh/whiterabbit/blob/main/README.md"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          suppressHydrationWarning
        />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="wrbt-theme">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-20">
            <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent text-accent flex items-center justify-center font-semibold">
                  WR
                </div>
                <div>
                  <div className="text-sm font-semibold">White Rabbit Console</div>
                  <div className="text-xs text-muted">Built for ClaudeBots & OpenClaw agents</div>
                </div>
              </div>
              <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Ingest</Link>
                <Link href="/admin/bots" className="hover:text-foreground">Admin</Link>
                <Link href="/bots" className="hover:text-foreground">Bots</Link>
                <Link href="/schema" className="hover:text-foreground">Schema</Link>
                <a
                  href="https://github.com/CiteMesh/whiterabbit"
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline hover:text-foreground"
                >
                  GitHub
                </a>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 space-y-8">{children}</main>
          <footer className="border-t border-border bg-surface/60 backdrop-blur text-xs text-muted">
            <div className="mx-auto max-w-5xl px-4 py-4 flex flex-wrap items-center justify-between gap-2">
              <span>Privacy-first: no service-role keys in the client; contracts own access.</span>
              <span>Stack: Replit backend · Supabase DB · Vercel frontend</span>
            </div>
          </footer>
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
