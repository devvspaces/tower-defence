import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { GameService } from '../application/game.service';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtPayload } from '@/modules/auth/application/jwt.service';
import { RecordGameDto } from './dto/game.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('record')
  @UseGuards(JwtAuthGuard)
  async recordGame(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RecordGameDto,
  ) {
    const game = await this.gameService.recordGame(
      user.sub,
      dto.score,
      dto.wavesCompleted,
      dto.gameState,
      new Date(dto.startedAt),
      new Date(dto.completedAt),
    );

    return {
      gameId: game.id,
      score: game.score,
      wavesCompleted: game.wavesCompleted,
    };
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    const leaderboard = await this.gameService.getLeaderboard(
      limit ? parseInt(limit, 10) : 100,
    );

    return {
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.username || `Player ${entry.walletAddress.slice(0, 6)}`,
        walletAddress: entry.walletAddress,
        score: entry.score,
        wavesCompleted: entry.wavesCompleted,
        completedAt: entry.completedAt,
      })),
    };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
  ) {
    const games = await this.gameService.getUserGames(
      user.sub,
      limit ? parseInt(limit, 10) : 10,
    );

    return {
      games: games.map(game => ({
        id: game.id,
        score: game.score,
        wavesCompleted: game.wavesCompleted,
        startedAt: game.startedAt,
        completedAt: game.completedAt,
      })),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getGame(@Param('id') id: string) {
    const game = await this.gameService.getGameById(id);
    if (!game) {
      return { error: 'Game not found' };
    }

    return {
      id: game.id,
      score: game.score,
      wavesCompleted: game.wavesCompleted,
      gameState: game.gameState,
      startedAt: game.startedAt,
      completedAt: game.completedAt,
    };
  }
}
