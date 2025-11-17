import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/shared/database/database.module';
import { Database } from '@/shared/database/connection';
import { chatMessages, users } from '@/shared/database/schema';

export interface ChatMessage {
  id: string;
  userId: string;
  walletAddress: string;
  username: string | null;
  message: string;
  createdAt: Date;
}

@Injectable()
export class ChatService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async createMessage(userId: string, message: string): Promise<ChatMessage> {
    const [result] = await this.db
      .insert(chatMessages)
      .values({
        userId,
        message,
      })
      .returning();

    // Get user info
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    return {
      id: result.id,
      userId: result.userId,
      walletAddress: user.walletAddress,
      username: user.username,
      message: result.message,
      createdAt: result.createdAt,
    };
  }

  async getRecentMessages(limit: number = 50): Promise<ChatMessage[]> {
    const results = await this.db
      .select({
        id: chatMessages.id,
        userId: chatMessages.userId,
        walletAddress: users.walletAddress,
        username: users.username,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    return results.reverse(); // Return in chronological order
  }
}
