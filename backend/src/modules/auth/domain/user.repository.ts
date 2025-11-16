import { User } from './user.entity';

export interface UserRepository {
  findByWalletAddress(walletAddress: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(walletAddress: string): Promise<User>;
  update(user: User): Promise<User>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
