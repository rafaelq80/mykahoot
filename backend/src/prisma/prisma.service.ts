import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString: process.env['DATABASE_URL'] as string,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      keepAlive: true,
    });

    pool.on('error', (err) => {
      this.logger.error('Unexpected idle client error on pg pool', err);
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });

    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
  }

  /** Reconnects when Neon/pg drops an idle connection mid-request. */
  async withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        const message = err instanceof Error ? err.message : String(err);
        const retryable =
          message.includes('Connection terminated') ||
          message.includes('connection closed') ||
          message.includes('ECONNRESET');

        if (!retryable || attempt === retries) break;

        this.logger.warn(
          `DB query failed (attempt ${attempt + 1}/${retries + 1}), reconnecting…`,
        );
        try {
          await this.$disconnect();
          await this.$connect();
        } catch (connectErr) {
          this.logger.error('Failed to reconnect Prisma client', connectErr);
        }
      }
    }
    throw lastError;
  }
}
