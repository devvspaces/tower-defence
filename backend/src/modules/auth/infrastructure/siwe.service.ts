import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SiweMessage } from 'siwe';

@Injectable()
export class SiweService {
  constructor(private readonly configService: ConfigService) {}

  generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  async verifyMessage(message: string, signature: string): Promise<string> {
    try {
      const siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature });

      if (!fields.success) {
        throw new Error('Invalid signature');
      }

      // Verify domain and URI
      const expectedDomain = this.configService.get('SIWE_DOMAIN') || 'localhost';
      const expectedUri = this.configService.get('SIWE_URI') || 'http://localhost:3000';

      if (siweMessage.domain !== expectedDomain) {
        throw new Error('Invalid domain');
      }

      if (!siweMessage.uri.startsWith(expectedUri)) {
        throw new Error('Invalid URI');
      }

      // Check expiration
      if (siweMessage.expirationTime && new Date(siweMessage.expirationTime) < new Date()) {
        throw new Error('Message expired');
      }

      // Check not before
      if (siweMessage.notBefore && new Date(siweMessage.notBefore) > new Date()) {
        throw new Error('Message not yet valid');
      }

      return siweMessage.address.toLowerCase();
    } catch (error) {
      throw new Error(`SIWE verification failed: ${error.message}`);
    }
  }

  createMessage(address: string, nonce: string): string {
    const domain = this.configService.get('SIWE_DOMAIN') || 'localhost';
    const uri = this.configService.get('SIWE_URI') || 'http://localhost:3000';

    const message = new SiweMessage({
      domain,
      address,
      statement: 'Sign in to Tower Defence Game',
      uri,
      version: '1',
      chainId: 1, // Mainnet, but signature works for all chains
      nonce,
      issuedAt: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    });

    return message.prepareMessage();
  }
}
