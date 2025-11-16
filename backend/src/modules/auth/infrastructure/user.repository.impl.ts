import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/shared/database/database.module';
import { Database } from '@/shared/database/connection';
import { users } from '@/shared/database/schema';
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.walletAddress, walletAddress.toLowerCase()));

    return result ? this.toDomain(result) : null;
  }

  async findById(id: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return result ? this.toDomain(result) : null;
  }

  async create(walletAddress: string): Promise<User> {
    const [result] = await this.db
      .insert(users)
      .values({
        walletAddress: walletAddress.toLowerCase(),
        username: null,
        profilePicture: null,
      })
      .returning();

    return this.toDomain(result);
  }

  async update(user: User): Promise<User> {
    const [result] = await this.db
      .update(users)
      .set({
        username: user.username,
        profilePicture: user.profilePicture,
        updatedAt: user.updatedAt,
      })
      .where(eq(users.id, user.id))
      .returning();

    return this.toDomain(result);
  }

  private toDomain(data: typeof users.$inferSelect): User {
    return new User(
      data.id,
      data.walletAddress,
      data.username,
      data.profilePicture,
      data.createdAt,
      data.updatedAt,
    );
  }
}
