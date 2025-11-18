import { Module } from '@nestjs/common';
import { GameController } from './presentation/game.controller';
import { GameService } from './application/game.service';
import { GameRepositoryImpl } from './infrastructure/game.repository.impl';
import { GAME_REPOSITORY } from './domain/game.repository';
import { ProgressionModule } from '../progression/progression.module';

@Module({
  imports: [ProgressionModule],
  controllers: [GameController],
  providers: [
    GameService,
    {
      provide: GAME_REPOSITORY,
      useClass: GameRepositoryImpl,
    },
  ],
  exports: [GameService],
})
export class GameModule {}
