import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../domain/user.repository';
import { SiweService } from '../infrastructure/siwe.service';
import { AuthJwtService, TokenPair } from './jwt.service';

// In-memory store for nonces (in production, use Redis)
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly siweService: SiweService,
    private readonly jwtService: AuthJwtService,
  ) {
    // Clean up expired nonces every 5 minutes
    setInterval(() => this.cleanupExpiredNonces(), 5 * 60 * 1000);
  }

  async generateChallenge(walletAddress: string): Promise<{ message: string; nonce: string }> {
    const nonce = this.siweService.generateNonce();
    const message = this.siweService.createMessage(walletAddress, nonce);

    // Store nonce with 10-minute expiration
    nonceStore.set(walletAddress.toLowerCase(), {
      nonce,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return { message, nonce };
  }

  async verifyAndLogin(message: string, signature: string): Promise<TokenPair & { user: any }> {
    // Verify SIWE signature
    const walletAddress = await this.siweService.verifyMessage(message, signature);

    // Get or create user
    let user = await this.userRepository.findByWalletAddress(walletAddress);
    if (!user) {
      user = await this.userRepository.create(walletAddress);
    }

    // Generate JWT tokens
    const tokens = await this.jwtService.generateTokenPair(user.id, user.walletAddress);

    // Clean up nonce
    nonceStore.delete(walletAddress);

    return {
      ...tokens,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        profilePicture: user.profilePicture,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyRefreshToken(refreshToken);

      // Get user
      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Revoke old refresh token
      await this.jwtService.revokeRefreshToken(refreshToken);

      // Generate new token pair
      return await this.jwtService.generateTokenPair(user.id, user.walletAddress);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.jwtService.revokeRefreshToken(refreshToken);
  }

  async updateProfile(userId: string, data: { username?: string; profilePicture?: string }): Promise<any> {
    const user = await this.userRepository.update(userId, data);
    return {
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      profilePicture: user.profilePicture,
    };
  }

  private cleanupExpiredNonces(): void {
    const now = Date.now();
    for (const [address, data] of nonceStore.entries()) {
      if (data.expiresAt < now) {
        nonceStore.delete(address);
      }
    }
  }
}
