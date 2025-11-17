import { Controller, Post, Body, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import {
  GenerateChallengeDto,
  VerifySignatureDto,
  RefreshTokenDto,
  LogoutDto,
  UpdateProfileDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('challenge')
  @HttpCode(HttpStatus.OK)
  async generateChallenge(@Body() dto: GenerateChallengeDto) {
    return this.authService.generateChallenge(dto.walletAddress);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifySignature(@Body() dto: VerifySignatureDto) {
    return this.authService.verifyAndLogin(dto.message, dto.signature);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: LogoutDto) {
    await this.authService.logout(dto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.sub, dto);
  }
}
