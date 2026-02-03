/**
 * Database Seeding Script
 * Run with: npm run seed-db
 *
 * Seeds:
 * - Admin user (username: admin, password: admin123)
 * - Sample public document with chunks
 */

import { db, testConnection } from '../server/db';
import { users, documents, chunks, document_jobs } from '../shared/schema';
import { storage } from '../server/storage';

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Database connection failed. Check DATABASE_URL in .env');
    process.exit(1);
  }

  try {
    // 1. Create admin user
    console.log('Creating admin user...');
    const existingAdmin = await storage.getUserByUsername('admin');

    if (!existingAdmin) {
      // In production, hash password with bcrypt
      // For now, using plain text (UNSAFE - replace in prod)
      const admin = await storage.createUser({
        username: 'admin',
        password: 'admin123', // TODO: Hash with bcrypt
        email: 'admin@wrbt.local',
        role: 'admin',
      });
      console.log('✅ Admin user created:', admin.username);
    } else {
      console.log('⏭️  Admin user already exists');
    }

    // 2. Create sample document
    console.log('\nCreating sample document...');
    const sampleDoc = await storage.createDocument({
      title: 'Welcome to WRBT_01',
      content: `# Welcome to WRBT_01

WRBT_01 is a bot-friendly document analysis platform inspired by OpenClaw's security model.

## Features

- **Bot Registration**: Pairing-code based registration with admin approval
- **Public Read Access**: All documents are publicly readable (no auth required)
- **Bot Write Access**: Approved bots can ingest documents via API
- **Audit Logging**: All bot requests are logged for security

## Getting Started

### For Bots

1. Register: POST /api/bots/register
2. Wait for admin approval
3. Poll status: GET /api/bots/status/:code
4. Receive API token
5. Use token: Authorization: Bearer <token>

### For Admins

1. Login at /admin (username: admin, password: admin123)
2. View pending bot registrations
3. Approve or reject bots
4. Monitor bot activity

## API Endpoints

- GET /api/documents - List public documents
- GET /api/documents/:id - Get document details
- GET /api/documents/:id/chunks - Get document chunks
- POST /api/ingest - Ingest document (bot auth required)

---

Generated: ${new Date().toISOString()}`,
      is_public: true,
      metadata: {
        source: 'seed',
        category: 'documentation',
      },
    });
    console.log('✅ Sample document created:', sampleDoc.id);

    // 3. Create chunks for sample document
    console.log('\nCreating chunks...');
    const chunkContents = [
      '# Welcome to WRBT_01\n\nWRBT_01 is a bot-friendly document analysis platform inspired by OpenClaw\'s security model.',
      '## Features\n\n- **Bot Registration**: Pairing-code based registration with admin approval\n- **Public Read Access**: All documents are publicly readable (no auth required)',
      '- **Bot Write Access**: Approved bots can ingest documents via API\n- **Audit Logging**: All bot requests are logged for security',
      '## Getting Started\n\n### For Bots\n\n1. Register: POST /api/bots/register\n2. Wait for admin approval\n3. Poll status: GET /api/bots/status/:code',
      '### For Admins\n\n1. Login at /admin (username: admin, password: admin123)\n2. View pending bot registrations\n3. Approve or reject bots',
    ];

    for (let i = 0; i < chunkContents.length; i++) {
      await db.insert(chunks).values({
        document_id: sampleDoc.id,
        content: chunkContents[i],
        position: i,
        metadata: {
          tokens: chunkContents[i].split(/\s+/).length,
          char_count: chunkContents[i].length,
        },
      });
    }
    console.log(`✅ Created ${chunkContents.length} chunks`);

    // 4. Create completed job for sample document
    console.log('\nCreating sample job...');
    const job = await storage.createDocumentJob({
      document_id: sampleDoc.id,
      status: 'done',
    });

    await db.update(document_jobs)
      .set({
        started_at: new Date(Date.now() - 60000), // Started 1 minute ago
        completed_at: new Date(),
        progress: 100,
      })
      .where(eq(document_jobs.id, job.id));

    console.log('✅ Sample job created:', job.id);

    console.log('\n✅ Seeding complete!\n');
    console.log('📊 Summary:');
    console.log('  - Admin user: admin / admin123');
    console.log('  - Sample document ID:', sampleDoc.id);
    console.log('  - Chunks:', chunkContents.length);
    console.log('\n🔗 Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Test: curl http://localhost:5000/api/healthz');
    console.log('  3. Register bot: curl -X POST http://localhost:5000/api/bots/register -H "Content-Type: application/json" -d \'{"name":"TestBot"}\'');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Import eq from drizzle-orm
import { eq } from 'drizzle-orm';

seed();
