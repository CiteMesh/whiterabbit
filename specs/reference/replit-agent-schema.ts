export type WrbtField = {
  name: string;
  type: string;
  description?: string;
  pk?: boolean;
  fk?: boolean;
};

export type WrbtTable = {
  name: string;
  title: string;
  description: string;
  fields: WrbtField[];
};

export type WrbtRelationship = {
  label: string;
  description: string;
  from: { table: string; field: string };
  to: { table: string; field: string };
};

export const WRBT_SCHEMA: {
  tables: WrbtTable[];
  relationships: WrbtRelationship[];
  exampleRows: { table: string; rows: any[] }[];
} = {
  tables: [
    {
      name: "documents",
      title: "Documents",
      description:
        "Top-level source artifacts. Think: PDFs, notes, web pages. In production, this would include tenancy + access controls; here it’s purely demonstrative.",
      fields: [
        {
          name: "id",
          type: "text (uuid)",
          description: "Primary identifier.",
          pk: true,
        },
        {
          name: "title",
          type: "text",
          description: "Human-friendly label.",
        },
        {
          name: "source_type",
          type: "text",
          description: "Where it came from (upload/web/note).",
        },
        {
          name: "source_ref",
          type: "text",
          description: "Opaque external reference (URL/path).",
        },
        {
          name: "content_hash",
          type: "text",
          description:
            "Deterministic hash for dedupe (mock string in WRBT_01).",
        },
        {
          name: "created_at",
          type: "timestamptz",
          description: "Creation time.",
        },
        {
          name: "updated_at",
          type: "timestamptz",
          description: "Last update time.",
        },
        {
          name: "status",
          type: "text",
          description: "ingested | pending | error (illustrative).",
        },
        {
          name: "metadata",
          type: "jsonb",
          description: "Extra fields for UI/debug; keep small.",
        },
      ],
    },
    {
      name: "chunks",
      title: "Chunks",
      description:
        "Sub-document slices derived from documents. Retrieval systems typically operate at this level.",
      fields: [
        {
          name: "id",
          type: "text (uuid)",
          description: "Primary identifier.",
          pk: true,
        },
        {
          name: "document_id",
          type: "text (uuid)",
          description: "Parent document.",
          fk: true,
        },
        {
          name: "chunk_index",
          type: "int",
          description: "Ordering within a document.",
        },
        {
          name: "content",
          type: "text",
          description: "Chunk text.",
        },
        {
          name: "token_count",
          type: "int",
          description: "Approx token count (mocked).",
        },
        {
          name: "embedding_id",
          type: "text (uuid) nullable",
          description: "Optional link to embeddings.",
          fk: true,
        },
        {
          name: "created_at",
          type: "timestamptz",
          description: "Creation time.",
        },
      ],
    },
    {
      name: "embeddings",
      title: "Embeddings (placeholder)",
      description:
        "Vectors associated with chunks. In WRBT_01, these vectors are meaningless placeholders used to communicate shape.",
      fields: [
        {
          name: "id",
          type: "text (uuid)",
          description: "Primary identifier.",
          pk: true,
        },
        {
          name: "chunk_id",
          type: "text (uuid)",
          description: "The chunk this embedding represents.",
          fk: true,
        },
        {
          name: "model",
          type: "text",
          description: "Embedding model name (mock).",
        },
        {
          name: "dims",
          type: "int",
          description: "Vector dimensionality.",
        },
        {
          name: "vector",
          type: "float8[]",
          description: "Placeholder numeric vector.",
        },
        {
          name: "created_at",
          type: "timestamptz",
          description: "Creation time.",
        },
      ],
    },
    {
      name: "documents_jobs",
      title: "Document jobs (mock)",
      description:
        "Background pipeline tracking (ingest/embed). In real systems, this is a queue/worker system; here it’s a static reference.",
      fields: [
        {
          name: "id",
          type: "text (uuid)",
          description: "Primary identifier.",
          pk: true,
        },
        {
          name: "document_id",
          type: "text (uuid)",
          description: "Target document.",
          fk: true,
        },
        {
          name: "type",
          type: "text",
          description: "ingest | embed (illustrative).",
        },
        {
          name: "status",
          type: "text",
          description: "queued | running | done | error (illustrative).",
        },
        {
          name: "progress",
          type: "int",
          description: "0-100 (mock).",
        },
        {
          name: "created_at",
          type: "timestamptz",
          description: "Creation time.",
        },
      ],
    },
  ],
  relationships: [
    {
      label: "Document has many Chunks",
      description: "One document → many chunks.",
      from: { table: "chunks", field: "document_id" },
      to: { table: "documents", field: "id" },
    },
    {
      label: "Chunk optionally points to Embedding",
      description:
        "Chunk.embedding_id may be null until embeddings are generated.",
      from: { table: "chunks", field: "embedding_id" },
      to: { table: "embeddings", field: "id" },
    },
    {
      label: "Embedding belongs to Chunk",
      description: "Embeddings.chunk_id references the owning chunk.",
      from: { table: "embeddings", field: "chunk_id" },
      to: { table: "chunks", field: "id" },
    },
    {
      label: "Document has many Jobs",
      description: "Jobs allow showing pipeline state without implementing workers.",
      from: { table: "documents_jobs", field: "document_id" },
      to: { table: "documents", field: "id" },
    },
  ],
  exampleRows: [
    {
      table: "documents",
      rows: [
        {
          id: "doc_7f2a1d1c-9c1f-4b2a-9e77-2c1b5a74c9a1",
          title: "WRBT Sample: Product Brief",
          source_type: "note",
          source_ref: "wrbt://notes/product-brief",
          content_hash: "sha256:wrbt_product_brief_v1",
          status: "ingested",
          metadata: { tags: ["demo"], author: "system" },
          created_at: "2026-02-02T12:00:00Z",
          updated_at: "2026-02-02T12:00:00Z",
        },
        {
          id: "doc_23b2f8b1-ef4a-4d0f-8f9a-1c7b2c3c4d5e",
          title: "WRBT Sample: Architecture Notes",
          source_type: "web",
          source_ref: "https://example.com/wrbt/architecture-notes",
          content_hash: "sha256:wrbt_arch_notes_v1",
          status: "pending",
          metadata: { tags: ["demo", "architecture"], author: "system" },
          created_at: "2026-02-02T12:00:00Z",
          updated_at: "2026-02-02T12:00:00Z",
        },
      ],
    },
    {
      table: "chunks",
      rows: [
        {
          id: "chk_9e1a3f12-0a11-4f3f-9c1b-0b7c2f4a11aa",
          document_id: "doc_7f2a1d1c-9c1f-4b2a-9e77-2c1b5a74c9a1",
          chunk_index: 0,
          content:
            "This is a demo chunk. It illustrates how documents are split into retrieval units.",
          token_count: 24,
          embedding_id: "emb_4d5e6f70-1234-4abc-9abc-0d0e0f1a2b3c",
          created_at: "2026-02-02T12:00:00Z",
        },
        {
          id: "chk_4c2b7e88-1aa2-4f2e-a1d3-1b2c3d4e5f60",
          document_id: "doc_7f2a1d1c-9c1f-4b2a-9e77-2c1b5a74c9a1",
          chunk_index: 1,
          content:
            "Second demo chunk. In real systems, chunk sizing matters for retrieval quality.",
          token_count: 22,
          embedding_id: null,
          created_at: "2026-02-02T12:00:00Z",
        },
      ],
    },
    {
      table: "embeddings",
      rows: [
        {
          id: "emb_4d5e6f70-1234-4abc-9abc-0d0e0f1a2b3c",
          chunk_id: "chk_9e1a3f12-0a11-4f3f-9c1b-0b7c2f4a11aa",
          model: "wrbt-embed-mock-v1",
          dims: 8,
          vector: [0.11, -0.03, 0.29, 0.04, -0.12, 0.07, 0.18, -0.09],
          created_at: "2026-02-02T12:00:00Z",
        },
      ],
    },
    {
      table: "documents_jobs",
      rows: [
        {
          id: "job_aa11bb22-cc33-4d44-9e55-ff6677889900",
          document_id: "doc_23b2f8b1-ef4a-4d0f-8f9a-1c7b2c3c4d5e",
          type: "ingest",
          status: "queued",
          progress: 0,
          created_at: "2026-02-02T12:00:00Z",
        },
      ],
    },
  ],
};
