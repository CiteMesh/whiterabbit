"use client";

import { useEffect, useMemo, useState } from "react";
import { checkContract, getSchemaReport } from "@wrbt/sdk";
import { SchemaReport } from "@wrbt/types";
import { CodePanel } from "@wrbt/ui";

const expectedKeys = ["documents", "chunks", "jobs", "ingest", "health"];

export default function SchemaPage() {
  const [report, setReport] = useState<SchemaReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await getSchemaReport();
        if (!cancelled) setReport(res);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to fetch schema report");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
  }, []);

  const check = useMemo(() => (report ? checkContract(expectedKeys, report) : null), [report]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">Schema / Contract Check</h1>
        <span className="text-xs text-muted">GET /schema-report (backend must serve this)</span>
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="wrbt-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Drift guardrail</div>
            <div className="text-xs text-muted">Compares expected keys vs backend report.</div>
          </div>
          <div className={`wrbt-pill text-xs ${check?.ok ? "text-emerald-200" : "text-amber-200"}`}>
            {check?.ok ? "contract OK" : "contract needs attention"}
          </div>
        </div>
        <div className="text-xs text-muted">
          Expected keys: {expectedKeys.join(", ")}. Missing keys will warn; adjust this list once the backend publishes
          its canonical report shape.
        </div>
        {check && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="border border-border rounded-md p-3 bg-black/20">
              <div className="font-semibold mb-1">Missing</div>
              {check.missing.length ? check.missing.join(", ") : "None"}
            </div>
            <div className="border border-border rounded-md p-3 bg-black/20">
              <div className="font-semibold mb-1">Extra</div>
              {check.extra.length ? check.extra.join(", ") : "None"}
            </div>
          </div>
        )}
      </div>

      <CodePanel
        title="Schema report"
        english={report ? `Report keys: ${Object.keys(report).join(", ")}` : "Awaiting backend response."}
        json={report}
        raw={report ? JSON.stringify(report, null, 2) : ""}
        defaultTab="json"
      />

      {loading && <div className="text-xs text-muted">Fetching schema-report…</div>}
    </div>
  );
}
