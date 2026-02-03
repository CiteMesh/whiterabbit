import { eq, and, desc, asc, isNull } from 'drizzle-orm';
import { db } from './db';
import {
  type User,
  type InsertUser,
  type Bot,
  type InsertBot,
  type Document,
  type InsertDocument,
  type Chunk,
  type DocumentJob,
  type BotRequest,
  type BotAllowlistEntry,
  type InsertAllowlistEntry,
  users,
  bots,
  documents,
  chunks,
  document_jobs,
  bot_requests,
  bot_allowlist,
} from '../shared/schema';
import { generateApiKey, hashApiKey, compareApiKey } from './utils/crypto';

// ============================================================================
// Storage Interface
// ============================================================================

export interface IStorage {
  // User methods (Admin Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Bot methods
  createBot(bot: InsertBot & { pairing_code: string; pairing_expires_at: Date; metadata?: any }): Promise<Bot>;
  getBotById(id: string): Promise<Bot | undefined>;
  getAllBots(): Promise<Bot[]>;
  getBotByPairingCode(code: string): Promise<Bot | undefined>;
  getBotByToken(token: string): Promise<Bot | undefined>;
  updateBot(id: string, data: Partial<Bot>): Promise<void>;
  getBotsByStatus(status: string): Promise<Bot[]>;

  // Pairing code rate limiting
  countPendingPairingCodesByIP(ipAddress: string): Promise<number>;

  // Bot allowlist methods
  getAllowlistEntry(platform: string, platformUserId: string): Promise<BotAllowlistEntry | undefined>;
  createAllowlistEntry(entry: InsertAllowlistEntry): Promise<BotAllowlistEntry>;
  getAllowlist(): Promise<BotAllowlistEntry[]>;
  revokeAllowlistEntry(id: string, revokedBy: string, reason: string): Promise<void>;
  isUserAllowlisted(platform: string, platformUserId: string): Promise<boolean>;

  // Bot request logging
  logBotRequest(data: Omit<BotRequest, 'id' | 'created_at'>): Promise<void>;
  getBotRequests(botId: string, limit?: number, offset?: number): Promise<BotRequest[]>;

  // Document methods
  getPublicDocuments(options: { limit: number; offset: number }): Promise<Document[]>;
  getDocumentById(id: string): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;

  // Chunk methods
  getChunksByDocumentId(documentId: string): Promise<Chunk[]>;

  // Job methods
  getLatestJobByDocumentId(documentId: string): Promise<DocumentJob | undefined>;
  createDocumentJob(data: { document_id: string; status: string }): Promise<DocumentJob>;

  // Health check
  healthCheck(): Promise<boolean>;
}

