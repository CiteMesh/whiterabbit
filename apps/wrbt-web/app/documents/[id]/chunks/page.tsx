"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getChunks } from "@wrbt/sdk";
import { Chunk, ChunkListResponse } from "@wrbt/types";
import { CodePanel } from "@wrbt/ui";

export default function ChunksPage() {
  const params = useParams<{ id: string }>();
  const docId = params?.id;
  const [chunks, setChunks] = useState<ChunkListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!docId) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await getChunks(docId);
        if (!cancelled) setChunks(res);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to fetch chunks");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
  }, [docId]);

  const english = useMemo(() => {
    if (!chunks) return "Awaiting chunk list.";
    return `${chunks.chunks.length} chunks returned for document ${chunks.document_id}.`;
  }, [chunks]);

  const toCsv = (items: Chunk[]) => {
    const header = "index,token_count,embedding_status,content";
    const rows = items.map((c) =>
      [c.index, c.token_count ?? "", c.embedding_status ?? "", JSON.stringify(c.content || "")].join(",")
    );
    return [header, ...rows].join("\n");
  };

  const downloadCsv = () => {
    if (!chunks) return;
    const blob = new Blob([toCsv(chunks.chunks)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wrbt-${chunks.document_id}-chunks.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Chunks</h1>
        <Link className="text-xs text-muted" href={`/documents/${docId}`}>
          ← Back to document
        </Link>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="wrbt-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Chunk list</div>
            <div className="text-xs text-muted">GET /v1/documents/{"{id}"}/chunks</div>
          </div>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => downloadCsv()}
              className="px-3 py-1 rounded-full border border-border text-muted hover:text-text"
              disabled={!chunks}
            >
              Download CSV
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {chunks?.chunks.map((chunk) => (
            <div key={chunk.id} className="border border-border rounded-md p-3 bg-black/20">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Index {chunk.index}</span>
                <span className="font-mono">tokens: {chunk.token_count ?? "?"}</span>
              </div>
              <p className="text-sm mt-2 whitespace-pre-wrap text-text/90">{chunk.content}</p>
            </div>
          )) || <div className="text-xs text-muted">No chunks yet.</div>}
        </div>
      </div>

      <CodePanel
        title="Machine view"
        english={english}
        json={chunks}
        raw={chunks ? JSON.stringify(chunks, null, 2) : ""}
        defaultTab="json"
      />

      {loading && <div className="text-xs text-muted">Fetching chunk list…</div>}
    </div>
  );
}
