"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ingest } from "@wrbt/sdk";
import { IngestRequest, IngestResponse } from "@wrbt/types";
import { CodePanel } from "@wrbt/ui";

const starter = `Claude/OpenClaw friendly content goes here. Explain what the document is about, then let the backend chunk it.`;

export default function HomePage() {
  const [payload, setPayload] = useState<IngestRequest>({
    org_id: "",
    user_id: "",
    title: "",
    content: starter
  });
  const [result, setResult] = useState<IngestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const contentLength = useMemo(() => payload.content?.length || 0, [payload.content]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body: IngestRequest = {
        org_id: payload.org_id || undefined,
        user_id: payload.user_id || undefined,
        title: payload.title || undefined,
        content: payload.content || ""
      };
      const res = await ingest(body);
      setResult(res);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ingest failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="wrbt-card p-6 space-y-3">
        <div className="text-sm uppercase tracking-wide text-muted">White Rabbit / WRBT_01</div>
        <h1 className="text-2xl font-semibold">Bot-first ingestion cockpit</h1>
        <p className="text-muted text-sm max-w-3xl">
          Designed so ClaudeBots and OpenClaw operators can push documents, watch jobs move, and inspect chunks
          without guessing. Contracts stay in specs/openapi.yaml; this UI only talks through the SDK.
        </p>
        <div className="flex gap-3 text-xs text-muted flex-wrap">
          <span className="wrbt-pill">API-base: {process.env.NEXT_PUBLIC_WRBT_API_BASE || "unset"}</span>
          <span className="wrbt-pill">Env: NEXT_PUBLIC_WRBT_API_BASE</span>
          <span className="wrbt-pill">No service-role keys in client</span>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <form onSubmit={onSubmit} className="wrbt-card p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Create Document</h2>
              <p className="text-xs text-muted">POST /v1/ingest — queues a job and returns ids</p>
            </div>
            <div className="text-xs text-muted">{contentLength} chars</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm space-y-1">
              <span className="text-muted">org_id (optional)</span>
              <input
                className="w-full bg-surface border border-border rounded-md px-3 py-2"
                value={payload.org_id || ""}
                onChange={(e) => setPayload((p) => ({ ...p, org_id: e.target.value }))}
                placeholder="org_..."
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="text-muted">user_id (optional)</span>
              <input
                className="w-full bg-surface border border-border rounded-md px-3 py-2"
                value={payload.user_id || ""}
                onChange={(e) => setPayload((p) => ({ ...p, user_id: e.target.value }))}
                placeholder="user_..."
              />
            </label>
          </div>

          <label className="text-sm space-y-1 block">
            <span className="text-muted">title (optional)</span>
            <input
              className="w-full bg-surface border border-border rounded-md px-3 py-2"
              value={payload.title || ""}
              onChange={(e) => setPayload((p) => ({ ...p, title: e.target.value }))}
              placeholder="Short title"
            />
          </label>

          <label className="text-sm space-y-1 block">
            <span className="text-muted">content (required)</span>
            <textarea
              className="w-full bg-surface border border-border rounded-md px-3 py-3 h-48"
              value={payload.content}
              onChange={(e) => setPayload((p) => ({ ...p, content: e.target.value }))}
              required
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-md bg-accent text-black font-semibold disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Create document"}
            </button>
            <span className="text-xs text-muted">
              Claude/OpenClaw friendly — SDK funnels everything; no direct fetches from UI.
            </span>
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}
        </form>

        <div className="space-y-3">
          <div className="wrbt-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Pipeline checkpoints</h3>
              <Link href="/schema" className="text-xs text-accent">View schema</Link>
            </div>
            <ul className="text-xs text-muted space-y-2 list-disc list-inside">
              <li>Health: GET /healthz /readyz</li>
              <li>Ingest: POST /v1/ingest → document_id + job_id</li>
              <li>Status: GET /v1/documents/{"{id}"}</li>
              <li>Chunks: GET /v1/documents/{"{id}"}/chunks</li>
              <li>Introspection: GET /schema-report</li>
            </ul>
          </div>
          {result && (
            <CodePanel
              title="Ingest response"
              english={
                <div className="space-y-1 text-sm">
                  <div>Document <strong>{result.document_id}</strong> accepted.</div>
                  <div>Job <strong>{result.job_id}</strong> is <span className="text-accent">{result.status}</span>.</div>
                  <Link className="text-accent" href={`/documents/${result.document_id}`}>
                    Open document inspector →
                  </Link>
                </div>
              }
              json={result}
              raw={JSON.stringify(result, null, 2)}
            />
          )}
        </div>
      </section>
    </div>
  );
}
