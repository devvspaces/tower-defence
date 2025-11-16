export class GenerateChallengeDto {
  walletAddress: string;
}

export class VerifySignatureDto {
  message: string;
  signature: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class LogoutDto {
  refreshToken: string;
}
