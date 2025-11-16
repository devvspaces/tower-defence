import { Inject, Injectable } from '@nestjs/common';
import { eq, lt } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/shared/database/database.module';
import { Database } from '@/shared/database/connection';
import { refreshTokens } from '@/shared/database/schema';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async create(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.db.insert(refreshTokens).values({
      userId,
      token,
      expiresAt,
    });
  }

  async findByToken(token: string): Promise<{ userId: string; expiresAt: Date } | null> {
    const [result] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token));

    return result ? { userId: result.userId, expiresAt: result.expiresAt } : null;
  }

  async deleteByToken(token: string): Promise<void> {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteExpired(): Promise<void> {
    await this.db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, new Date()));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }
}
