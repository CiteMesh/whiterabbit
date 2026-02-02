import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "White Rabbit Console",
  description: "Bot-first ingestion + inspection console for ClaudeBots and OpenClaw agents."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text">
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
              <nav className="flex items-center gap-4 text-sm text-muted">
                <Link href="/">Ingest</Link>
                <Link href="/schema">Schema</Link>
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline"
                >
                  Vercel
                </a>
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
      </body>
    </html>
  );
}