// ============================================================================
// Database Storage Implementation
// ============================================================================

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Bot methods
  async createBot(botData: InsertBot & { pairing_code: string; pairing_expires_at: Date }): Promise<Bot> {
    const [bot] = await db.insert(bots).values({
      ...botData,
      status: 'pending',
      tier: 'READ_ONLY',
    }).returning();
    return bot;
  }

  async getBotById(id: string): Promise<Bot | undefined> {
    const result = await db.query.bots.findFirst({
      where: eq(bots.id, id),
    });
    return result;
  }

  async getAllBots(): Promise<Bot[]> {
    const result = await db.query.bots.findMany({
      orderBy: [desc(bots.created_at)],
    });
    return result;
  }

  async getBotByPairingCode(code: string): Promise<Bot | undefined> {
    const result = await db.query.bots.findFirst({
      where: eq(bots.pairing_code, code),
    });
    return result;
  }

  async getBotByToken(token: string): Promise<Bot | undefined> {
    // Find all approved bots and compare tokens
    const allBots = await db.query.bots.findMany({
      where: and(
        eq(bots.status, 'approved'),
      ),
    });

    // Compare token with each bot's hashed token
    for (const bot of allBots) {
      if (bot.token && compareApiKey(token, bot.token)) {
        return bot;
      }
    }

    return undefined;
  }

  async updateBot(id: string, data: Partial<Bot>): Promise<void> {
    await db.update(bots)
      .set({ ...data, updated_at: new Date() })
      .where(eq(bots.id, id));
  }

  async getBotsByStatus(status: string): Promise<Bot[]> {
    const result = await db.query.bots.findMany({
      where: eq(bots.status, status),
      orderBy: [desc(bots.created_at)],
    });
    return result;
  }

  // Pairing code rate limiting
  async countPendingPairingCodesByIP(ipAddress: string): Promise<number> {
    // Count bots with pending status and valid (non-expired) pairing codes from this IP
    // IP is stored in metadata.ip_address during pairing request
    const pendingBots = await db.query.bots.findMany({
      where: and(
        eq(bots.status, 'pending'),
      ),
    });

    // Filter for matching IP and non-expired codes
    const now = new Date();
    const validPendingFromIP = pendingBots.filter(bot => {
      const metadata = bot.metadata as { ip_address?: string } | null;
      const matchesIP = metadata?.ip_address === ipAddress;
      const notExpired = bot.pairing_expires_at && bot.pairing_expires_at > now;
      return matchesIP && notExpired;
    });

    return validPendingFromIP.length;
  }

  // Bot request logging
  async logBotRequest(data: Omit<BotRequest, 'id' | 'created_at'>): Promise<void> {
    await db.insert(bot_requests).values(data);
  }

  async getBotRequests(botId: string, limit: number = 50, offset: number = 0): Promise<BotRequest[]> {
    const result = await db.query.bot_requests.findMany({
      where: eq(bot_requests.bot_id, botId),
      limit,
      offset,
      orderBy: [desc(bot_requests.created_at)],
    });
    return result;
  }

  // Document methods
  async getPublicDocuments(options: { limit: number; offset: number }): Promise<Document[]> {
    const result = await db.query.documents.findMany({
      where: eq(documents.is_public, true),
      limit: options.limit,
      offset: options.offset,
      orderBy: [desc(documents.created_at)],
    });
    return result;
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    const result = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    });
    return result;
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(doc).returning();
    return document;
  }

  // Chunk methods
  async getChunksByDocumentId(documentId: string): Promise<Chunk[]> {
    const result = await db.query.chunks.findMany({
      where: eq(chunks.document_id, documentId),
      orderBy: [asc(chunks.position)],
    });
    return result;
  }

  // Job methods
  async getLatestJobByDocumentId(documentId: string): Promise<DocumentJob | undefined> {
    const result = await db.query.document_jobs.findFirst({
      where: eq(document_jobs.document_id, documentId),
      orderBy: [desc(document_jobs.created_at)],
    });
    return result;
  }

  async createDocumentJob(data: { document_id: string; status: string }): Promise<DocumentJob> {
    const [job] = await db.insert(document_jobs).values(data).returning();
    return job;
  }

  // Bot allowlist methods
  async getAllowlistEntry(platform: string, platformUserId: string): Promise<BotAllowlistEntry | undefined> {
    const result = await db.query.bot_allowlist.findFirst({
      where: and(
        eq(bot_allowlist.platform, platform),
        eq(bot_allowlist.platform_user_id, platformUserId),
        isNull(bot_allowlist.revoked_at),
      ),
    });
    return result;
  }

  async createAllowlistEntry(entry: InsertAllowlistEntry): Promise<BotAllowlistEntry> {
    const [allowlistEntry] = await db.insert(bot_allowlist).values(entry).returning();
    return allowlistEntry;
  }

  async getAllowlist(): Promise<BotAllowlistEntry[]> {
    const result = await db.query.bot_allowlist.findMany({
      where: isNull(bot_allowlist.revoked_at),
      orderBy: [desc(bot_allowlist.created_at)],
    });
    return result;
  }

  async revokeAllowlistEntry(id: string, revokedBy: string, reason: string): Promise<void> {
    await db.update(bot_allowlist)
      .set({
        revoked_at: new Date(),
        revoked_by: revokedBy,
        revoked_reason: reason,
        updated_at: new Date(),
      })
      .where(eq(bot_allowlist.id, id));
  }

  async isUserAllowlisted(platform: string, platformUserId: string): Promise<boolean> {
    const entry = await this.getAllowlistEntry(platform, platformUserId);
    if (!entry) return false;

    // Check if expired (if expiry is set)
    if (entry.expires_at && entry.expires_at < new Date()) {
      return false;
    }

    return true;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await db.select().from(users).limit(1);
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storage: IStorage = new DbStorage();
