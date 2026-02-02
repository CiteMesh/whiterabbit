import {
  ChunkListResponse,
  ContractCheckResult,
  Document,
  IngestRequest,
  IngestResponse,
  SchemaReport
} from "@wrbt/types";

const normalizeBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_WRBT_API_BASE;
  if (!url) {
    throw new Error("Set NEXT_PUBLIC_WRBT_API_BASE to point at the Replit backend.");
  }
  return url.replace(/\/$/, "");
};

const apiHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  const apiKey = process.env.WRBT_API_KEY || process.env.NEXT_PUBLIC_WRBT_API_KEY;
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
  return headers;
};

const handleJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${normalizeBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...apiHeaders(),
      ...(init?.headers || {})
    }
  });

  const raw = await res.text();
  let data: unknown = raw;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    // leave data as raw string
  }

  if (!res.ok) {
    const reason = typeof data === "string" && data.length ? data : res.statusText;
    throw new Error(`WRBT API ${res.status}: ${reason}`);
  }

  return data as T;
};

export const ingest = async (payload: IngestRequest): Promise<IngestResponse> => {
  return handleJson<IngestResponse>("/v1/ingest", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const getDocument = async (id: string): Promise<Document> => {
  return handleJson<Document>(`/v1/documents/${id}`);
};

export const getChunks = async (id: string): Promise<ChunkListResponse> => {
  return handleJson<ChunkListResponse>(`/v1/documents/${id}/chunks`);
};

export const getSchemaReport = async (): Promise<SchemaReport> => {
  return handleJson<SchemaReport>("/schema-report");
};

export const getBaseUrl = () => normalizeBaseUrl();

export const checkContract = (
  expectedKeys: string[],
  report: SchemaReport
): ContractCheckResult => {
  const reportKeys = Object.keys(report || {});
  const missing = expectedKeys.filter((k) => !reportKeys.includes(k));
  const extra = reportKeys.filter((k) => !expectedKeys.includes(k));
  return {
    expectedKeys,
    reportKeys,
    missing,
    extra,
    ok: missing.length === 0
  };
};
