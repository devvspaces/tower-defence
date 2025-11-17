import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthJwtService } from '../auth/application/jwt.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: AuthJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const data = context.switchToWs().getData();

      // Token should already be verified in handleConnection
      // This guard is for additional message-level verification if needed
      return !!client.userId;
    } catch {
      return false;
    }
  }
}
