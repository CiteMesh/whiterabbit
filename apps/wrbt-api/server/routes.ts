import type { Express } from "express";
import { createServer, type Server } from "http";
import { Router } from "express";
import { testConnection } from "./db";
import { storage } from "./storage";
import { botAuth, rateLimitByIP } from "./middleware/bot-auth";
import botsRouter from "./routes/bots";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Test database connection
  await testConnection();

  const api = Router();

  // ============================================================================
  // Health & Status Endpoints
  // ============================================================================

  api.get('/healthz', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  api.get('/readyz', async (req, res) => {
    try {
      const dbOk = await storage.healthCheck();
      if (!dbOk) {
        return res.status(503).json({
          status: 'not ready',
          message: 'Database connection failed',
        });
      }
      res.json({ status: 'ready' });
    } catch (err) {
      res.status(503).json({
        status: 'not ready',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });

  // ============================================================================
  // Bot Registration Routes (Public, Rate-Limited)
  // ============================================================================

  api.use('/bots', botsRouter);

  // ============================================================================
  // Public Document Routes (Read-Only)
  // ============================================================================

  api.get(
    '/documents',
    rateLimitByIP(100, 60000), // 100 requests per minute
    async (req, res) => {
      try {
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
        const offset = parseInt(req.query.offset as string) || 0;

        const documents = await storage.getPublicDocuments({ limit, offset });

        res.json({
          documents,
          pagination: {
            limit,
            offset,
            has_more: documents.length === limit,
          },
        });
      } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({
          error: 'Failed to fetch documents',
          code: 'INTERNAL_ERROR',
        });
      }
    }
  );

  api.get(
    '/documents/:id',
    rateLimitByIP(100, 60000),
    async (req, res) => {
      try {
        const doc = await storage.getDocumentById(req.params.id);

        if (!doc || !doc.is_public) {
          return res.status(404).json({
            error: 'Document not found',
            code: 'NOT_FOUND',
          });
        }

        res.json(doc);
      } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({
          error: 'Failed to fetch document',
          code: 'INTERNAL_ERROR',
        });
      }
    }
  );

  api.get(
    '/documents/:id/chunks',
    rateLimitByIP(100, 60000),
    async (req, res) => {
      try {
        // Verify document exists and is public
        const doc = await storage.getDocumentById(req.params.id);
        if (!doc || !doc.is_public) {
          return res.status(404).json({
            error: 'Document not found',
            code: 'NOT_FOUND',
          });
        }

        const chunks = await storage.getChunksByDocumentId(req.params.id);

        res.json({ chunks });
      } catch (error) {
        console.error('Get chunks error:', error);
        res.status(500).json({
          error: 'Failed to fetch chunks',
          code: 'INTERNAL_ERROR',
        });
      }
    }
  );

  api.get(
    '/documents/:id/status',
    rateLimitByIP(100, 60000),
    async (req, res) => {
      try {
        // Verify document exists
        const doc = await storage.getDocumentById(req.params.id);
        if (!doc || !doc.is_public) {
          return res.status(404).json({
            error: 'Document not found',
            code: 'NOT_FOUND',
          });
        }

        const job = await storage.getLatestJobByDocumentId(req.params.id);

        if (!job) {
          return res.status(404).json({
            error: 'No job found for this document',
            code: 'NOT_FOUND',
          });
        }

        res.json({
          job_id: job.id,
          status: job.status,
          progress: job.progress,
          error: job.error_message,
          started_at: job.started_at?.toISOString(),
          completed_at: job.completed_at?.toISOString(),
          updated_at: job.updated_at.toISOString(),
        });
      } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({
          error: 'Failed to fetch status',
          code: 'INTERNAL_ERROR',
        });
      }
    }
  );

  // ============================================================================
  // Bot-Authenticated Routes (Write Operations)
  // ============================================================================

  api.post('/ingest', botAuth, async (req, res) => {
    try {
      const { content, title, metadata } = req.body;

      // Validation
      if (!content || typeof content !== 'string') {
        return res.status(400).json({
          error: 'Content required',
          message: 'Provide content as a string',
          code: 'VALIDATION_ERROR',
        });
      }

      if (content.length > 10 * 1024 * 1024) { // 10 MB limit
        return res.status(413).json({
          error: 'Content too large',
          message: 'Maximum content size is 10 MB',
          code: 'PAYLOAD_TOO_LARGE',
        });
      }

      // Create document (associated with bot)
      const doc = await storage.createDocument({
        title: title || 'Untitled Document',
        content,
        is_public: true, // Bot uploads are public
        metadata: {
          ...metadata,
          ingested_by_bot: req.bot!.id,
          ingested_at: new Date().toISOString(),
        },
      });

      // Create processing job
      const job = await storage.createDocumentJob({
        document_id: doc.id,
        status: 'queued',
      });

      // TODO: Trigger background processing worker

      res.status(201).json({
        document_id: doc.id,
        job_id: job.id,
        status: 'queued',
        message: 'Document received and queued for processing',
        status_url: `/api/documents/${doc.id}/status`,
      });
    } catch (error) {
      console.error('Ingest error:', error);
      res.status(500).json({
        error: 'Ingest failed',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  // Mount API router
  app.use('/api', api);

  return httpServer;
}
