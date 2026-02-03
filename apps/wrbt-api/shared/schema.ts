import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// Users Table (Admin Auth)
// ============================================================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // bcrypt hashed
  email: text("email").unique(),
  role: text("role").notNull().default("user"), // 'admin' | 'user'
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============================================================================
// Bots Table (Bot Authentication)
// ============================================================================

export const bots = pgTable("bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contact_email: text("contact_email"),
  user_agent: text("user_agent"),
  token: text("token").unique(), // API key (bcrypt hashed)
  tier: text("tier").notNull().default("READ_ONLY"), // READ_ONLY | WRITE_LIMITED
  status: text("status").notNull().default("pending"), // pending | approved | revoked
  pairing_code: text("pairing_code").unique(),
  pairing_expires_at: timestamp("pairing_expires_at"),
  approved_at: timestamp("approved_at"),
  approved_by: varchar("approved_by").references(() => users.id),
  revoked_at: timestamp("revoked_at"),
  revoked_reason: text("revoked_reason"),
  metadata: jsonb("metadata"), // { platform: "discord", discord_user_id: "..." }
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBotSchema = createInsertSchema(bots).pick({
  name: true,
  contact_email: true,
  user_agent: true,
});

export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof bots.$inferSelect;

// ============================================================================
// Bot Requests (Audit Log)
// ============================================================================

export const bot_requests = pgTable("bot_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bot_id: varchar("bot_id").references(() => bots.id),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  status_code: integer("status_code"),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  response_time_ms: integer("response_time_ms"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type BotRequest = typeof bot_requests.$inferSelect;

// ============================================================================
// Documents Table
// ============================================================================

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content"),
  user_id: varchar("user_id").references(() => users.id),
  is_public: boolean("is_public").notNull().default(false),
  metadata: jsonb("metadata"), // { byte_size, content_type, source_url, etc. }
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  content: true,
  is_public: true,
  metadata: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// ============================================================================
// Chunks Table
// ============================================================================

export const chunks = pgTable("chunks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  document_id: varchar("document_id").references(() => documents.id).notNull(),
  content: text("content").notNull(),
  position: integer("position").notNull(),
  metadata: jsonb("metadata"), // { tokens, char_count, etc. }
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type Chunk = typeof chunks.$inferSelect;

// ============================================================================
// Embeddings Table
// ============================================================================

export const embeddings = pgTable("embeddings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chunk_id: varchar("chunk_id").references(() => chunks.id).notNull(),
  vector: text("vector").notNull(), // JSON array for now, pgvector in production
  model: text("model").notNull().default("text-embedding-3-small"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type Embedding = typeof embeddings.$inferSelect;

// ============================================================================
// Document Jobs Table
// ============================================================================

export const document_jobs = pgTable("document_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  document_id: varchar("document_id").references(() => documents.id).notNull(),
  status: text("status").notNull().default("queued"), // queued | processing | done | failed
  error_message: text("error_message"),
  progress: integer("progress").default(0), // 0-100
  started_at: timestamp("started_at"),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type DocumentJob = typeof document_jobs.$inferSelect;

// ============================================================================
// Bot Integrations (Discord, Claude, etc.)
// ============================================================================

export const bot_integrations = pgTable("bot_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bot_id: varchar("bot_id").references(() => bots.id).notNull(),
  platform: text("platform").notNull(), // discord | slack | telegram | claude
  platform_user_id: text("platform_user_id").notNull(),
  platform_username: text("platform_username"),
  status: text("status").notNull().default("pending"), // pending | approved | revoked
  pairing_code: text("pairing_code"),
  approved_at: timestamp("approved_at"),
  metadata: jsonb("metadata"), // { server_id, channel_id, etc. }
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type BotIntegration = typeof bot_integrations.$inferSelect;

// ============================================================================
// Bot Allowlist (Pre-approved Platform Users)
// ============================================================================

export const bot_allowlist = pgTable("bot_allowlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(), // discord | slack | telegram | claude | github
  platform_user_id: text("platform_user_id").notNull(),
  platform_username: text("platform_username"),
  tier: text("tier").notNull().default("READ_ONLY"), // READ_ONLY | WRITE_LIMITED
  reason: text("reason"), // Why this user is allowlisted
  added_by: varchar("added_by").references(() => users.id).notNull(),
  expires_at: timestamp("expires_at"), // Optional expiry for temporary allowlist
  revoked_at: timestamp("revoked_at"),
  revoked_by: varchar("revoked_by").references(() => users.id),
  revoked_reason: text("revoked_reason"),
  metadata: jsonb("metadata"), // Extra platform-specific data
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAllowlistSchema = createInsertSchema(bot_allowlist).pick({
  platform: true,
  platform_user_id: true,
  platform_username: true,
  tier: true,
  reason: true,
  added_by: true,
  expires_at: true,
});

export type BotAllowlistEntry = typeof bot_allowlist.$inferSelect;
export type InsertAllowlistEntry = z.infer<typeof insertAllowlistSchema>;
