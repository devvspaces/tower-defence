import { Module } from '@nestjs/common';
import { ProgressionController } from './presentation/progression.controller';
import { ProgressionService } from './application/progression.service';
import { XPCalculationService } from './application/xp-calculation.service';
import { DatabaseModule } from '../../shared/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProgressionController],
  providers: [ProgressionService, XPCalculationService],
  exports: [ProgressionService, XPCalculationService],
})
export class ProgressionModule {}
