import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './application/auth.service';
import { AuthJwtService } from './application/jwt.service';
import { SiweService } from './infrastructure/siwe.service';
import { UserRepositoryImpl } from './infrastructure/user.repository.impl';
import { RefreshTokenRepository } from './infrastructure/refresh-token.repository';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { USER_REPOSITORY } from './domain/user.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRY') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthJwtService,
    SiweService,
    RefreshTokenRepository,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [AuthService, AuthJwtService, USER_REPOSITORY],
})
export class AuthModule {}
