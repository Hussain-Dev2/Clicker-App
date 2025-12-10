/**
 * Prisma Client Configuration
 * 
 * This module initializes and exports a singleton Prisma Client instance.
 * The singleton pattern ensures we don't create multiple database connections
 * during development with hot module replacement (HMR).
 * 
 * Features:
 * - Global instance caching to prevent connection leaks
 * - Environment-specific logging (verbose in dev, minimal in prod)
 * - Connection pooling via DATABASE_URL
 * - TypeScript type safety for all database operations
 * 
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

import { PrismaClient } from '@prisma/client';

/**
 * Global prisma instance declaration
 * Prevents multiple instances in development due to hot reload
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Singleton Prisma Client Instance
 * 
 * Configuration:
 * - datasourceUrl: Connection string from environment variable
 * - log: Query and error logging based on environment
 *   - Development: ['error', 'warn'] for debugging
 *   - Production: ['error'] to minimize noise
 * 
 * Connection Pooling:
 * Supabase pooler uses port 6543 for connection pooling.
 * Direct connections use port 5432 but may have limitations.
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

/**
 * Cache the Prisma instance globally in non-production environments
 * This prevents Next.js hot reload from creating new connections
 */
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;