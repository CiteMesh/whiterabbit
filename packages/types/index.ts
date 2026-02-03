export type JobStatus = "queued" | "processing" | "done" | "failed";

export interface IngestRequest {
  content: string;
  title?: string;
  metadata?: Record<string, any>;
}

export interface IngestResponse {
  document_id: string;
  job_id: string;
  status: JobStatus;
  message?: string;
}

export interface Document {
  id: string;
  org_id?: string | null;
  user_id?: string | null;
  title?: string | null;
  created_at?: string | null;
  status: JobStatus;
  job_id?: string | null;
  chunk_count?: number | null;
  error_code?: string | null;
  error_message?: string | null;
}

export interface Chunk {
  id: string;
  document_id: string;
  index: number;
  content: string;
  token_count?: number | null;
  embedding_status?: string | null;
}

export interface ChunkListResponse {
  document_id: string;
  chunks: Chunk[];
}

export type SchemaReport = Record<string, unknown>;

export interface ContractCheckResult {
  expectedKeys: string[];
  reportKeys: string[];
  missing: string[];
  extra: string[];
  ok: boolean;
}
