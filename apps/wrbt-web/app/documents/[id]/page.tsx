"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getChunks, getDocument } from "@wrbt/sdk";
import { ChunkListResponse, Document } from "@wrbt/types";
import { CodePanel } from "@wrbt/ui";

const statusTone: Record<Document["status"], string> = {
  queued: "bg-amber-500/20 text-amber-200",
  processing: "bg-blue-500/20 text-blue-200",
  done: "bg-emerald-500/20 text-emerald-200",
  failed: "bg-red-500/20 text-red-200"
};

export default function DocumentPage() {
  const params = useParams<{ id: string }>();
  const docId = params?.id;
  const [doc, setDoc] = useState<Document | null>(null);
  const [chunksMeta, setChunksMeta] = useState<ChunkListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!docId) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const d = await getDocument(docId);
        if (!cancelled) setDoc(d);
        // prefetch chunk count
        try {
          const ch = await getChunks(docId);
          if (!cancelled) setChunksMeta(ch);
        } catch (inner) {
          console.debug(inner);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to fetch document");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 3500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [docId]);

  const englishSummary = useMemo(() => {
    if (!doc) return "Waiting for document...";
    const parts = [
      `Document ${doc.id} is ${doc.status}.`,
      doc.chunk_count !== undefined && doc.chunk_count !== null
        ? `${doc.chunk_count} chunks reported.`
        : "Chunk count unknown yet."
    ];
    if (doc.error_message) parts.push(`Error: ${doc.error_message}`);
    return parts.join(" ");
  }, [doc]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">Document Inspector</h1>
        {doc && (
          <span className={`wrbt-pill text-xs ${statusTone[doc.status]}`}>{doc.status}</span>
        )}
        <span className="text-xs text-muted">Polls every 3.5s until done.</span>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="wrbt-card p-4 space-y-3">
          <div className="text-sm font-semibold">Metadata</div>
          <dl className="text-sm text-muted space-y-1">
            <div>
              <dt className="text-xs uppercase">document_id</dt>
              <dd className="font-mono text-text break-all">{doc?.id || docId}</dd>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="uppercase text-[10px] text-muted">org_id</div>
                <div className="font-mono">{doc?.org_id || "—"}</div>
              </div>
              <div>
                <div className="uppercase text-[10px] text-muted">user_id</div>
                <div className="font-mono">{doc?.user_id || "—"}</div>
              </div>
            </div>
            <div>
              <dt className="text-xs uppercase">job_id</dt>
              <dd className="font-mono text-text break-all">{doc?.job_id || "—"}</dd>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="uppercase text-[10px] text-muted">status</div>
                <div className="font-mono">{doc?.status || "unknown"}</div>
              </div>
              <div>
                <div className="uppercase text-[10px] text-muted">chunk_count</div>
                <div className="font-mono">{doc?.chunk_count ?? chunksMeta?.chunks?.length ?? "—"}</div>
              </div>
            </div>
            <div>
              <dt className="text-xs uppercase">created_at</dt>
              <dd className="font-mono">{doc?.created_at || "—"}</dd>
            </div>
            {doc?.error_message && (
              <div className="text-red-400 text-xs">{doc.error_message}</div>
            )}
          </dl>
          <div className="flex gap-3 text-xs">
            <Link className="text-accent" href={`/documents/${docId}/chunks`}>
              View chunks →
            </Link>
            <Link className="text-muted" href="/schema">
              Schema report
            </Link>
          </div>
        </div>

        <CodePanel
          title="Human + Machine"
          english={englishSummary}
          json={doc}
          raw={doc ? JSON.stringify(doc, null, 2) : ""}
          defaultTab="english"
        />
      </div>

      {loading && <div className="text-xs text-muted">Polling backend…</div>}
    </div>
  );
}
